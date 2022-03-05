"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const T1HID_VENDOR = 0x534c;
const TREZOR_DESCS = [
    { vendorId: 0x534c, productId: 0x0001 },
    { vendorId: 0x1209, productId: 0x53c0 },
    { vendorId: 0x1209, productId: 0x53c1 },
];
const CONFIGURATION_ID = 1;
const INTERFACE_ID = 0;
const ENDPOINT_ID = 1;
const DEBUG_INTERFACE_ID = 1;
const DEBUG_ENDPOINT_ID = 2;
class WebUsbPlugin {
    constructor() {
        this.name = `WebUsbPlugin`;
        this.version = '';
        this.debug = false;
        this.allowsWriteAndEnumerate = true;
        this.configurationId = CONFIGURATION_ID;
        this.normalInterfaceId = INTERFACE_ID;
        this.normalEndpointId = ENDPOINT_ID;
        this.debugInterfaceId = DEBUG_INTERFACE_ID;
        this.debugEndpointId = DEBUG_ENDPOINT_ID;
        this.unreadableHidDevice = false;
        this.unreadableHidDeviceChange = new events_1.EventEmitter();
        this._lastDevices = [];
        this.requestNeeded = true;
    }
    init(debug) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug = !!debug;
            const { usb } = navigator;
            if (usb == null) {
                throw new Error(`WebUSB is not available on this browser.`);
            }
            else {
                this.usb = usb;
            }
        });
    }
    _deviceHasDebugLink(device) {
        try {
            const iface = device.configurations[0].interfaces[DEBUG_INTERFACE_ID].alternates[0];
            return (iface.interfaceClass === 255 &&
                iface.endpoints[0].endpointNumber === DEBUG_ENDPOINT_ID);
        }
        catch (e) {
            return false;
        }
    }
    _deviceIsHid(device) {
        return device.vendorId === T1HID_VENDOR;
    }
    _listDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            let bootloaderId = 0;
            const devices = yield this.usb.getDevices();
            const trezorDevices = devices.filter(dev => {
                const isTrezor = TREZOR_DESCS.some(desc => dev.vendorId === desc.vendorId && dev.productId === desc.productId);
                return isTrezor;
            });
            const hidDevices = trezorDevices.filter(dev => this._deviceIsHid(dev));
            const nonHidDevices = trezorDevices.filter(dev => !this._deviceIsHid(dev));
            this._lastDevices = nonHidDevices.map(device => {
                const { serialNumber } = device;
                let path = serialNumber == null || serialNumber === `` ? `bootloader` : serialNumber;
                if (path === `bootloader`) {
                    bootloaderId++;
                    path += bootloaderId;
                }
                const debug = this._deviceHasDebugLink(device);
                return { path, device, debug };
            });
            const oldUnreadableHidDevice = this.unreadableHidDevice;
            this.unreadableHidDevice = hidDevices.length > 0;
            if (oldUnreadableHidDevice !== this.unreadableHidDevice) {
                this.unreadableHidDeviceChange.emit(`change`);
            }
            return this._lastDevices;
        });
    }
    enumerate() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._listDevices()).map(info => ({
                path: info.path,
                debug: info.debug,
            }));
        });
    }
    _findDevice(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceO = this._lastDevices.find(d => d.path === path);
            if (deviceO == null) {
                throw new Error(`Action was interrupted.`);
            }
            return deviceO.device;
        });
    }
    send(path, data, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = yield this._findDevice(path);
            const newArray = new Uint8Array(64);
            newArray[0] = 63;
            newArray.set(new Uint8Array(data), 1);
            if (!device.opened) {
                yield this.connect(path, debug, false);
            }
            const endpoint = debug ? this.debugEndpointId : this.normalEndpointId;
            return device.transferOut(endpoint, newArray).then(() => { });
        });
    }
    receive(path, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = yield this._findDevice(path);
            const endpoint = debug ? this.debugEndpointId : this.normalEndpointId;
            try {
                if (!device.opened) {
                    yield this.connect(path, debug, false);
                }
                const res = yield device.transferIn(endpoint, 64);
                if (res.data.byteLength === 0) {
                    return this.receive(path, debug);
                }
                return res.data.buffer.slice(1);
            }
            catch (e) {
                if (e.message === `Device unavailable.`) {
                    throw new Error(`Action was interrupted.`);
                }
                else {
                    throw e;
                }
            }
        });
    }
    connect(path, debug, first) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < 5; i++) {
                if (i > 0) {
                    yield new Promise(resolve => setTimeout(() => resolve(undefined), i * 200));
                }
                try {
                    return yield this._connectIn(path, debug, first);
                }
                catch (e) {
                    if (i === 4) {
                        throw e;
                    }
                }
            }
        });
    }
    _connectIn(path, debug, first) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = yield this._findDevice(path);
            yield device.open();
            if (first) {
                yield device.selectConfiguration(this.configurationId);
                try {
                    yield device.reset();
                }
                catch (error) {
                }
            }
            const interfaceId = debug ? this.debugInterfaceId : this.normalInterfaceId;
            yield device.claimInterface(interfaceId);
        });
    }
    disconnect(path, debug, last) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = yield this._findDevice(path);
            const interfaceId = debug ? this.debugInterfaceId : this.normalInterfaceId;
            yield device.releaseInterface(interfaceId);
            if (last) {
                yield device.close();
            }
        });
    }
    requestDevice() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.usb.requestDevice({ filters: TREZOR_DESCS });
        });
    }
}
exports.default = WebUsbPlugin;
