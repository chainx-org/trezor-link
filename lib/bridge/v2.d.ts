import { parseConfigure } from '../lowlevel/protobuf/messages';
import type { INamespace } from 'protobufjs/light';
import type { AcquireInput, TrezorDeviceInfoWithSession } from '../types';
declare type IncompleteRequestOptions = {
    body?: Array<any> | Object | string;
    url: string;
};
export default class BridgeTransport {
    name: string;
    version: string;
    isOutdated?: boolean;
    url: string;
    newestVersionUrl: string;
    bridgeVersion?: string;
    debug: boolean;
    configured: boolean;
    _messages: ReturnType<typeof parseConfigure> | undefined;
    stopped: boolean;
    constructor(url?: string, newestVersionUrl?: string);
    _post(options: IncompleteRequestOptions): Promise<any>;
    init(debug: boolean): Promise<void>;
    _silentInit(): Promise<void>;
    configure(signedData: INamespace): Promise<void>;
    listen(old?: Array<TrezorDeviceInfoWithSession>): Promise<Array<TrezorDeviceInfoWithSession>>;
    enumerate(): Promise<Array<TrezorDeviceInfoWithSession>>;
    _acquireMixed(input: AcquireInput, debugLink: boolean): Promise<any>;
    acquire(input: AcquireInput, debugLink: boolean): Promise<string>;
    release(session: string, onclose: boolean, debugLink: boolean): Promise<void>;
    call(session: string, name: string, data: Object, debugLink: boolean): Promise<import("../types").MessageFromTrezor>;
    post(session: string, name: string, data: Object, debugLink: boolean): Promise<void>;
    read(session: string, debugLink: boolean): Promise<import("../types").MessageFromTrezor>;
    static setFetch(fetch: any, isNode?: boolean): void;
    requestDevice(): Promise<never>;
    requestNeeded: boolean;
    setBridgeLatestUrl(url: string): void;
    setBridgeLatestVersion(version: string): void;
    stop(): void;
}
export {};
