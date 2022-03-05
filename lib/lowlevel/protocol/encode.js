"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = void 0;
const ByteBuffer = require("bytebuffer");
const config_1 = require("../../config");
function encode(data, options) {
    const { addTrezorHeaders, chunked, messageType } = options;
    const fullSize = (addTrezorHeaders ? config_1.HEADER_SIZE : config_1.HEADER_SIZE - 2) + data.limit;
    const encodedByteBuffer = new ByteBuffer(fullSize);
    if (addTrezorHeaders) {
        encodedByteBuffer.writeByte(config_1.MESSAGE_HEADER_BYTE);
        encodedByteBuffer.writeByte(config_1.MESSAGE_HEADER_BYTE);
    }
    encodedByteBuffer.writeUint16(messageType);
    encodedByteBuffer.writeUint32(data.limit);
    encodedByteBuffer.append(data.buffer);
    encodedByteBuffer.reset();
    if (chunked === false) {
        return encodedByteBuffer;
    }
    const result = [];
    const size = config_1.BUFFER_SIZE;
    const count = Math.floor((encodedByteBuffer.limit - 1) / size) + 1 || 1;
    for (let i = 0; i < count; i++) {
        const start = i * size;
        const end = Math.min((i + 1) * size, encodedByteBuffer.limit);
        const slice = encodedByteBuffer.slice(start, end);
        slice.compact();
        result.push(slice.buffer);
    }
    return result;
}
exports.encode = encode;
