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

        // Should not throw and should find it
        const filtered = store.getFilteredLogs();
        expect(filtered.length).toBe(1);
    });

    test('notifies on correct tab only', () => {
        const spy = jest.fn();
        store.subscribe(spy);
        store.state.isOpen = true;

        // Console Tab active
        store.state.activeTab = 'console';
        store.addLog({ type: 'log', args: [1], time: new Date() }, 100);
        expect(spy).toHaveBeenCalledTimes(1);

        // Network Tab active (should NOT notify for log)
        spy.mockClear();
        store.state.activeTab = 'network';
        store.addLog({ type: 'log', args: [2], time: new Date() }, 100);
        expect(spy).not.toHaveBeenCalled();

        // But should notify for request
        store.addRequest({ id: '1', url: '/', status: 200 } as any);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
