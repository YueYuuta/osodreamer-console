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
            (this.originalConsole as any)[m] = (console as any)[m];
            (console as any)[m] = (...args: any[]) => {
                this.originalConsole[m].apply(console, args);
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
            (console as any)[m] = this.originalConsole[m];
        });
    }
}
