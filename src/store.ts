import { LogEntry, NetworkRequest, StoreState } from './types';

export class Store {
    state: StoreState;
    listeners: Function[] = [];

    constructor(_maxLogs: number = 300) {
        this.state = {
            logs: [],
            reqs: {},
            fps: 0,
            isOpen: false,
            activeTab: 'console',
            searchQuery: ''
        };
    }

    subscribe(listener: Function) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }

    addLog(log: LogEntry, maxLogs: number) {
        const lastLog = this.state.logs[this.state.logs.length - 1];
        const isDuplicate = lastLog &&
            lastLog.type === log.type &&
            this.compareArgs(lastLog.args, log.args);

        if (isDuplicate) {
            lastLog.count = (lastLog.count || 1) + 1;
            lastLog.time = log.time; // Update time to latest
            if (this.state.isOpen && this.state.activeTab === 'console') {
                this.notify();
            }
            return;
        }

        log.count = 1;
        this.state.logs.push(log);
        if (this.state.logs.length > maxLogs) {
            this.state.logs.shift();
        }

        if (this.state.isOpen && this.state.activeTab === 'console') {
            this.notify();
        }
    }

    private compareArgs(a: any[], b: any[]): boolean {
        if (a.length !== b.length) return false;
        try {
            return JSON.stringify(a) === JSON.stringify(b);
        } catch {
            return false; // Circular refs or errors, assume different
        }
    }

    addRequest(req: NetworkRequest) {
        this.state.reqs[req.id] = req;
        if (this.state.isOpen && this.state.activeTab === 'network') {
            this.notify();
        }
    }

    updateRequest(id: string, updates: Partial<NetworkRequest>) {
        if (this.state.reqs[id]) {
            Object.assign(this.state.reqs[id], updates);
            if (this.state.isOpen && this.state.activeTab === 'network') {
                this.notify();
            }
        }
    }

    setSearchQuery(query: string) {
        this.state.searchQuery = query.toLowerCase();
        this.notify();
    }

    getFilteredLogs(): LogEntry[] {
        if (!this.state.searchQuery) return this.state.logs;

        return this.state.logs.filter(log => {
            const content = log.args.map(a => {
                try {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                } catch {
                    return '[Circular]';
                }
            }).join(' ').toLowerCase();

            return content.includes(this.state.searchQuery);
        });
    }

    getFilteredRequests(): NetworkRequest[] {
        const list = Object.values(this.state.reqs).reverse();
        if (!this.state.searchQuery) return list;

        return list.filter(req => {
            const url = req.url.toLowerCase();
            const method = req.method.toLowerCase();
            const status = String(req.status).toLowerCase();
            return url.includes(this.state.searchQuery) ||
                method.includes(this.state.searchQuery) ||
                status.includes(this.state.searchQuery);
        });
    }
}
