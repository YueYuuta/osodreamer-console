import { Store } from '../store';
import { LogType } from '../types';

export class ConsoleHook {
    store: Store;
    originalConsole: Record<string, Function> = {};

    constructor(store: Store) {
        this.store = store;
    }

    enable() {
        ['log', 'warn', 'error', 'info'].forEach(m => {
            // @ts-ignore
            this.originalConsole[m] = console[m];
            // @ts-ignore
            console[m] = (...args: any[]) => {
                // Call original
                this.originalConsole[m].apply(console, args);

                // Add to store
                this.store.addLog({
                    type: m as LogType,
                    args,
                    time: new Date()
                }, 300);
            };
        });
    }

    disable() {
        Object.keys(this.originalConsole).forEach(m => {
            // @ts-ignore
            console[m] = this.originalConsole[m];
        });
    }
}
