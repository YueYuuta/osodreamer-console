import { Store } from '../store';
import { LogEntry, NetworkRequest, ConsoleConfig } from '../types';
import { STYLES } from './styles';
import { Draggable } from './draggable';

export class Renderer {
    store: Store;
    dom: any = {};
    config: ConsoleConfig = {};

    constructor(store: Store) {
        this.store = store;
    }

    setConfig(config: ConsoleConfig) {
        this.config = config;
        this.applyTheme();
        this.applyTrigger();
    }

    init() {
        this.injectStyles();
        this.buildDOM();
        this.bindEvents();
        new Draggable(this.dom.btn, () => this.toggle());

        this.switchTab('console');

        this.store.subscribe(() => this.render());
    }

    injectStyles() {
        const ID = 'osodreamer-console-style';
        if (!document.getElementById(ID)) {
            const style = document.createElement('style');
            style.id = ID;
            style.textContent = STYLES;
            document.head.appendChild(style);
        }
    }

    buildDOM() {
        const root = document.createElement('div');
        root.className = 'odc';
        root.innerHTML = `
        <div class="odc__trigger" id="odc-btn"><div class="odc__dot"></div></div>
        <div class="odc__panel" id="odc-panel">
            <div class="odc__header">
                <div class="odc__tabs-scroll">
                    <div class="odc__tab odc__tab--active" data-tab="console">Console</div>
                    <div class="odc__tab" data-tab="network">Network</div>
                    <div class="odc__tab" data-tab="storage">Storage</div>
                    <div class="odc__tab" data-tab="system">System</div>
                </div>
                <div class="odc__spacer"></div>
                <input class="odc__search" id="odc-search" placeholder="Filter..." />
                <div class="odc__close" id="odc-close">✕</div>
            </div>
            <div class="odc__content" id="odc-content"></div>
            <div class="odc__input-box" id="odc-input-box">
                <input class="odc__input" id="odc-cmd" placeholder="> Run JS..." />
            </div>
            <div class="odc__overlay" id="odc-overlay">
                <div class="odc__ov-head">
                    <span id="odc-ov-title" style="font-weight:bold;max-width:80%;overflow:hidden;text-overflow:ellipsis">Detail</span>
                    <button id="odc-ov-close" style="background:#ef4444;border:none;color:white;padding:4px 8px;border-radius:4px;cursor:pointer">Close</button>
                </div>
                <div class="odc__ov-body" id="odc-ov-body"></div>
            </div>
        </div>
    `;
        document.body.appendChild(root);

        this.dom = {
            root,
            btn: root.querySelector('#odc-btn'),
            panel: root.querySelector('#odc-panel'),
            content: root.querySelector('#odc-content'),
            tabs: root.querySelectorAll('.odc__tab[data-tab]'),
            cmd: root.querySelector('#odc-cmd'),
            inputBox: root.querySelector('#odc-input-box'),
            overlay: root.querySelector('#odc-overlay'),
            ovTitle: root.querySelector('#odc-ov-title'),
            ovBody: root.querySelector('#odc-ov-body'),
            closeBtn: root.querySelector('#odc-close'),
            ovCloseBtn: root.querySelector('#odc-ov-close'),
            search: root.querySelector('#odc-search')
        };
    }

