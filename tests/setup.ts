// Polyfills
// @ts-ignore
class MockHeaders {
    map = new Map<string, string>();
    constructor(init?: any) { if (init) Object.keys(init).forEach(k => this.map.set(k, init[k])); }
    append(k: string, v: string) { this.map.set(k, v); }
    get(k: string) { return this.map.get(k) || null; }
    forEach(cb: any) { this.map.forEach((v, k) => cb(v, k)); }
}
// @ts-ignore
global.Headers = MockHeaders;

// @ts-ignore
global.Request = class {
    url: string; method: string;
    constructor(input: string, init?: any) {
        this.url = input;
        this.method = init?.method || 'GET';
    }
};

// @ts-ignore
global.Response = class {
    ok: boolean; status: number; headers: any;
    constructor(body: any, init?: any) {
        this.ok = init?.status >= 200 && init?.status < 300;
        this.status = init?.status || 200;
        this.headers = new MockHeaders(init?.headers);
    }
    clone() { return this; }
};

// Mock XHR
class MockXHR {
    listeners: Record<string, Function[]> = {};
    readyState = 0; status = 0; responseText = ''; response = '';

    open(method: string, url: string) { }
    setRequestHeader(k: string, v: string) { }
    send(body: any) { }
    getAllResponseHeaders() { return ''; }

    addEventListener(evt: string, cb: Function) {
        if (!this.listeners[evt]) this.listeners[evt] = [];
        this.listeners[evt].push(cb);
    }

    _trigger(evt: string) {
        if (this.listeners[evt]) this.listeners[evt].forEach(cb => cb.call(this));
    }
}
// @ts-ignore
global.XMLHttpRequest = MockXHR;
