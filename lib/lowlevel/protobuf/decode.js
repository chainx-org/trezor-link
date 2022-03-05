"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const ByteBuffer = require("bytebuffer");
const protobuf_1 = require("../../utils/protobuf");
const transform = (field, value) => {
    if (field.optional && typeof value === 'undefined') {
        return null;
    }
    if (field.type === 'bytes') {
        return ByteBuffer.wrap(value).toString('hex');
    }
    if (field.long) {
        return value.toNumber();
    }
    return value;
};
function messageToJSON(Message, fields) {
    const message = __rest(Message, []);
    const res = {};
    Object.keys(fields).forEach(key => {
        const field = fields[key];
        const value = message[key];
        if (field.repeated) {
            if ((0, protobuf_1.isPrimitiveField)(field.type)) {
                res[key] = value.map((v) => transform(field, v));
            }
            else if ('valuesById' in field.resolvedType) {
                res[key] = value;
            }
            else if ('fields' in field.resolvedType) {
                res[key] = value.map((v) => messageToJSON(v, field.resolvedType.fields));
            }
            else {
                throw new Error(`case not handled for repeated key: ${key}`);
            }
        }
        else if ((0, protobuf_1.isPrimitiveField)(field.type)) {
            res[key] = transform(field, value);
        }
        else if ('valuesById' in field.resolvedType) {
            res[key] = field.resolvedType.valuesById[value];
        }
        else if (field.resolvedType.fields) {
            res[key] = messageToJSON(value, field.resolvedType.fields);
        }
        else {
            throw new Error(`case not handled: ${key}`);
        }
    });
    return res;
}
const decode = (Message, data) => {
    const buff = data.toBuffer();
    const a = new Uint8Array(buff);
    const decoded = Message.decode(a);
    return messageToJSON(decoded, decoded.$type.fields);
};
exports.decode = decode;
