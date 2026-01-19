import { Store } from '../store';

export class ErrorHook {
    store: Store;

    constructor(store: Store) {
        this.store = store;
    }

    enable() {
        window.onerror = (message, _source, _lineno, _colno, error) => {
            const msg = typeof message === 'string' ? message : 'Unknown Error';
            console.error(`Uncaught: ${msg}`, error);
            return false;
        };

        window.onunhandledrejection = (event) => {
            console.error(`Unhandled Rejection: ${event.reason}`);
        };
    }
}
