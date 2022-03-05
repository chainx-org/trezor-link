"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectTimeoutPromise = exports.resolveTimeoutPromise = exports.create = void 0;
function create() {
    let localResolve = () => { };
    let localReject = () => { };
    const promise = new Promise((resolve, reject) => {
        localResolve = resolve;
        localReject = reject;
    });
    const rejectingPromise = promise.then(() => {
        throw new Error(`Promise is always rejecting`);
    });
    rejectingPromise.catch(() => { });
    return {
        resolve: localResolve,
        reject: localReject,
        promise,
        rejectingPromise,
    };
}
exports.create = create;
function resolveTimeoutPromise(delay, result) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(result);
        }, delay);
    });
}
exports.resolveTimeoutPromise = resolveTimeoutPromise;
function rejectTimeoutPromise(delay, error) {
    return new Promise((_resolve, reject) => {
        setTimeout(() => {
            reject(error);
        }, delay);
    });
}
exports.rejectTimeoutPromise = rejectTimeoutPromise;
