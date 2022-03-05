"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postModuleMessage = void 0;
const defered_1 = require("../utils/defered");
if (typeof onconnect !== `undefined`) {
    onconnect = function (e) {
        const port = e.ports[0];
        port.onmessage = function (e) {
            handleMessage(e.data, port);
        };
    };
}
const normalSessions = {};
const debugSessions = {};
let lock = null;
let waitPromise = Promise.resolve();
function startLock() {
    const newLock = (0, defered_1.create)();
    lock = newLock;
    setTimeout(() => newLock.reject(new Error(`Timed out`)), 10 * 1000);
}
function releaseLock(obj) {
    if (lock == null) {
        return;
    }
    lock.resolve(obj);
}
function waitForLock() {
    if (lock == null) {
        return Promise.reject(new Error(`???`));
    }
    return lock.promise;
}
function waitInQueue(fn) {
    const res = waitPromise.then(() => fn());
    waitPromise = res.catch(() => { });
}
function handleMessage({ id, message }, port) {
    if (message.type === `acquire-intent`) {
        const { path } = message;
        const { previous } = message;
        const { debug } = message;
        waitInQueue(() => handleAcquireIntent(path, previous, debug, id, port));
    }
    if (message.type === `acquire-done`) {
        handleAcquireDone(id);
    }
    if (message.type === `acquire-failed`) {
        handleAcquireFailed(id);
    }
    if (message.type === `get-sessions`) {
        waitInQueue(() => handleGetSessions(id, port));
    }
    if (message.type === `get-sessions-and-disconnect`) {
        const { devices } = message;
        waitInQueue(() => handleGetSessions(id, port, devices));
    }
    if (message.type === `release-onclose`) {
        const { session } = message;
        waitInQueue(() => handleReleaseOnClose(session));
    }
    if (message.type === `release-intent`) {
        const { session } = message;
        const { debug } = message;
        waitInQueue(() => handleReleaseIntent(session, debug, id, port));
    }
    if (message.type === `release-done`) {
        handleReleaseDone(id);
    }
    if (message.type === `enumerate-intent`) {
        waitInQueue(() => handleEnumerateIntent(id, port));
    }
    if (message.type === `enumerate-done`) {
        handleReleaseDone(id);
    }
}
function handleEnumerateIntent(id, port) {
    startLock();
    sendBack({ type: `ok` }, id, port);
    return waitForLock().then((obj) => {
        sendBack({ type: `ok` }, obj.id, port);
    });
}
function handleReleaseDone(id) {
    releaseLock({ id });
}
function handleReleaseOnClose(session) {
    let path_ = null;
    Object.keys(normalSessions).forEach(kpath => {
        if (normalSessions[kpath] === session) {
            path_ = kpath;
        }
    });
    if (path_ == null) {
        return Promise.resolve();
    }
    const path = path_;
    delete normalSessions[path];
    delete debugSessions[path];
    return Promise.resolve();
}
function handleReleaseIntent(session, debug, id, port) {
    let path_ = null;
    const sessions = debug ? debugSessions : normalSessions;
    const otherSessions = !debug ? debugSessions : normalSessions;
    Object.keys(sessions).forEach(kpath => {
        if (sessions[kpath] === session) {
            path_ = kpath;
        }
    });
    if (path_ == null) {
        sendBack({ type: `double-release` }, id, port);
        return Promise.resolve();
    }
    const path = path_;
    const otherSession = otherSessions[path];
    startLock();
    sendBack({ type: `path`, path, otherSession }, id, port);
    return waitForLock().then((obj) => {
        delete sessions[path];
        sendBack({ type: `ok` }, obj.id, port);
    });
}
function handleGetSessions(id, port, devices) {
    if (devices != null) {
        const connected = {};
        devices.forEach(d => {
            connected[d.path] = true;
        });
        Object.keys(normalSessions).forEach(path => {
            if (!normalSessions[path]) {
                delete normalSessions[path];
            }
        });
        Object.keys(debugSessions).forEach(path => {
            if (!debugSessions[path]) {
                delete debugSessions[path];
            }
        });
    }
    sendBack({ type: `sessions`, debugSessions, normalSessions }, id, port);
    return Promise.resolve();
}
let lastSession = 0;
function handleAcquireDone(id) {
    releaseLock({ good: true, id });
}
function handleAcquireFailed(id) {
    releaseLock({ good: false, id });
}
function handleAcquireIntent(path, previous, debug, id, port) {
    let error = false;
    const thisTable = debug ? debugSessions : normalSessions;
    const otherTable = !debug ? debugSessions : normalSessions;
    const realPrevious = thisTable[path];
    if (realPrevious == null) {
        error = previous != null;
    }
    else {
        error = previous !== realPrevious;
    }
    if (error) {
        sendBack({ type: `wrong-previous-session` }, id, port);
        return Promise.resolve();
    }
    startLock();
    sendBack({ type: `other-session`, otherSession: otherTable[path] }, id, port);
    return waitForLock().then((obj) => {
        if (obj.good) {
            lastSession++;
            let session = lastSession.toString();
            if (debug) {
                session = `debug${session}`;
            }
            thisTable[path] = session;
            sendBack({ type: `session-number`, number: session }, obj.id, port);
        }
        else {
            sendBack({ type: `ok` }, obj.id, port);
        }
    });
}
function sendBack(message, id, port) {
    port.postMessage({ id, message });
}
function postModuleMessage({ id, message }, fn) {
    handleMessage({ id, message }, { postMessage: fn });
}
exports.postModuleMessage = postModuleMessage;
