"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUFFER_SIZE = exports.HEADER_SIZE = exports.MESSAGE_HEADER_BYTE = exports.DEFAULT_VERSION_URL = exports.DEFAULT_URL = void 0;
exports.DEFAULT_URL = `http://127.0.0.1:21325`;
exports.DEFAULT_VERSION_URL = `https://wallet.trezor.io/data/bridge/latest.txt`;
exports.MESSAGE_HEADER_BYTE = 0x23;
exports.HEADER_SIZE = 1 + 1 + 4 + 2;
exports.BUFFER_SIZE = 63;
