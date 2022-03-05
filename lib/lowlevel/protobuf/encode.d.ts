import ByteBuffer = require('bytebuffer');
import { Type } from 'protobufjs/light';
export declare function patch(Message: Type, payload: any): any;
export declare const encode: (Message: Type, data: Object) => ByteBuffer;
