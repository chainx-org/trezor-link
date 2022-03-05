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
const http_1 = require("./http");
const check = require("../utils/highlevel-checks");
const semver_compare_1 = require("../utils/semver-compare");
const send_1 = require("../lowlevel/send");
const messages_1 = require("../lowlevel/protobuf/messages");
const receive_1 = require("../lowlevel/receive");
const config_1 = require("../config");
class BridgeTransport {
    constructor(url, newestVersionUrl) {
        this.name = `BridgeTransport`;
        this.version = ``;
        this.debug = false;
        this.configured = false;
        this.stopped = false;
        this.requestNeeded = false;
        this.url = url == null ? config_1.DEFAULT_URL : url;
        this.newestVersionUrl = newestVersionUrl == null ? config_1.DEFAULT_VERSION_URL : newestVersionUrl;
    }
    _post(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.stopped) {
                return Promise.reject(`Transport stopped.`);
            }
            return (0, http_1.request)(Object.assign(Object.assign({}, options), { method: `POST`, url: this.url + options.url, skipContentTypeHeader: true }));
        });
    }
    init(debug) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug = !!debug;
            yield this._silentInit();
        });
    }
    _silentInit() {
        return __awaiter(this, void 0, void 0, function* () {
            const infoS = yield (0, http_1.request)({
                url: this.url,
                method: `POST`,
            });
            const info = check.info(infoS);
            this.version = info.version;
            const newVersion = typeof this.bridgeVersion === `string`
                ? this.bridgeVersion
                : check.version(yield (0, http_1.request)({
                    url: `${this.newestVersionUrl}?${Date.now()}`,
                    method: `GET`,
                }));
            this.isOutdated = (0, semver_compare_1.semverCompare)(this.version, newVersion) < 0;
        });
    }
    configure(signedData) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = (0, messages_1.parseConfigure)(signedData);
            this.configured = true;
            this._messages = messages;
        });
    }
    listen(old) {
        return __awaiter(this, void 0, void 0, function* () {
            if (old == null) {
                throw new Error(`Bridge v2 does not support listen without previous.`);
            }
            const devicesS = yield this._post({
                url: `/listen`,
                body: old,
            });
            const devices = check.devices(devicesS);
            return devices;
        });
    }
    enumerate() {
        return __awaiter(this, void 0, void 0, function* () {
            const devicesS = yield this._post({ url: `/enumerate` });
            const devices = check.devices(devicesS);
            return devices;
        });
    }
    _acquireMixed(input, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const previousStr = input.previous == null ? `null` : input.previous;
            const url = `${debugLink ? `/debug` : ``}/acquire/${input.path}/${previousStr}`;
            return this._post({ url });
        });
    }
    acquire(input, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const acquireS = yield this._acquireMixed(input, debugLink);
            return check.acquire(acquireS);
        });
    }
    release(session, onclose, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = this._post({
                url: `${debugLink ? `/debug` : ``}/release/${session}`,
            });
            if (onclose) {
                return;
            }
            yield res;
        });
    }
    call(session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._messages == null) {
                throw new Error(`Transport not configured.`);
            }
            const messages = this._messages;
            const o = (0, send_1.buildOne)(messages, name, data);
            const outData = o.toString(`hex`);
            const resData = yield this._post({
                url: `${debugLink ? `/debug` : ``}/call/${session}`,
                body: outData,
            });
            if (typeof resData !== `string`) {
                throw new Error(`Returning data is not string.`);
            }
            const jsonData = (0, receive_1.receiveOne)(messages, resData);
            return check.call(jsonData);
        });
    }
    post(session, name, data, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._messages == null) {
                throw new Error(`Transport not configured.`);
            }
            const messages = this._messages;
            const outData = (0, send_1.buildOne)(messages, name, data).toString(`hex`);
            yield this._post({
                url: `${debugLink ? `/debug` : ``}/post/${session}`,
                body: outData,
            });
        });
    }
    read(session, debugLink) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._messages == null) {
                throw new Error(`Transport not configured.`);
            }
            const messages = this._messages;
            const resData = yield this._post({
                url: `${debugLink ? `/debug` : ``}/read/${session}`,
            });
            if (typeof resData !== `string`) {
                throw new Error(`Returning data is not string.`);
            }
            const jsonData = (0, receive_1.receiveOne)(messages, resData);
            return check.call(jsonData);
        });
    }
    static setFetch(fetch, isNode) {
        (0, http_1.setFetch)(fetch, isNode);
    }
    requestDevice() {
        return Promise.reject();
    }
    setBridgeLatestUrl(url) {
        this.newestVersionUrl = url;
    }
    setBridgeLatestVersion(version) {
        this.bridgeVersion = version;
    }
    stop() {
        this.stopped = true;
    }
}
exports.default = BridgeTransport;
