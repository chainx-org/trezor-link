export declare type TrezorDeviceInfoDebug = {
    path: string;
    debug: boolean;
};
export declare type LowlevelTransportSharedPlugin = {
    enumerate: () => Promise<Array<TrezorDeviceInfoDebug>>;
    send: (path: string, data: ArrayBuffer, debug: boolean) => Promise<void>;
    receive: (path: string, debug: boolean) => Promise<ArrayBuffer>;
    connect: (path: string, debug: boolean, first: boolean) => Promise<void>;
    disconnect: (path: string, debug: boolean, last: boolean) => Promise<void>;
    requestDevice: () => Promise<void>;
    requestNeeded: boolean;
    init: (debug?: boolean) => Promise<void>;
    version: string;
    name: string;
    allowsWriteAndEnumerate: boolean;
};
