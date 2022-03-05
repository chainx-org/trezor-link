import type { MessageToSharedWorker } from './withSharedConnections';
export declare function postModuleMessage({ id, message }: {
    id: number;
    message: MessageToSharedWorker;
}, fn: (message: Object) => void): void;
