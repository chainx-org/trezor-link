"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.patch = void 0;
const ByteBuffer = require("bytebuffer");
const protobuf_1 = require("../../utils/protobuf");
const transform = (fieldType, value) => {
    if (fieldType === 'bytes') {
        if (typeof value === 'string' && !value)
            return value;
        return Buffer.from(value, `hex`);
    }
    if (typeof value === 'number' && !Number.isSafeInteger(value)) {
        throw new RangeError('field value is not within safe integer range');
    }
    return value;
};
function patch(Message, payload) {
    const patched = {};
    if (!Message.fields) {
        return patched;
    }
    Object.keys(Message.fields).forEach(key => {
        const field = Message.fields[key];
        const value = payload[key];
        if (typeof value === 'undefined') {
            return;
        }
        if ((0, protobuf_1.isPrimitiveField)(field.type)) {
            if (field.repeated) {
                patched[key] = value.map((v) => transform(field.type, v));
            }
            else {
                patched[key] = transform(field.type, value);
            }
            return;
        }
        if (field.repeated) {
            const RefMessage = Message.lookupTypeOrEnum(field.type);
            patched[key] = value.map((v) => patch(RefMessage, v));
        }
        else if (typeof value === 'object' && value !== null) {
            const RefMessage = Message.lookupType(field.type);
            patched[key] = patch(RefMessage, value);
        }
        else if (typeof value === 'number') {
            const RefMessage = Message.lookupEnum(field.type);
            patched[key] = RefMessage.values[value];
        }
        else {
            patched[key] = value;
        }
    });
    return patched;
}
exports.patch = patch;
const encode = (Message, data) => {
    const payload = patch(Message, data);
    const message = Message.fromObject(payload);
    const buffer = Message.encode(message).finish();
    const bytebuffer = new ByteBuffer(buffer.byteLength);
    bytebuffer.append(buffer);
    bytebuffer.reset();
    return bytebuffer;
};
exports.encode = encode;
