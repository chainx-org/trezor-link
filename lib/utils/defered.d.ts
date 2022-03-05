export declare type Deferred<T> = {
    promise: Promise<T>;
    resolve: (t: T) => void;
    reject: (e: Error) => void;
    rejectingPromise: Promise<any>;
};
export declare function create<T>(): Deferred<T>;
export declare function resolveTimeoutPromise<T>(delay: number, result: T): Promise<T>;
export declare function rejectTimeoutPromise(delay: number, error: Error): Promise<any>;
