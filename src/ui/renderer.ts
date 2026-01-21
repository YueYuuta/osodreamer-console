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
                    <div class="odc__tab" data-tab="mocks">Mocks</div>
                    <div class="odc__tab" data-tab="storage">Storage</div>
                    <div class="odc__tab" data-tab="system">System</div>
                </div>
                <div class="odc__spacer"></div>
                <input class="odc__search" id="odc-search" placeholder="Filter..." />
                <div class="odc__clear" id="odc-clear">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
                <div class="odc__close" id="odc-close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
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
            clearBtn: root.querySelector('#odc-clear'),
            ovCloseBtn: root.querySelector('#odc-ov-close'),
            search: root.querySelector('#odc-search')
        };
    }

    bindEvents() {
        this.dom.tabs.forEach((t: HTMLElement) => {
            t.onclick = () => this.switchTab(t.dataset.tab || 'console');
        });
        this.dom.closeBtn.onclick = () => this.toggle();
        this.dom.clearBtn.onclick = () => {
            const tab = this.store.state.activeTab;
            if (tab === 'console') this.store.clearLogs();
            if (tab === 'network') this.store.clearRequests();
            if (tab === 'mocks') {
                if (confirm('Delete all Mocks?')) {
                    this.store.state.mocks = [];
                    this.store.notify();
                }
            }
        };
        this.dom.ovCloseBtn.onclick = () => this.dom.overlay.style.display = 'none';

        this.dom.cmd.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value;
                this.store.addLog({ type: 'log', args: [`> ${val}`], time: new Date() }, 9999);
                try {

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


        const showSearch = ['console', 'network'].includes(tab);
        if (this.dom.search) {
            this.dom.search.style.display = showSearch ? '' : 'none';
        }

        const showClear = ['console', 'network', 'mocks'].includes(tab);
        if (this.dom.clearBtn) {
            this.dom.clearBtn.style.display = showClear ? '' : 'none';
        }


        if (this.dom.inputBox) {
            this.dom.inputBox.style.display = tab === 'console' ? '' : 'none';
        }

        this.render();
    }

    renderedLogCount: number = 0;
    renderedReqCount: number = 0;

    render() {
        if (!this.store.state.isOpen) return;

        const tab = this.store.state.activeTab;

        if (tab === 'console') {
            this.renderConsoleTab();
        } else if (tab === 'network') {
            const reqs = this.store.getFilteredRequests();
            this.dom.content.innerHTML = '';
            if (!reqs.length) this.dom.content.innerHTML = '<div style="padding:20px;text-align:center;color:#52525b">No traffic</div>';
            reqs.forEach(r => this.renderNetRow(r));
        } else if (tab === 'mocks') {
            this.dom.content.innerHTML = '';
            this.renderMocks();
        } else if (tab === 'storage') {
            this.dom.content.innerHTML = '';
            this.renderStorage();
        } else if (tab === 'system') {
            this.dom.content.innerHTML = '';
            this.renderSystem();
        }
    }

    renderConsoleTab() {
        const logs = this.store.getFilteredLogs();
        const searchQuery = this.store.state.searchQuery;

        const isNotConsoleContent = !this.dom.content.querySelector('.odc__row--log') && !this.dom.content.querySelector('.odc__row--info') && !this.dom.content.querySelector('.odc__row--warn') && !this.dom.content.querySelector('.odc__row--error') && this.dom.content.innerHTML !== '';

        const shouldFullRender = searchQuery || logs.length < this.renderedLogCount || this.dom.content.innerHTML === '' || isNotConsoleContent;

        if (shouldFullRender) {
            this.dom.content.innerHTML = '';
            this.renderedLogCount = 0;
            logs.forEach(l => this.renderLogRow(l));
            this.renderedLogCount = logs.length;
        } else {
            if (this.renderedLogCount > 0 && logs.length === this.renderedLogCount) {
                const lastLog = logs[logs.length - 1];
                if (lastLog.count && lastLog.count > 1) {
                    const lastRow = this.dom.content.lastElementChild;
                    if (lastRow) {
                        const badge = lastRow.querySelector('.odc__badge');
                        if (badge) badge.textContent = String(lastLog.count);
                        else {
                            this.dom.content.removeChild(lastRow);
                            this.renderLogRow(lastLog);
                        }
                    }
                }
            } else {
                for (let i = this.renderedLogCount; i < logs.length; i++) {
                    this.renderLogRow(logs[i]);
                }
                this.renderedLogCount = logs.length;
            }
        }

        try {
            this.dom.content.scrollTop = this.dom.content.scrollHeight;
        } catch (e) { }
    }



    renderLogRow(log: LogEntry) {
        const row = document.createElement('div');
        row.className = `odc__row odc__row--${log.type}`;
        const timeStr = log.time.toLocaleTimeString([], { hour12: false }).split(' ')[0];

        let html = `<span class="odc__time">${timeStr}</span>`;
        if (log.count && log.count > 1) {
            html = `<span class="odc__badge" style="background:#ef4444;color:#fff;border-radius:10px;padding:1px 6px;font-size:9px;margin-right:6px;font-weight:bold">${log.count}</span>` + html;
        }
        row.innerHTML = html;

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

        if ((performance as any)?.memory) mem = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + ' MB';

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

    renderMocks() {
        const mocks = this.store.state.mocks;
        const panel = document.createElement('div');
        panel.innerHTML = `
            <div class="odc__section" style="padding:0 12px;display:flex;justify-content:space-between;align-items:center">
                ACTIVE MOCKS 
                <button id="odc-add-mock" style="background:#3b82f6;border:none;color:white;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:10px">+ Add</button>
            </div>
        `;

        if (mocks.length === 0) {
            panel.innerHTML += '<div style="padding:12px;color:#52525b;font-style:italic">No active mocks</div>';
        }

        mocks.forEach(m => {
            const row = document.createElement('div');
            row.className = 'odc__row';
            row.style.justifyContent = 'space-between';
            row.style.alignItems = 'center';

            row.innerHTML = `
                <div style="display:flex;flex-direction:column;gap:2px">
                    <div style="font-weight:bold;color:${m.active ? '#34d399' : '#52525b'}">${m.method.toUpperCase()} ${m.urlPattern}</div>
                    <div style="font-size:10px;color:#71717a">Status: ${m.status}, Delay: ${m.delay || 0}ms</div>
                </div>
                <div style="display:flex;gap:8px">
                    <button class="odc-toggle-mock" style="background:${m.active ? '#10b981' : '#3f3f46'};border:none;color:white;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:9px">${m.active ? 'ON' : 'OFF'}</button>
                    <button class="odc-del-mock" style="background:#ef4444;border:none;color:white;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:9px">×</button>
                </div>
            `;

            const btnToggle = row.querySelector('.odc-toggle-mock') as HTMLElement;
            btnToggle.onclick = () => this.store.toggleMock(m.id);

            const btnDel = row.querySelector('.odc-del-mock') as HTMLElement;
            btnDel.onclick = () => this.store.removeMock(m.id);

            row.onclick = (e) => {
                if (e.target !== btnToggle && e.target !== btnDel) {
                    alert(`Response Body:\n${m.responseBody}`);
                }
            };

            panel.appendChild(row);
        });

        const addBtn = panel.querySelector('#odc-add-mock') as HTMLElement;
        addBtn.onclick = () => {
            const url = prompt("URL Pattern (e.g. /api/login or *users*):", "/api/test");
            if (!url) return;
            const status = prompt("Status Code:", "200");
            const body = prompt("Response JSON:", '{"success":true}');

            if (url && status && body) {
                this.store.addMock({
                    id: Math.random().toString(36).substr(2),
                    active: true,
                    method: '*',
                    urlPattern: url,
                    status: parseInt(status),
                    responseBody: body,
                    delay: 500
                });
            }
        };

        this.dom.content.appendChild(panel);
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

    renderObject(obj: any): HTMLElement {
        if (obj === null) return this._sp('null', 'od-null');
        if (obj === undefined) return this._sp('undefined', 'od-null');
        if (typeof obj === 'number') return this._sp(String(obj), 'od-num');
        if (typeof obj === 'boolean') return this._sp(String(obj), 'od-bool'); // New class od-bool
        if (typeof obj === 'string') {
            const s = this._sp(`"${obj}"`, 'od-str od-str-truncated');
            s.onclick = () => {
                if (s.classList.contains('od-str-truncated')) {
                    s.classList.remove('od-str-truncated');
                    s.classList.add('od-str-expanded');
                } else {
                    s.classList.remove('od-str-expanded');
                    s.classList.add('od-str-truncated');
                }
            };
            return s;
        }


        if (typeof obj === 'function') return this._sp(`f ${obj.name || '()'}`, 'od-key');


        if (obj instanceof Error) {
            const det = document.createElement('details');
            det.style.display = 'inline-block';
            det.style.verticalAlign = 'top';

            const sum = document.createElement('summary');
            sum.style.color = '#ef4444';
            sum.textContent = `${obj.name}: ${obj.message}`;
            det.appendChild(sum);

            const stack = document.createElement('div');
            stack.style.whiteSpace = 'pre-wrap';
            stack.style.fontSize = '10px';
            stack.style.color = '#fca5a5';
            stack.style.marginTop = '4px';
            stack.style.paddingLeft = '10px';
            stack.textContent = obj.stack || '(No stack trace)';

            det.appendChild(stack);
            return det;
        }

        const isArr = Array.isArray(obj);
        let label = '';
        let keys: string[] = [];
        try {
            keys = Object.keys(obj);
            label = isArr ? `Array(${obj.length})` : `Object {${keys.length}}`;
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

                const renderChunk = (start: number, count: number) => {
                    const limit = Math.min(start + count, keys.length);
                    for (let i = start; i < limit; i++) {
                        const k = keys[i];
                        const line = document.createElement('div');
                        line.style.display = 'flex';
                        const key = document.createElement('span');
                        key.textContent = k + ': ';
                        key.className = 'od-key';
                        line.appendChild(key);
                        try {
                            line.appendChild(this.renderObject(obj[k]));
                        } catch {
                            line.appendChild(this._sp('[Error]', 'od-null'));
                        }
                        wrap.appendChild(line);
                    }

                    if (limit < keys.length) {
                        const moreBtn = document.createElement('div');
                        moreBtn.textContent = `Show ${Math.min(50, keys.length - limit)} more...`;
                        moreBtn.style.cursor = 'pointer';
                        moreBtn.style.color = '#60a5fa';
                        moreBtn.style.padding = '4px 0';
                        moreBtn.style.fontSize = '10px';
                        moreBtn.onclick = () => {
                            moreBtn.remove();
                            renderChunk(limit, 50);
                        };
                        wrap.appendChild(moreBtn);
                    }
                };


                renderChunk(0, 50);
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
        if (!btn) return;

        const trigger = this.config.trigger || {};

        if (trigger.text) {
            btn.textContent = trigger.text;
            btn.style.width = 'auto';
            btn.style.padding = '8px 12px';
            btn.style.borderRadius = '8px';
        } else {
            btn.innerHTML = '<div class="odc__dot"></div>';
            btn.style.width = '48px';
            btn.style.padding = '0';
            btn.style.borderRadius = '14px';
        }

        if (trigger.color) {
            btn.style.setProperty('--odc-trigger-bg', trigger.color);
        }
    }
    _sp(txt: string, cls: string) {
        const s = document.createElement('span');
        s.className = cls;
        s.textContent = txt;
        return s;
    }
}
