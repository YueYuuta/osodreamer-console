import { NetworkHook } from '../src/hooks/network';
import { Store } from '../src/store';

describe('NetworkHook', () => {
    let store: Store;
    let hook: NetworkHook;
    let mockFetch: jest.Mock;

    beforeEach(() => {
        store = new Store();
        mockFetch = jest.fn();

        Object.defineProperty(window, 'fetch', {
            value: mockFetch,
            writable: true,
            configurable: true
        });
        global.fetch = mockFetch;

        hook = new NetworkHook(store);
        hook.enable();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('intercepts successful fetch with headers object', async () => {
        // @ts-ignore
        mockFetch.mockResolvedValue({
            ok: true, status: 200, headers: new Headers({ 'content-type': 'application/json' }),
            clone: () => ({
                text: () => Promise.resolve('{"a":1}'),
                json: () => Promise.resolve({ a: 1 })
            })
        });

        await window.fetch('https://api.test/data', {
            method: 'POST',
            headers: { 'X-Custom': '123' },
            body: '{"x":1}'
        });

        const reqs = Object.values(store.state.reqs);
        expect(reqs.length).toBe(1);
        expect(reqs[0].reqHeaders['X-Custom']).toBe('123');
    });

    test('intercepts fetch with invalid URL gracefully', async () => {
        // @ts-ignore
        mockFetch.mockResolvedValue({ ok: true, headers: new Headers(), clone: () => ({ text: () => Promise.resolve('') }) });

        // @ts-ignore
        await window.fetch('not-a-url');
        const reqs = Object.values(store.state.reqs);
        expect(reqs.length).toBe(1);
        expect(reqs[0].fullUrl).toContain('not-a-url');
    });

    test('intercepts XHR with headers and error', () => {
        const xhr = new XMLHttpRequest() as any;
        xhr.open('GET', '/api/xhr');
        xhr.setRequestHeader('X-Test', 'ABC');
        xhr.send('body-data');

        expect(Object.values(store.state.reqs)[0].reqHeaders['X-Test']).toBe('ABC');

        xhr._trigger('error');
        expect(Object.values(store.state.reqs)[0].status).toBe('ERR');
    });

    test('intercepts XHR response headers', () => {
        const xhr = new XMLHttpRequest() as any;
        xhr.open('GET', '/api/xhr');
        xhr.send();

        xhr.status = 200;
        xhr.getAllResponseHeaders = () => "Content-Type: application/json\r\nX-Powered-By: Test";
        xhr.responseText = '{"ok":true}';
        xhr._trigger('load');

        const req = Object.values(store.state.reqs)[0];
        expect(req.resHeaders['Content-Type']).toBe('application/json');
        expect(req.resHeaders['X-Powered-By']).toBe('Test');
    });
});
