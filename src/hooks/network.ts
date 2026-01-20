import { Store } from '../store';
import { NetworkRequest } from '../types';

export class NetworkHook {
    store: Store;

    constructor(store: Store) {
        this.store = store;
    }

    enable() {
        this.hookFetch();
        this.hookXHR();
    }

    hookFetch() {
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const id = Math.random().toString(36).substr(2);
            let url = args[0] instanceof Request ? args[0].url : args[0] as string;
            const method = args[0] instanceof Request ? args[0].method : (args[1]?.method || 'GET');

            let reqHeaders: Record<string, string> = {};
            if (args[1]?.headers) {
                if (args[1].headers instanceof Headers) {
                    args[1].headers.forEach((v, k) => reqHeaders[k] = v);
                } else if (Array.isArray(args[1].headers)) {
                    args[1].headers.forEach((arr: string[]) => {
                        if (arr.length >= 2) reqHeaders[arr[0]] = arr[1];
                    });
                } else {
                    reqHeaders = args[1].headers as Record<string, string>;
                }
            }

            const req: NetworkRequest = this.createReq(id, url, method, 'fetch');
            req.reqHeaders = reqHeaders;
            req.reqBody = this.parseBody(args[1]?.body);
            this.store.addRequest(req);

            try {
                const res = await originalFetch(...args);
                const clone = res.clone();

                const updates: Partial<NetworkRequest> = {
                    status: res.status,
                    duration: Date.now() - req._start,
                    resHeaders: {}
                };

                res.headers.forEach((v, k) => updates.resHeaders![k] = v);

                const type = res.headers.get('content-type') || '';
                if (type.includes('json')) {
                    clone.json().then(d => this.store.updateRequest(id, { resBody: d }));
                } else {
                    clone.text().then(t => this.store.updateRequest(id, { resBody: t.substring(0, 500) }));
                }

                this.store.updateRequest(id, updates);
                return res;
            } catch (e: any) {
                this.store.updateRequest(id, { status: 'ERR', resBody: e?.message || String(e) });
                throw e;
            }
        };
    }

    hookXHR() {
        const oldOpen = XMLHttpRequest.prototype.open;
        const oldSend = XMLHttpRequest.prototype.send;
        const oldSetHeader = XMLHttpRequest.prototype.setRequestHeader;
        const self = this; // eslint-disable-line

        XMLHttpRequest.prototype.open = function (method: string, url: string | URL) {
            // @ts-ignore
            this._odc = {
                id: Math.random().toString(36).substr(2),
                method,
                url: url.toString(),
                reqHeaders: {}
            };
            // @ts-ignore
            oldOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.setRequestHeader = function (header: string, value: string) {
            // @ts-ignore
            if (this._odc) this._odc.reqHeaders[header] = value;
            // @ts-ignore
            oldSetHeader.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function (body: any) {
            // @ts-ignore
            const meta = this._odc;
            if (meta) {
                const req = self.createReq(meta.id, meta.url, meta.method, 'xhr');
                req.reqHeaders = meta.reqHeaders;
                req.reqBody = self.parseBody(body);
                self.store.addRequest(req);

                this.addEventListener('load', function () {
                    const updates: Partial<NetworkRequest> = {
                        status: this.status,
                        duration: Date.now() - req._start,
                        resHeaders: {}
                    };

                    const headStr = this.getAllResponseHeaders();
                    if (headStr) {
                        headStr.trim().split(/[\r\n]+/).forEach((l: string) => {
                            const p = l.split(': ');
                            if (p.length >= 2) updates.resHeaders![p.shift()!] = p.join(': ');
                        });
                    }

                    try {
                        updates.resBody = JSON.parse(this.responseText);
                    } catch {
                        updates.resBody = this.responseText.substring(0, 500);
                    }
                    self.store.updateRequest(meta.id, updates);
                });

                this.addEventListener('error', () => {
                    self.store.updateRequest(meta.id, { status: 'ERR' });
                });
            }
            // @ts-ignore
            oldSend.apply(this, arguments);
        };
    }

    createReq(id: string, urlInput: string, method: string, type: 'fetch' | 'xhr'): NetworkRequest {
        let url = urlInput;
        if (typeof url === 'string' && !url.startsWith('http') && window.location) {
            url = window.location.origin + url;
        }

        let urlObj: URL;
        try {
            urlObj = new URL(url);
        } catch {
            urlObj = new URL('http://unknown/' + url);
        }

        return {
            id,
            method,
            type,
            url: urlObj.pathname,
            fullUrl: url,
            params: Object.fromEntries(urlObj.searchParams),
            reqHeaders: {},
            resHeaders: {},
            status: '...',
            _start: Date.now(),
            duration: 0,
            reqBody: null,
            resBody: null
        };
    }

    private parseBody(body: any): any {
        if (!body) return null;
        if (typeof body === 'string') {
            try { return JSON.parse(body); } catch { return body; }
        }
        if (typeof FormData !== 'undefined' && body instanceof FormData) {
            const obj: Record<string, any> = {};
            body.forEach((val, key) => {
                obj[key] = (val instanceof File) ? `[File: ${val.name} (${val.size}b)]` : val;
            });
            return obj;
        }
        if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
            return Object.fromEntries(body.entries());
        }
        if (typeof Blob !== 'undefined' && body instanceof Blob) {
            return `[Blob: ${body.type}, ${body.size} bytes]`;
        }
        return body;
    }
}
