export declare type TrezorDeviceInfo = {
    path: string;
};
export declare type TrezorDeviceInfoWithSession = TrezorDeviceInfo & {
    session?: string;
    debugSession?: string;
    debug: boolean;
};
export declare type AcquireInput = {
    path: string;
    previous?: string;
};
export declare type MessageFromTrezor = {
    type: string;
    message: Object;
};
export declare type Transport = {
    enumerate(): Promise<Array<TrezorDeviceInfoWithSession>>;
    listen(old?: Array<TrezorDeviceInfoWithSession>): Promise<Array<TrezorDeviceInfoWithSession>>;
    acquire(input: AcquireInput, debugLink: boolean): Promise<string>;
    release(session: string, onclose: boolean, debugLink: boolean): Promise<void>;
    configure(signedData: JSON | string): Promise<void>;
    call(session: string, name: string, data: Object, debugLink: boolean): Promise<MessageFromTrezor>;
    post(session: string, name: string, data: Object, debugLink: boolean): Promise<void>;
    read(session: string, debugLink: boolean): Promise<MessageFromTrezor>;
    init(debug?: boolean): Promise<void>;
    stop(): void;
    configured: boolean;
    version: string;
    name: string;
    requestNeeded: boolean;
    isOutdated: boolean;
    setBridgeLatestUrl(url: string): void;
    setBridgeLatestVersion(version: string): void;
    activeName?: string;
    requestDevice: () => Promise<void>;
};
