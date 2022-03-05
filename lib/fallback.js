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
class FallbackTransport {
    constructor(transports) {
        this.name = `FallbackTransport`;
        this.activeName = ``;
        this.debug = false;
        this.requestNeeded = false;
        this.transports = transports;
    }
    _tryInitTransports() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = [];
            let lastError = null;
            for (const transport of this.transports) {
                try {
                    yield transport.init(this.debug);
                    res.push(transport);
                }
                catch (e) {
                    lastError = e;
                }
            }
            if (res.length === 0) {
                throw lastError || new Error(`No transport could be initialized.`);
            }
            return res;
        });
    }
    _tryConfigureTransports(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastError = null;
            for (const transport of this._availableTransports) {
                try {
                    yield transport.configure(data);
                    return transport;
                }
                catch (e) {
                    lastError = e;
                }
            }
            throw lastError || new Error(`No transport could be initialized.`);
        });
    }
    init(debug) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug = !!debug;
            const transports = yield this._tryInitTransports();
            this._availableTransports = transports;
            this.version = transports[0].version;
            this.configured = false;
        });
    }
    configure(signedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pt = this._tryConfigureTransports(signedData);
            this.activeTransport = yield pt;
            this.configured = this.activeTransport.configured;
            this.version = this.activeTransport.version;
            this.activeName = this.activeTransport.name;
            this.requestNeeded = this.activeTransport.requestNeeded;
            this.isOutdated = this.activeTransport.isOutdated;
        });
    }
    enumerate() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.enumerate();
        });
    }
    listen(old) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.listen(old);
        });
    }
    acquire(input, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.acquire(input, debugLink);
        });
    }
    release(session, onclose, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.release(session, onclose, debugLink);
        });
    }
    call(session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.call(session, name, data, debugLink);
        });
    }
    post(session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.post(session, name, data, debugLink);
        });
    }
    read(session, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.read(session, debugLink);
        });
    }
    requestDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.activeTransport.requestDevice();
        });
    }
    setBridgeLatestUrl(url) {
        for (const transport of this.transports) {
            transport.setBridgeLatestUrl(url);
        }
    }
    setBridgeLatestVersion(version) {
        for (const transport of this.transports) {
            transport.setBridgeLatestVersion(version);
        }
    }
    stop() {
        for (const transport of this.transports) {
            transport.stop();
        }
    }
}
exports.default = FallbackTransport;
