import type { Transport, AcquireInput, TrezorDeviceInfoWithSession, MessageFromTrezor } from './types';
export default class FallbackTransport {
    name: string;
    activeName: string;
    _availableTransports: Array<Transport>;
    transports: Array<Transport>;
    configured: boolean;
    version: string;
    debug: boolean;
    activeTransport: Transport;
    constructor(transports: Array<Transport>);
    _tryInitTransports(): Promise<Array<Transport>>;
    _tryConfigureTransports(data: JSON | string): Promise<Transport>;
    init(debug?: boolean): Promise<void>;
    isOutdated: boolean;
    configure(signedData: JSON | string): Promise<void>;
    enumerate(): Promise<Array<TrezorDeviceInfoWithSession>>;
    listen(old?: Array<TrezorDeviceInfoWithSession>): Promise<Array<TrezorDeviceInfoWithSession>>;
    acquire(input: AcquireInput, debugLink: boolean): Promise<string>;
    release(session: string, onclose: boolean, debugLink: boolean): Promise<void>;
    call(session: string, name: string, data: Object, debugLink: boolean): Promise<MessageFromTrezor>;
    post(session: string, name: string, data: Object, debugLink: boolean): Promise<void>;
    read(session: string, debugLink: boolean): Promise<MessageFromTrezor>;
    requestDevice(): Promise<void>;
    requestNeeded: boolean;
    setBridgeLatestUrl(url: string): void;
    setBridgeLatestVersion(version: string): void;
    stop(): void;
}
