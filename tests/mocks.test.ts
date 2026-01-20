import { NetworkHook } from '../src/hooks/network';
import { Store } from '../src/store';

describe('Network Mocking', () => {
    let store: Store;
    let hook: NetworkHook;
    let originalFetch: any;
    let originalXHR: any;

    beforeEach(() => {
        store = new Store();
        hook = new NetworkHook(store);
        originalFetch = window.fetch;
        originalXHR = window.XMLHttpRequest;
    });

    afterEach(() => {
        window.fetch = originalFetch;
        window.XMLHttpRequest = originalXHR;
    });

    test('intercepts fetch with mock', async () => {
        store.addMock({
            id: '1',
            active: true,
            method: 'GET',
            urlPattern: '/api/mock',
            status: 200,
            responseBody: JSON.stringify({ mocked: true }),
            delay: 0
        });

        hook.enable();

        // @ts-ignore
        const res = await window.fetch('/api/mock');
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(res.headers.get('x-mocked-by')).toBe('osodreamer-console');
        expect(body).toEqual({ mocked: true });

        // Should also be in store
        const reqs = Object.values(store.state.reqs);
        expect(reqs.length).toBe(1);
        expect(reqs[0].url).toBe('/api/mock');
    });

    test('bypasses inactive mock', async () => {
        // Use our global.Response mock which now has proper methods
        // @ts-ignore
        const realResponse = new Response('{}', { status: 200 });
        const realFetch = jest.fn().mockResolvedValue(realResponse);

        // We set it BEFORE enabling hook so it's captured as "original"
        window.fetch = realFetch;

        store.addMock({
            id: '1',
            active: false,
            method: 'GET',
            urlPattern: '/api/mock',
            status: 200,
            responseBody: '{}'
        });

        hook.enable();

        await window.fetch('/api/mock');
        expect(realFetch).toHaveBeenCalled();
    });

    test('intercepts XHR with mock', (done) => {
        store.addMock({
            id: '2',
            active: true,
            method: 'POST',
            urlPattern: '/api/xhr',
            status: 201,
            responseBody: '{"created":true}'
        });

        hook.enable();

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/xhr');

        xhr.onload = () => {
            expect(xhr.status).toBe(201);
            expect(xhr.responseText).toBe('{"created":true}');
            expect(xhr.getResponseHeader('x-mocked-by')).toBe('osodreamer-console');
            done();
        };

        xhr.send();
    });

    test('handles request body parsing types', async () => {
        hook.enable();

        // FormData
        const fd = new FormData();
        fd.append('file', new File(['content'], 'test.txt'));
        fd.append('field', 'value');
        await window.fetch('/api/upload', { method: 'POST', body: fd }).catch(() => { });

        let req = Object.values(store.state.reqs).find(r => r.url === '/api/upload');
        expect(req).toBeTruthy();
        expect(req?.reqBody).toHaveProperty('field', 'value');
        expect(req?.reqBody['file']).toContain('test.txt');

        // URLSearchParams
        const params = new URLSearchParams({ q: 'search' });
        await window.fetch('/api/search', { method: 'POST', body: params }).catch(() => { });
        req = Object.values(store.state.reqs).find(r => r.url === '/api/search');
        expect(req?.reqBody).toEqual({ q: 'search' });
    });

    test('handles obscure URL parsing', async () => {
        hook.enable();
        await window.fetch('//protocol-less');
        const req = Object.values(store.state.reqs).find(r => r.fullUrl.includes('protocol-less'));
        expect(req).toBeTruthy();
    });

    test('handles XHR Error event', (done) => {
        hook.enable();
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/fail');

        // Delay error trigger slightly to ensure listeners attached
        setTimeout(() => {
            xhr.dispatchEvent(new Event('error'));
        }, 10);

        xhr.addEventListener('error', () => {
            // Wait for hook to process error
            setTimeout(() => {
                const req = Object.values(store.state.reqs).find(r => r.url === '/api/fail');
                expect(req?.status).toBe('ERR');
                done();
            }, 10);
        });

        xhr.send();
    });
});
