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
exports.buildAndSend = exports.buildBuffers = exports.buildOne = void 0;
const protobuf_1 = require("./protobuf");
const protocol_1 = require("./protocol");
const messages_1 = require("./protobuf/messages");
function sendBuffers(sender, buffers) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const buffer of buffers) {
            yield sender(buffer);
        }
    });
}
function buildOne(messages, name, data) {
    const { Message, messageType } = (0, messages_1.createMessageFromName)(messages, name);
    const buffer = (0, protobuf_1.encode)(Message, data);
    return (0, protocol_1.encode)(buffer, {
        addTrezorHeaders: false,
        chunked: false,
        messageType,
    });
}
exports.buildOne = buildOne;
const buildBuffers = (messages, name, data) => {
    const { Message, messageType } = (0, messages_1.createMessageFromName)(messages, name);
    const buffer = (0, protobuf_1.encode)(Message, data);
    return (0, protocol_1.encode)(buffer, {
        addTrezorHeaders: true,
        chunked: true,
        messageType,
    });
};
exports.buildBuffers = buildBuffers;
function buildAndSend(messages, sender, name, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const buffers = (0, exports.buildBuffers)(messages, name, data);
        return sendBuffers(sender, buffers);
    });
}
exports.buildAndSend = buildAndSend;
