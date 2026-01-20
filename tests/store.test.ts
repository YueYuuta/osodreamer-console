import { Store } from '../src/store';

describe('Store', () => {
    let store: Store;

    beforeEach(() => {
        store = new Store(3);
    });

    test('respects max logs', () => {
        store.addLog({ type: 'log', args: [1], time: new Date() }, 3);
        store.addLog({ type: 'log', args: [2], time: new Date() }, 3);
        store.addLog({ type: 'log', args: [3], time: new Date() }, 3);
        expect(store.state.logs.length).toBe(3);

        store.addLog({ type: 'log', args: [4], time: new Date() }, 3);
        expect(store.state.logs.length).toBe(3);
        expect(store.state.logs[2].args[0]).toBe(4);
        expect(store.state.logs[0].args[0]).toBe(2);
    });

    test('handles circular references in search', () => {
        const circular: any = { a: 1 };
        circular.self = circular;

        store.addLog({ type: 'log', args: [circular], time: new Date() }, 100);
        store.setSearchQuery('Circular');


        const filtered = store.getFilteredLogs();
        expect(filtered.length).toBe(1);
    });

    test('notifies on correct tab only', () => {
        const spy = jest.fn();
        store.subscribe(spy);
        store.state.isOpen = true;


        store.state.activeTab = 'console';
        store.addLog({ type: 'log', args: [1], time: new Date() }, 100);
        expect(spy).toHaveBeenCalledTimes(1);


        spy.mockClear();
        store.state.activeTab = 'network';
        store.addLog({ type: 'log', args: [2], time: new Date() }, 100);
        expect(spy).not.toHaveBeenCalled();


        store.addRequest({ id: '1', url: '/', status: 200 } as any);
        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('deduplicates logs', () => {
        store.state.activeTab = 'console';
        store.state.isOpen = true;

        store.addLog({ type: 'log', args: ['msg'], time: new Date() }, 10);
        store.addLog({ type: 'log', args: ['msg'], time: new Date() }, 10);

        expect(store.state.logs.length).toBe(1);
        expect(store.state.logs[0].count).toBe(2);

        store.addLog({ type: 'log', args: ['diff'], time: new Date() }, 10);
        expect(store.state.logs.length).toBe(2);
    });

    test('clears logs and requests', () => {
        store.addLog({ type: 'log', args: ['msg'], time: new Date() }, 10);
        store.addRequest({ id: '1', url: '/', status: 200 } as any);

        store.clearLogs();
        expect(store.state.logs.length).toBe(0);

        store.clearRequests();
        expect(Object.keys(store.state.reqs).length).toBe(0);
    });

    test('manages mocks', () => {
        const mockFn = jest.fn();
        store.subscribe(mockFn);

        store.addMock({ id: '1', active: true, method: 'GET', urlPattern: '/test', status: 200, responseBody: '{}' });
        expect(store.state.mocks.length).toBe(1);
        expect(mockFn).toHaveBeenCalled();

        store.toggleMock('1');
        expect(store.state.mocks[0].active).toBe(false);

        store.removeMock('1');
        expect(store.state.mocks.length).toBe(0);
    });
    test('updates mocks', () => {
        store.addMock({ id: '1', active: true, method: 'GET', urlPattern: '/test', status: 200, responseBody: '{}' });
        store.updateMock('1', { status: 404 });
        expect(store.state.mocks[0].status).toBe(404);


        store.updateMock('999', { status: 500 });
    });

    test('unsubscribes listeners', () => {
        const spy = jest.fn();
        const unsub = store.subscribe(spy);

        store.notify();
        expect(spy).toHaveBeenCalledTimes(1);

        unsub();
        store.notify();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    test('filters requests', () => {
        store.addRequest({ id: '1', url: '/api/login', method: 'POST', status: 200 } as any);
        store.addRequest({ id: '2', url: '/api/users', method: 'GET', status: 200 } as any);

        store.setSearchQuery('login');
        expect(store.getFilteredRequests().length).toBe(1);
        expect(store.getFilteredRequests()[0].id).toBe('1');

        store.setSearchQuery('GET');
        expect(store.getFilteredRequests().length).toBe(1);
        expect(store.getFilteredRequests()[0].id).toBe('2');

        store.setSearchQuery('');
        expect(store.getFilteredRequests().length).toBe(2);
    });

    test('updates requests and notifies', () => {
        const spy = jest.fn();
        store.subscribe(spy);
        store.state.isOpen = true;
        store.state.activeTab = 'network';

        store.addRequest({ id: '1', url: '/', method: 'GET', status: 200 } as any);
        spy.mockClear();

        store.updateRequest('1', { status: 500 });
        expect(spy).toHaveBeenCalledTimes(1);
        expect(store.state.reqs['1'].status).toBe(500);
    });

    test('handles circular references in equality check', () => {
        const a: any = { val: 1 };
        a.self = a;
        const b: any = { val: 1 };
        b.self = b; // Same structure circular



        store.addLog({ type: 'log', args: [a], time: new Date() }, 10);
        store.addLog({ type: 'log', args: [b], time: new Date() }, 10);


        expect(store.state.logs.length).toBe(2);
    });
});
