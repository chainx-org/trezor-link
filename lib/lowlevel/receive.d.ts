import { Root } from 'protobufjs/light';
export declare function receiveOne(messages: Root, data: string): {
    message: {
        [key: string]: any;
    };
    type: string;
};
export declare function receiveAndParse(messages: Root, receiver: () => Promise<ArrayBuffer>): Promise<{
    message: {
        [key: string]: any;
    };
    type: string;
}>;
