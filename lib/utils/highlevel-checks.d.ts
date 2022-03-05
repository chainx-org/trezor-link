import type { TrezorDeviceInfoWithSession, MessageFromTrezor } from '../types';
export declare function info(res: any): {
    version: string;
    configured: boolean;
};
export declare function version(version: any): string;
export declare function devices(res: any): Array<TrezorDeviceInfoWithSession>;
export declare function acquire(res: any): string;
export declare function call(res: any): MessageFromTrezor;
