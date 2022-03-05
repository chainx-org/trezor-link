"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const defered_1 = require("../utils/defered");
const messages_1 = require("./protobuf/messages");
const send_1 = require("./send");
const receive_1 = require("./receive");
const sharedConnectionWorker_1 = require("./sharedConnectionWorker");
const stringify = require('json-stable-stringify');
function stableStringify(devices) {
    if (devices == null) {
        return `null`;
    }
    const pureDevices = devices.map(device => {
        const { path } = device;
        const session = device.session == null ? null : device.session;
        return { path, session };
    });
    return stringify(pureDevices);
}
function compare(a, b) {
    if (!Number.isNaN(parseInt(a.path, 10))) {
        return parseInt(a.path, 10) - parseInt(b.path, 10);
    }
    return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}
const ITER_MAX = 60;
const ITER_DELAY = 500;
class LowlevelTransportWithSharedConnections {
    constructor(plugin, sharedWorkerFactory) {
        this.name = `LowlevelTransportWithSharedConnections`;
        this.debug = false;
        this.deferedDebugOnRelease = {};
        this.deferedNormalOnRelease = {};
        this.configured = false;
        this.stopped = false;
        this._lastStringified = ``;
        this.requestNeeded = false;
        this.latestId = 0;
        this.defereds = {};
        this.isOutdated = false;
        this.plugin = plugin;
        this.version = plugin.version;
        this._sharedWorkerFactory = sharedWorkerFactory;
        if (!this.plugin.allowsWriteAndEnumerate) {
            throw new Error(`Plugin with shared connections cannot disallow write and enumerate`);
        }
    }
    enumerate() {
        return this._silentEnumerate();
    }
    _silentEnumerate() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sendToWorker({ type: `enumerate-intent` });
            let devices = [];
            try {
                devices = yield this.plugin.enumerate();
            }
            finally {
                yield this.sendToWorker({ type: `enumerate-done` });
            }
            const sessionsM = yield this.sendToWorker({
                type: `get-sessions-and-disconnect`,
                devices,
            });
            if (sessionsM.type !== `sessions`) {
                throw new Error(`Wrong reply`);
            }
            const { debugSessions } = sessionsM;
            const { normalSessions } = sessionsM;
            const devicesWithSessions = devices.map(device => {
                const session = normalSessions[device.path];
                const debugSession = debugSessions[device.path];
                return {
                    path: device.path,
                    session,
                    debug: device.debug,
                    debugSession,
                };
            });
            this._releaseDisconnected(devicesWithSessions);
            return devicesWithSessions.sort(compare);
        });
    }
    _releaseDisconnected(devices) {
        const connected = {};
        devices.forEach(device => {
            if (device.session != null) {
                connected[device.session] = true;
            }
        });
        Object.keys(this.deferedDebugOnRelease).forEach(session => {
            if (connected[session] == null) {
                this._releaseCleanup(session, true);
            }
        });
        Object.keys(this.deferedNormalOnRelease).forEach(session => {
            if (connected[session] == null) {
                this._releaseCleanup(session, false);
            }
        });
    }
    listen(old) {
        return __awaiter(this, void 0, void 0, function* () {
            const oldStringified = stableStringify(old);
            const last = old == null ? this._lastStringified : oldStringified;
            return this._runIter(0, last);
        });
    }
    _runIter(iteration, oldStringified) {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = yield this._silentEnumerate();
            const stringified = stableStringify(devices);
            if (stringified !== oldStringified || iteration === ITER_MAX) {
                this._lastStringified = stringified;
                return devices;
            }
            yield (0, defered_1.resolveTimeoutPromise)(ITER_DELAY, null);
            return this._runIter(iteration + 1, stringified);
        });
    }
    acquire(input, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const messBack = yield this.sendToWorker({
                type: `acquire-intent`,
                path: input.path,
                previous: input.previous,
                debug: debugLink,
            });
            if (messBack.type === `wrong-previous-session`) {
                throw new Error(`wrong previous session`);
            }
            if (messBack.type !== `other-session`) {
                throw new Error(`Strange reply`);
            }
            const reset = messBack.otherSession == null;
            try {
                yield this.plugin.connect(input.path, debugLink, reset);
            }
            catch (e) {
                yield this.sendToWorker({ type: `acquire-failed` });
                throw e;
            }
            const messBack2 = yield this.sendToWorker({ type: `acquire-done` });
            if (messBack2.type !== `session-number`) {
                throw new Error(`Strange reply.`);
            }
            const session = messBack2.number;
            if (debugLink) {
                this.deferedDebugOnRelease[session] = (0, defered_1.create)();
            }
            else {
                this.deferedNormalOnRelease[session] = (0, defered_1.create)();
            }
            return session;
        });
    }
    release(session, onclose, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            if (onclose && !debugLink) {
                this.sendToWorker({ type: `release-onclose`, session });
                return;
            }
            const messback = yield this.sendToWorker({
                type: `release-intent`,
                session,
                debug: debugLink,
            });
            if (messback.type === `double-release`) {
                throw new Error(`Trying to double release.`);
            }
            if (messback.type !== `path`) {
                throw new Error(`Strange reply.`);
            }
            const { path } = messback;
            const { otherSession } = messback;
            const last = otherSession == null;
            this._releaseCleanup(session, debugLink);
            try {
                yield this.plugin.disconnect(path, debugLink, last);
            }
            catch (e) {
            }
            yield this.sendToWorker({ type: `release-done` });
        });
    }
    _releaseCleanup(session, debugLink) {
        const table = debugLink ? this.deferedDebugOnRelease : this.deferedNormalOnRelease;
        if (table[session] != null) {
            table[session].reject(new Error(`Device released or disconnected`));
            delete table[session];
        }
    }
    configure(signedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = (0, messages_1.parseConfigure)(signedData);
            this._messages = messages;
            this.configured = true;
        });
    }
    _sendLowlevel(path, debug) {
        return data => this.plugin.send(path, data, debug);
    }
    _receiveLowlevel(path, debug) {
        return () => this.plugin.receive(path, debug);
    }
    messages() {
        if (this._messages == null) {
            throw new Error(`Transport not configured.`);
        }
        return this._messages;
    }
    doWithSession(session, debugLink, inside) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionsM = yield this.sendToWorker({ type: `get-sessions` });
            if (sessionsM.type !== `sessions`) {
                throw new Error(`Wrong reply`);
            }
            const sessionsMM = debugLink ? sessionsM.debugSessions : sessionsM.normalSessions;
            let path_ = null;
            Object.keys(sessionsMM).forEach(kpath => {
                if (sessionsMM[kpath] === session) {
                    path_ = kpath;
                }
            });
            if (path_ == null) {
                throw new Error(`Session not available.`);
            }
            const path = path_;
            const resPromise = yield inside(path);
            const defered = debugLink
                ? this.deferedDebugOnRelease[session]
                : this.deferedNormalOnRelease[session];
            return Promise.race([defered.rejectingPromise, resPromise]);
        });
    }
    call(session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const callInside = (path) => __awaiter(this, void 0, void 0, function* () {
                const messages = this.messages();
                yield (0, send_1.buildAndSend)(messages, this._sendLowlevel(path, debugLink), name, data);
                const message = yield (0, receive_1.receiveAndParse)(messages, this._receiveLowlevel(path, debugLink));
                return message;
            });
            return this.doWithSession(session, debugLink, callInside);
        });
    }
    post(session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const callInside = (path) => __awaiter(this, void 0, void 0, function* () {
                const messages = this.messages();
                yield (0, send_1.buildAndSend)(messages, this._sendLowlevel(path, debugLink), name, data);
            });
            return this.doWithSession(session, debugLink, callInside);
        });
    }
    read(session, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const callInside = (path) => __awaiter(this, void 0, void 0, function* () {
                const messages = this.messages();
                const message = yield (0, receive_1.receiveAndParse)(messages, this._receiveLowlevel(path, debugLink));
                return message;
            });
            return this.doWithSession(session, debugLink, callInside);
        });
    }
    init(debug) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug = !!debug;
            this.requestNeeded = this.plugin.requestNeeded;
            yield this.plugin.init(debug);
            if (this._sharedWorkerFactory != null) {
                this.sharedWorker = this._sharedWorkerFactory();
                if (this.sharedWorker != null) {
                    this.sharedWorker.port.onmessage = e => {
                        this.receiveFromWorker(e.data);
                    };
                }
            }
        });
    }
    requestDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.plugin.requestDevice();
        });
    }
    sendToWorker(message) {
        if (this.stopped) {
            return Promise.reject(`Transport stopped.`);
        }
        this.latestId++;
        const id = this.latestId;
        this.defereds[id] = (0, defered_1.create)();
        if (this.sharedWorker != null) {
            this.sharedWorker.port.postMessage({ id, message });
        }
        else {
            (0, sharedConnectionWorker_1.postModuleMessage)({ id, message }, m => this.receiveFromWorker(m));
        }
        return this.defereds[id].promise;
    }
    receiveFromWorker(m) {
        this.defereds[m.id].resolve(m.message);
        delete this.defereds[m.id];
    }
    setBridgeLatestUrl(url) { }
    setBridgeLatestVersion(version) { }
    stop() {
        this.stopped = true;
        this.sharedWorker = null;
    }
}
exports.default = LowlevelTransportWithSharedConnections;
