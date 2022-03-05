"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const v2_1 = require("./bridge/v2");
const withSharedConnections_1 = require("./lowlevel/withSharedConnections");
const fallback_1 = require("./fallback");
const webusb_1 = require("./lowlevel/webusb");
exports.default = {
    BridgeV2: v2_1.default,
    Fallback: fallback_1.default,
    Lowlevel: withSharedConnections_1.default,
    WebUsb: webusb_1.default,
};
