"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrimitiveField = void 0;
const primitiveTypes = [
    'bool',
    'string',
    'bytes',
    'int32',
    'int64',
    'uint32',
    'uint64',
    'sint32',
    'sint64',
    'fixed32',
    'fixed64',
    'sfixed32',
    'sfixed64',
    'double',
    'float',
];
const isPrimitiveField = (field) => primitiveTypes.includes(field);
exports.isPrimitiveField = isPrimitiveField;
