export declare type HttpRequestOptions = {
    body?: Array<any> | Object | string;
    url: string;
    method: 'POST' | 'GET';
    skipContentTypeHeader?: boolean;
};
export declare function setFetch(fetch: any, isNode?: boolean): void;
export declare function request(options: HttpRequestOptions): Promise<any>;
