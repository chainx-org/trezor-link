/// <reference types="node" />
import { Root } from 'protobufjs/light';
export declare function buildOne(messages: Root, name: string, data: Object): Buffer;
export declare const buildBuffers: (messages: Root, name: string, data: Object) => Buffer[];
export declare function buildAndSend(messages: Root, sender: (data: Buffer) => Promise<void>, name: string, data: Object): Promise<void>;
