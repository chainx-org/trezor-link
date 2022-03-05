/// <reference types="w3c-web-usb" />
/// <reference types="node" />
import { EventEmitter } from 'events';
declare type TrezorDeviceInfoDebug = {
    path: string;
    debug: boolean;
};
export default class WebUsbPlugin {
    name: string;
    version: string;
    debug: boolean;
    usb: USB;
    allowsWriteAndEnumerate: boolean;
    configurationId: number;
    normalInterfaceId: number;
    normalEndpointId: number;
    debugInterfaceId: number;
    debugEndpointId: number;
    unreadableHidDevice: boolean;
    unreadableHidDeviceChange: EventEmitter;
    init(debug?: boolean): Promise<void>;
    _deviceHasDebugLink(device: USBDevice): boolean;
    _deviceIsHid(device: USBDevice): boolean;
    _listDevices(): Promise<Array<{
        path: string;
        device: USBDevice;
        debug: boolean;
    }>>;
    _lastDevices: Array<{
        path: string;
        device: USBDevice;
        debug: boolean;
    }>;
    enumerate(): Promise<Array<TrezorDeviceInfoDebug>>;
    _findDevice(path: string): Promise<USBDevice>;
    send(path: string, data: ArrayBuffer, debug: boolean): Promise<void>;
    receive(path: string, debug: boolean): Promise<ArrayBuffer>;
    connect(path: string, debug: boolean, first: boolean): Promise<void>;
    _connectIn(path: string, debug: boolean, first: boolean): Promise<void>;
    disconnect(path: string, debug: boolean, last: boolean): Promise<void>;
    requestDevice(): Promise<void>;
    requestNeeded: boolean;
}
export {};
