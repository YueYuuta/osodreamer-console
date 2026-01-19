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
        this.state.logs.push(log);
        if (this.state.logs.length > maxLogs) {
            this.state.logs.shift();
        }

        if (this.state.isOpen && this.state.activeTab === 'console') {
            this.notify();
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
