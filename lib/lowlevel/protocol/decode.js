"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeChunked = exports.decode = void 0;
const ByteBuffer = require("bytebuffer");
const config_1 = require("../../config");
const readHeader = (buffer) => {
    const typeId = buffer.readUint16();
    const length = buffer.readUint32();
    return { typeId, length };
};
const readHeaderChunked = (buffer) => {
    const sharp1 = buffer.readByte();
    const sharp2 = buffer.readByte();
    const typeId = buffer.readUint16();
    const length = buffer.readUint32();
    return { sharp1, sharp2, typeId, length };
};
const decode = (byteBuffer) => {
    const { typeId } = readHeader(byteBuffer);
    return {
        typeId,
        buffer: byteBuffer,
    };
};
exports.decode = decode;
const decodeChunked = (bytes) => {
    const byteBuffer = ByteBuffer.wrap(bytes, undefined, undefined, true);
    const { sharp1, sharp2, typeId, length } = readHeaderChunked(byteBuffer);
    if (sharp1 !== config_1.MESSAGE_HEADER_BYTE || sharp2 !== config_1.MESSAGE_HEADER_BYTE) {
        throw new Error("Didn't receive expected header signature.");
    }
    return { length, typeId, restBuffer: byteBuffer };
};
exports.decodeChunked = decodeChunked;
