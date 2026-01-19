import { Store } from '../src/store';
import { ConsoleHook } from '../src/hooks/console';

describe('ConsoleHook', () => {
    let store: Store;
    let hook: ConsoleHook;

    beforeEach(() => {
        store = new Store(100);
        hook = new ConsoleHook(store);
    });

    afterEach(() => {
        hook.disable();
    });

    test('intercepts console.log', () => {
        hook.enable();
        console.log('test message');

        expect(store.state.logs.length).toBe(1);
        expect(store.state.logs[0].type).toBe('log');
        expect(store.state.logs[0].args[0]).toBe('test message');
    });

    test('intercepts console.error', () => {
        hook.enable();
        console.error('critical error');

        expect(store.state.logs.length).toBe(1);
        expect(store.state.logs[0].type).toBe('error');
        expect(store.state.logs[0].args[0]).toBe('critical error');
    });
});
