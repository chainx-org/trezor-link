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
exports.request = exports.setFetch = void 0;
let _fetch = typeof window === `undefined` ? () => Promise.reject() : window.fetch;
let _isNode = false;
function setFetch(fetch, isNode) {
    _fetch = fetch;
    _isNode = !!isNode;
}
exports.setFetch = setFetch;
function contentType(body) {
    if (typeof body === `string`) {
        if (body === ``) {
            return `text/plain`;
        }
        return `application/octet-stream`;
    }
    return `application/json`;
}
function wrapBody(body) {
    if (typeof body === `string`) {
        return body;
    }
    return JSON.stringify(body);
}
function parseResult(text) {
    try {
        return JSON.parse(text);
    }
    catch (e) {
        return text;
    }
}
function request(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const fetchOptions = {
            method: options.method,
            body: wrapBody(options.body),
            credentials: `same-origin`,
            headers: {},
        };
        if (options.skipContentTypeHeader == null || options.skipContentTypeHeader === false) {
            fetchOptions.headers = Object.assign(Object.assign({}, fetchOptions.headers), { 'Content-Type': contentType(options.body == null ? `` : options.body) });
        }
        if (_isNode) {
            fetchOptions.headers = Object.assign(Object.assign({}, fetchOptions.headers), { Origin: `https://node.trezor.io` });
        }
        const res = yield _fetch(options.url, fetchOptions);
        const resText = yield res.text();
        if (res.ok) {
            return parseResult(resText);
        }
        const resJson = parseResult(resText);
        if (typeof resJson === `object` && resJson != null && resJson.error != null) {
            throw new Error(resJson.error);
        }
        else {
            throw new Error(resText);
        }
    });
}
exports.request = request;
