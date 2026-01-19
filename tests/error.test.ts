import { ErrorHook } from '../src/hooks/error';
import { ConsoleHook } from '../src/hooks/console';
import { Store } from '../src/store';

describe('ErrorHook', () => {
    let store: Store;
    let hook: ErrorHook;
    let consoleHook: ConsoleHook;

    beforeEach(() => {
        store = new Store();
        consoleHook = new ConsoleHook(store);
        consoleHook.enable();

        hook = new ErrorHook(store);
        hook.enable();
    });

    test('captures window.onerror', () => {
        const err = new Error('Global Error');
        // @ts-ignore
        window.onerror('Msg', 'file.js', 10, 20, err);

        const logs = store.state.logs;
        expect(logs.length).toBe(1);
        expect(logs[0].type).toBe('error');
        expect(logs[0].args).toContain(err);
    });

    test('captures unhandledrejection', () => {
        const event = new Event('unhandledrejection') as any;
        event.reason = new Error('Promise Fail');
        window.dispatchEvent(event);

        const logs = store.state.logs;
        expect(logs.length).toBe(1);
        expect(logs[0].type).toBe('error');
    });
});
