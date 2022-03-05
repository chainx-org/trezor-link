import BridgeTransportV2 from './bridge/v2';
import LowlevelTransportWithSharedConnections from './lowlevel/withSharedConnections';
import FallbackTransport from './fallback';
import WebUsbPlugin from './lowlevel/webusb';
export type { Transport, AcquireInput, TrezorDeviceInfoWithSession, MessageFromTrezor, } from './types';
declare const _default: {
    BridgeV2: typeof BridgeTransportV2;
    Fallback: typeof FallbackTransport;
    Lowlevel: typeof LowlevelTransportWithSharedConnections;
    WebUsb: typeof WebUsbPlugin;
};
export default _default;