    bindEvents() {
        this.dom.tabs.forEach((t: HTMLElement) => {
            t.onclick = () => this.switchTab(t.dataset.tab || 'console');
        });
        this.dom.closeBtn.onclick = () => this.toggle();
        this.dom.ovCloseBtn.onclick = () => this.dom.overlay.style.display = 'none';

        this.dom.cmd.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                this.store.addLog({ type: 'log', args: [`> ${val}`], time: new Date() }, 9999);
                try {
                    // eslint-disable-next-line no-eval
                    const res = (window as any).eval(val);
                    console.log(res);
                } catch (err) {
                    console.error(err);
                }
                (e.target as HTMLInputElement).value = '';
            }
        });

        this.dom.search.addEventListener('input', (e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            this.store.setSearchQuery(val);
        });
    }

    toggle() {
        this.store.state.isOpen = !this.store.state.isOpen;
        this.dom.panel.style.display = this.store.state.isOpen ? 'flex' : 'none';
        if (this.store.state.isOpen) this.render();
    }

    switchTab(tab: string) {
        this.store.state.activeTab = tab;
        this.dom.tabs.forEach((t: HTMLElement) => {
            t.classList.toggle('odc__tab--active', t.dataset.tab === tab);
        });

        // Toggle Search visibility
        const showSearch = ['console', 'network'].includes(tab);
        if (this.dom.search) {
            this.dom.search.style.display = showSearch ? 'block' : 'none';
        }

        // Toggle Input Box visibility
        if (this.dom.inputBox) {
            this.dom.inputBox.style.display = tab === 'console' ? 'block' : 'none';
        }

        this.render();
    }

    render() {
        if (!this.store.state.isOpen) return;

        this.dom.content.innerHTML = '';
        const tab = this.store.state.activeTab;

        if (tab === 'console') {
            const logs = this.store.getFilteredLogs();
            logs.forEach(l => this.renderLogRow(l));
            try {
                this.dom.content.scrollTop = this.dom.content.scrollHeight;
            } catch (e) { /* ignore readonly in tests */ }
        } else if (tab === 'network') {
            const reqs = this.store.getFilteredRequests();
            if (!reqs.length) this.dom.content.innerHTML = '<div style="padding:20px;text-align:center;color:#52525b">No traffic</div>';
            reqs.forEach(r => this.renderNetRow(r));
        } else if (tab === 'storage') {
            this.renderStorage();
        } else if (tab === 'system') {
            this.renderSystem();
        }
    }

    renderLogRow(log: LogEntry) {
        const row = document.createElement('div');
        row.className = `odc__row odc__row--${log.type}`;
        const timeStr = log.time.toLocaleTimeString([], { hour12: false }).split(' ')[0];
        row.innerHTML = `<span class="odc__time">${timeStr}</span>`;

        log.args.forEach(arg => {
            const el = this.renderObject(arg);
            el.style.marginRight = '6px';
            row.appendChild(el);
        });
        this.dom.content.appendChild(row);
    }

    renderNetRow(req: NetworkRequest) {
        const row = document.createElement('div');
        row.className = 'odc__net';
        const stClass = (Number(req.status) >= 200 && Number(req.status) < 300) ? 'odc__status--ok' : 'odc__status--err';
        const dur = req.duration > 0 ? `${req.duration}ms` : '...';

        row.innerHTML = `
        <div class="odc__method">${req.method}</div>
        <div class="${stClass}" style="font-weight:600;font-size:10px;text-align:center">${req.status}</div>
        <div class="odc__url">${req.url}</div>
        <div style="font-size:10px;text-align:right;color:#52525b">${dur}</div>
    `;
        row.onclick = () => this.showDetail(req);
        this.dom.content.appendChild(row);
    }

    showDetail(data: any) {
        this.dom.ovTitle.textContent = data.url ? data.method + ' ' + data.url : 'Detalle';
        this.dom.ovBody.innerHTML = '';

        const add = (label: string, content: any) => {
            const div = document.createElement('div');
            div.innerHTML = `<div class="odc__section">${label}</div>`;
            if (!content || (typeof content === 'object' && !Object.keys(content).length)) {
                div.innerHTML += '<span style="color:#52525b">Empty</span>';
            } else if (label.includes('Headers') || label.includes('Params')) {
                for (let k in content) {
                    div.innerHTML += `<div class="odc__kv"><span class="odc__k">${k}:</span><span class="odc__v">${content[k]}</span></div>`;
                }
            } else {
                div.appendChild(this.renderObject(content));
            }
            this.dom.ovBody.appendChild(div);
        };

        if (data.type === 'fetch' || data.type === 'xhr') {
            add('General', { Status: data.status, Time: data.duration + 'ms', Type: data.type.toUpperCase() });
            add('Request Headers', data.reqHeaders);
            add('Query Params', data.params);
            add('Request Body', data.reqBody);
            add('Response Headers', data.resHeaders);
            add('Response Body', data.resBody);
        }
        this.dom.overlay.style.display = 'flex';
    }

    renderSystem() {
        let mem = 'N/A';
        // @ts-ignore
        if (performance?.memory) mem = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB';

        this.dom.content.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:15px">
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;text-align:center">
                <div style="font-size:10px;color:#71717a">FPS</div>
                <div style="font-size:20px;font-weight:bold;color:#fff">${this.store.state.fps}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;text-align:center">
                <div style="font-size:10px;color:#71717a">MEMORY</div>
                <div style="font-size:20px;font-weight:bold;color:#60a5fa">${mem}</div>
            </div>
            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;text-align:center">
                <div style="font-size:10px;color:#71717a">VIEWPORT</div>
                <div style="font-size:16px;color:#fff">${window.innerWidth} x ${window.innerHeight}</div>
            </div>
        </div>
        <div style="padding:0 15px;font-size:10px;color:#52525b;word-break:break-all">${navigator.userAgent}</div>
      `;
    }

    renderStorage() {
        const createSec = (title: string, store: Storage) => {
            const sec = document.createElement('div');
            sec.innerHTML = `<div class="odc__section" style="padding:0 12px;display:flex;justify-content:space-between">${title} <span style="cursor:pointer;color:#ef4444" id="clr-${title.replace(/ /g, '')}">Clear</span></div>`;

            if (store.length === 0) sec.innerHTML += '<div style="padding:12px;color:#52525b;font-style:italic">Empty</div>';

            for (let i = 0; i < store.length; i++) {
                const k = store.key(i);
                if (!k) continue;
                const row = document.createElement('div');
                row.className = 'odc__row';
                row.style.justifyContent = 'space-between';
                row.innerHTML = `<span style="color:#e4e4e7">${k}</span> <span style="color:#71717a;overflow:hidden;text-overflow:ellipsis;max-width:50%">${store.getItem(k)}</span>`;
                const btn = document.createElement('span');
                btn.textContent = '×';
                btn.style.color = '#ef4444';
                btn.style.cursor = 'pointer';
                btn.style.padding = '0 8px';
                btn.onclick = () => { store.removeItem(k); this.render(); };
                row.appendChild(btn);
                sec.appendChild(row);
            }
            setTimeout(() => {
                const clr = sec.querySelector(`#clr-${title.replace(/ /g, '')}`);
                if (clr) {
                    (clr as HTMLElement).onclick = () => { if (confirm('Borrar todo?')) { store.clear(); this.render(); } };
                }
            }, 0);
            this.dom.content.appendChild(sec);
        };
        createSec('Local Storage', localStorage);
        createSec('Session Storage', sessionStorage);
    }

    // --- HELPERS ---
    renderObject(obj: any): HTMLElement {
        if (obj === null) return this._sp('null', 'od-null');
        if (obj === undefined) return this._sp('undefined', 'od-null');
        if (typeof obj === 'number') return this._sp(String(obj), 'od-num');
        if (typeof obj === 'boolean') return this._sp(String(obj), 'od-null');
        if (typeof obj === 'string') return this._sp(`"${obj}"`, 'od-str');

        // Handle Function
        if (typeof obj === 'function') return this._sp(`f ${obj.name || '()'}`, 'od-key');

        const isArr = Array.isArray(obj);
        let label = '';
        try {
            label = isArr ? `Array(${obj.length})` : `Object {${Object.keys(obj).length}}`;
        } catch {
            label = 'Object (Error)';
        }

        const det = document.createElement('details');
        const sum = document.createElement('summary');
        sum.textContent = label;
        det.appendChild(sum);

        let loaded = false;
        det.ontoggle = () => {
            if (det.open && !loaded) {
                loaded = true;
                const wrap = document.createElement('div');
                wrap.style.paddingLeft = '12px';
                wrap.style.borderLeft = '1px solid rgba(255,255,255,0.1)';
                try {
                    for (let k in obj) {
                        const line = document.createElement('div');
                        line.style.display = 'flex';
                        const key = document.createElement('span');
                        key.textContent = k + ': ';
                        key.className = 'od-key';
                        line.appendChild(key);
                        line.appendChild(this.renderObject(obj[k]));
                        wrap.appendChild(line);
                    }
                } catch {
                    wrap.textContent = '[Error rendering object]';
                }
                det.appendChild(wrap);
            }
        };
        return det;
    }

    applyTheme() {
        if (!this.config.theme) return;
        const root = document.documentElement;
        if (this.config.theme.primary) root.style.setProperty('--odc-primary', this.config.theme.primary);
        if (this.config.theme.background) root.style.setProperty('--odc-bg', this.config.theme.background);
        if (this.config.theme.text) root.style.setProperty('--odc-text', this.config.theme.text);
    }

    applyTrigger() {
        const btn = this.dom.btn;
        if (!btn || !this.config.trigger) return;

        // Position
        const pos = this.config.trigger.position || 'bottom-right';
        btn.style.top = 'auto'; btn.style.bottom = 'auto'; btn.style.left = 'auto'; btn.style.right = 'auto';

        if (pos.includes('bottom')) btn.style.bottom = '30px';
        if (pos.includes('top')) btn.style.top = '30px';
        if (pos.includes('right')) btn.style.right = '30px';
        if (pos.includes('left')) btn.style.left = '30px';

        // Color
        if (this.config.trigger.color) {
            btn.style.setProperty('--odc-trigger-bg', this.config.trigger.color);
        }

        // Text vs Dot
        if (this.config.trigger.text) {
            btn.innerHTML = `<span>${this.config.trigger.text}</span>`;
            btn.style.width = 'auto';
            btn.style.padding = '0 15px';
        }
    }

    _sp(txt: string, cls: string) {
        const s = document.createElement('span');
        s.className = cls;
        s.textContent = txt;
        return s;
    }
}
