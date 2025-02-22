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
exports.receiveAndParse = exports.receiveOne = void 0;
const ByteBuffer = require("bytebuffer");
const decodeProtobuf = require("./protobuf/decode");
const decodeProtocol = require("./protocol/decode");
const messages_1 = require("./protobuf/messages");
function receiveOne(messages, data) {
    const bytebuffer = ByteBuffer.wrap(data, 'hex');
    const { typeId, buffer } = decodeProtocol.decode(bytebuffer);
    const { Message, messageName } = (0, messages_1.createMessageFromType)(messages, typeId);
    const message = decodeProtobuf.decode(Message, buffer);
    return {
        message,
        type: messageName,
    };
}
exports.receiveOne = receiveOne;
function receiveRest(parsedInput, receiver, expectedLength) {
    return __awaiter(this, void 0, void 0, function* () {
        if (parsedInput.offset >= expectedLength) {
            return;
        }
        const data = yield receiver();
        if (data == null) {
            throw new Error(`Received no data.`);
        }
        parsedInput.append(data);
        return receiveRest(parsedInput, receiver, expectedLength);
    });
}
function receiveBuffer(receiver) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield receiver();
        const { length, typeId, restBuffer } = decodeProtocol.decodeChunked(data);
        const decoded = new ByteBuffer(length);
        if (length) {
            decoded.append(restBuffer);
        }
        yield receiveRest(decoded, receiver, length);
        return { received: decoded, typeId };
    });
}
function receiveAndParse(messages, receiver) {
    return __awaiter(this, void 0, void 0, function* () {
        const { received, typeId } = yield receiveBuffer(receiver);
        const { Message, messageName } = (0, messages_1.createMessageFromType)(messages, typeId);
        received.reset();
        const message = decodeProtobuf.decode(Message, received);
        return {
            message,
            type: messageName,
        };
    });
}
exports.receiveAndParse = receiveAndParse;
