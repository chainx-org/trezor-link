"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessageFromType = exports.createMessageFromName = exports.parseConfigure = void 0;
const protobuf = require("protobufjs/light");
function parseConfigure(data) {
    if (typeof data === 'string') {
        return protobuf.Root.fromJSON(JSON.parse(data));
    }
    return protobuf.Root.fromJSON(data);
}
exports.parseConfigure = parseConfigure;
const createMessageFromName = (messages, name) => {
    const Message = messages.lookupType(name);
    const MessageType = messages.lookupEnum(`MessageType`);
    let messageType = MessageType.values[`MessageType_${name}`];
    if (!messageType && Message.options) {
        messageType = Message.options['(wire_type)'];
    }
    return {
        Message,
        messageType,
    };
};
exports.createMessageFromName = createMessageFromName;
const createMessageFromType = (messages, typeId) => {
    const MessageType = messages.lookupEnum(`MessageType`);
    const messageName = MessageType.valuesById[typeId].replace('MessageType_', '');
    const Message = messages.lookupType(messageName);
    return {
        Message,
        messageName,
    };
};
exports.createMessageFromType = createMessageFromType;
