class MockHeaders {
    map = new Map<string, string>();
    constructor(init?: any) { if (init) Object.keys(init).forEach(k => this.map.set(k, init[k])); }
    append(k: string, v: string) { this.map.set(k, v); }
    get(k: string) { return this.map.get(k) || null; }
    forEach(cb: any) { this.map.forEach((v, k) => cb(v, k)); }
}
(global as any).Headers = MockHeaders;

(global as any).Request = class {
    url: string; method: string;
    constructor(input: string, init?: any) {
        this.url = input;
        this.method = init?.method || 'GET';
    }
};

(global as any).Response = class {
    ok: boolean; status: number; headers: any;

    clone() { return this; }
    json() { return Promise.resolve(JSON.parse(this._body)); }
    text() { return Promise.resolve(this._body); }
    _body: any;
    constructor(body: any, init?: any) {
        this.ok = init?.status >= 200 && init?.status < 300;
        this.status = init?.status || 200;
        this.headers = new MockHeaders(init?.headers);
        this._body = body;
    }
};

class MockXHR {
    listeners: Record<string, Function[]> = {};
    readyState = 0; status = 0; responseText = ''; response = '';

    open(method: string, url: string) { }
    setRequestHeader(k: string, v: string) { }
    send(body: any) { }
    getAllResponseHeaders() { return ''; }
    getResponseHeader(k: string) { return 'osodreamer-console'; }

    addEventListener(evt: string, cb: Function) {
        if (!this.listeners[evt]) this.listeners[evt] = [];
        this.listeners[evt].push(cb);
    }

    removeEventListener(evt: string, cb: Function) {
        if (this.listeners[evt]) this.listeners[evt] = this.listeners[evt].filter(c => c !== cb);
    }

    dispatchEvent(evt: Event) {
        this._trigger(evt.type);
        return true;
    }

    _trigger(evt: string) {
        // Handle onreadystatechange, onload, etc. properties
        if (evt === 'readystatechange' && typeof (this as any).onreadystatechange === 'function') {
            (this as any).onreadystatechange();
        }
        if (evt === 'load' && typeof (this as any).onload === 'function') {
            (this as any).onload();
        }

        if (this.listeners[evt]) this.listeners[evt].forEach(cb => cb.call(this));
    }
}
(global as any).XMLHttpRequest = MockXHR;


if (typeof (global as any).File === 'undefined') {
    (global as any).File = class extends global.Blob {
        name = '';
        lastModified = 0;
        constructor(parts: any[], name: string, opts?: any) {
            super(parts, opts);
            this.name = name;
            this.lastModified = Date.now();
        }
    }
}

if (typeof global.fetch === 'undefined') {
    (global as any).fetch = () => Promise.resolve(new (global as any).Response('{}', { status: 200 }));
}


