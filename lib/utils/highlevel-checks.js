"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = exports.acquire = exports.devices = exports.version = exports.info = void 0;
const ERROR = 'Wrong result type.';
function info(res) {
    if (typeof res !== `object` || res == null) {
        throw new Error(`Wrong result type.`);
    }
    const { version } = res;
    if (typeof version !== `string`) {
        throw new Error(ERROR);
    }
    const configured = !!res.configured;
    return { version, configured };
}
exports.info = info;
function version(version) {
    if (typeof version !== `string`) {
        throw new Error(ERROR);
    }
    return version.trim();
}
exports.version = version;
function convertSession(r) {
    if (r == null) {
        return null;
    }
    if (typeof r !== `string`) {
        throw new Error(ERROR);
    }
    return r;
}
function devices(res) {
    if (typeof res !== `object`) {
        throw new Error(ERROR);
    }
    if (!(res instanceof Array)) {
        throw new Error(ERROR);
    }
    return res.map((o) => {
        if (typeof o !== `object` || o == null) {
            throw new Error(ERROR);
        }
        const { path } = o;
        if (typeof path !== `string`) {
            throw new Error(ERROR);
        }
        const pathS = path.toString();
        return {
            path: pathS,
            session: convertSession(o.session),
            debugSession: convertSession(o.debugSession),
            product: o.product,
            vendor: o.vendor,
            debug: !!o.debug,
        };
    });
}
exports.devices = devices;
function acquire(res) {
    if (typeof res !== `object` || res == null) {
        throw new Error(ERROR);
    }
    const { session } = res;
    if (typeof session !== `string` && typeof session !== `number`) {
        throw new Error(ERROR);
    }
    return session.toString();
}
exports.acquire = acquire;
function call(res) {
    if (typeof res !== `object` || res == null) {
        throw new Error(ERROR);
    }
    const { type } = res;
    if (typeof type !== `string`) {
        throw new Error(ERROR);
    }
    const { message } = res;
    if (typeof message !== `object` || message == null) {
        throw new Error(ERROR);
    }
    return { type, message };
}
exports.call = call;
