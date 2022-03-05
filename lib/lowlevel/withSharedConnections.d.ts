import type { LowlevelTransportSharedPlugin, TrezorDeviceInfoDebug } from './sharedPlugin';
import type { Deferred } from '../utils/defered';
import type { MessageFromTrezor, TrezorDeviceInfoWithSession, AcquireInput } from '../types';
export declare type MessageToSharedWorker = {
    type: 'acquire-intent';
    path: string;
    previous?: string;
    debug: boolean;
} | {
    type: 'acquire-done';
} | {
    type: 'acquire-failed';
} | {
    type: 'get-sessions';
} | {
    type: 'get-sessions-and-disconnect';
    devices: Array<TrezorDeviceInfoDebug>;
} | {
    type: 'release-intent';
    session: string;
    debug: boolean;
} | {
    type: 'release-onclose';
    session: string;
} | {
    type: 'release-done';
} | {
    type: 'enumerate-intent';
} | {
    type: 'enumerate-done';
};
export declare type MessageFromSharedWorker = {
    type: 'ok';
} | {
    type: 'wrong-previous-session';
} | {
    type: 'double-release';
} | {
    type: 'sessions';
    debugSessions: {
        [path: string]: string;
    };
    normalSessions: {
        [path: string]: string;
    };
} | {
    type: 'session-number';
    number: string;
} | {
    type: 'path';
    path: string;
    otherSession?: string;
} | {
    type: 'other-session';
    otherSession?: string;
};
export default class LowlevelTransportWithSharedConnections {
    name: string;
    plugin: LowlevelTransportSharedPlugin;
    debug: boolean;
    deferedDebugOnRelease: {
        [session: string]: Deferred<void>;
    };
    deferedNormalOnRelease: {
        [session: string]: Deferred<void>;
    };
    _messages: undefined | any;
    version: string;
    configured: boolean;
    _sharedWorkerFactory: undefined | (() => SharedWorker);
    sharedWorker: undefined | SharedWorker;
    stopped: boolean;
    constructor(plugin: LowlevelTransportSharedPlugin, sharedWorkerFactory: undefined | (() => SharedWorker));
    enumerate(): Promise<Array<TrezorDeviceInfoWithSession>>;
    _silentEnumerate(): Promise<Array<TrezorDeviceInfoWithSession>>;
    _releaseDisconnected(devices: Array<TrezorDeviceInfoWithSession>): void;
    _lastStringified: string;
    listen(old: Array<TrezorDeviceInfoWithSession>): Promise<Array<TrezorDeviceInfoWithSession>>;
    _runIter(iteration: number, oldStringified: string): Promise<Array<TrezorDeviceInfoWithSession>>;
    acquire(input: AcquireInput, debugLink: boolean): Promise<string>;
    release(session: string, onclose: boolean, debugLink: boolean): Promise<void>;
    _releaseCleanup(session: string, debugLink: boolean): void;
    configure(signedData: JSON): Promise<void>;
    _sendLowlevel(path: string, debug: boolean): (data: ArrayBuffer) => Promise<void>;
    _receiveLowlevel(path: string, debug: boolean): () => Promise<ArrayBuffer>;
    messages(): any;
    doWithSession<X>(session: string, debugLink: boolean, inside: (path: string) => Promise<X>): Promise<X>;
    call(session: string, name: string, data: Object, debugLink: boolean): Promise<MessageFromTrezor>;
    post(session: string, name: string, data: Object, debugLink: boolean): Promise<void>;
    read(session: string, debugLink: boolean): Promise<MessageFromTrezor>;
    init(debug?: boolean): Promise<void>;
    requestDevice(): Promise<void>;
    requestNeeded: boolean;
    latestId: number;
    defereds: {
        [id: number]: Deferred<MessageFromSharedWorker>;
    };
    sendToWorker(message: MessageToSharedWorker): Promise<MessageFromSharedWorker>;
    receiveFromWorker(m: {
        id: number;
        message: MessageFromSharedWorker;
    }): void;
    setBridgeLatestUrl(url: string): void;
    setBridgeLatestVersion(version: string): void;
    isOutdated: boolean;
    stop(): void;
}
