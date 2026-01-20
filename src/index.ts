import { Store } from './store';
import { Renderer } from './ui/renderer';
import { ConsoleHook } from './hooks/console';
import { ErrorHook } from './hooks/error';
import { NetworkHook } from './hooks/network';
import { ConsoleConfig } from './types';

export * from './types';

export default class OsoDreamerConsole {
    store: Store;
    renderer: Renderer;
    consoleHook: ConsoleHook;
    errorHook: ErrorHook;
    networkHook: NetworkHook;
    config: ConsoleConfig;

    static init(config?: ConsoleConfig): OsoDreamerConsole {
        return new OsoDreamerConsole(config);
    }

    constructor(config: ConsoleConfig = {}) {
        this.config = { maxLogs: 300, ...config };

        this.store = new Store(this.config.maxLogs);

        this.renderer = new Renderer(this.store);
        this.renderer.setConfig(this.config);

        this.consoleHook = new ConsoleHook(this.store);
        this.errorHook = new ErrorHook(this.store);
        this.networkHook = new NetworkHook(this.store);

        this.init();
    }

    private init() {
        this.renderer.init();

        this.consoleHook.enable();
        this.errorHook.enable();
        this.networkHook.enable();

        this.startSystemMonitor();

        console.log("%c OsoDreamer Console Active ", "background:#1d1d1f;color:#fff;border-radius:4px;padding:3px;font-weight:bold;");
    }

    private startSystemMonitor() {
        let last = Date.now(), frames = 0;
        const loop = () => {
            frames++;
            const now = Date.now();
            if (now >= last + 1000) {
                this.store.state.fps = frames;
                frames = 0;
                last = now;
                if (this.store.state.isOpen && this.store.state.activeTab === 'system') {
                    this.renderer.render();
                }
            }
            requestAnimationFrame(loop);
        };
        loop();
    }
}

// @ts-ignore
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.OsoDreamerConsole = OsoDreamerConsole;
}
