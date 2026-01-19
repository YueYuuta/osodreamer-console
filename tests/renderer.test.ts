import { Renderer } from '../src/ui/renderer';
import { Store } from '../src/store';

describe('Renderer', () => {
    let store: Store;
    let renderer: Renderer;

    beforeEach(() => {
        document.body.innerHTML = '';
        store = new Store();
        renderer = new Renderer(store);
        renderer.init();
    });

    test('builds DOM correctly', () => {
        expect(document.getElementById('odc-panel')).toBeTruthy();
        expect(document.getElementById('odc-btn')).toBeTruthy();
    });

    test('toggles panel visibility', () => {
        const panel = document.getElementById('odc-panel') as HTMLElement;
        expect(panel.style.display).toBe('');

        renderer.toggle();
        expect(store.state.isOpen).toBe(true);
        expect(panel.style.display).toBe('flex');

        renderer.toggle();
        expect(store.state.isOpen).toBe(false);
        expect(panel.style.display).toBe('none');
    });

    test('switches tabs', () => {
        renderer.switchTab('network');
        expect(store.state.activeTab).toBe('network');

        const netTab = document.querySelector('[data-tab="network"]');
        expect(netTab?.classList.contains('odc__tab--active')).toBe(true);

        const consoleTab = document.querySelector('[data-tab="console"]');
        expect(consoleTab?.classList.contains('odc__tab--active')).toBe(false);
    });

    test('renders logs', () => {
        const content = renderer.dom.content;
        Object.defineProperty(content, 'scrollHeight', { value: 100, configurable: true });
        Object.defineProperty(content, 'scrollTop', { value: 0, writable: true, configurable: true });

        store.addLog({ type: 'log', args: ['Test Log'], time: new Date() }, 100);
        renderer.toggle();

        const row = document.querySelector('.odc__row--log');
        expect(row).toBeTruthy();
        expect(row?.innerHTML).toContain('Test Log');
    });

    test('renders network requests and shows detail', () => {
        renderer.switchTab('network');
        renderer.toggle();

        const req = {
            id: '1', method: 'GET', url: '/test', status: 200, duration: 50,
            type: 'fetch' as const, fullUrl: '/test', params: { q: '1' },
            reqHeaders: { 'Content-Type': 'application/json' }, resHeaders: {},
            reqBody: null, resBody: { data: 'ok' }, _start: 0
        };
        store.addRequest(req);

        const netRow = document.querySelector('.odc__net') as HTMLElement;
        expect(netRow).toBeTruthy();
        expect(netRow?.innerHTML).toContain('/test');

        // Test Overlay
        netRow.click();
        const overlay = document.getElementById('odc-overlay') as HTMLElement;
        expect(overlay.style.display).toBe('flex');
        expect(document.getElementById('odc-ov-title')?.textContent).toContain('GET /test');
        expect(overlay.innerHTML).toContain('application/json');
    });

    test('renders storage tab', () => {
        renderer.switchTab('storage');
        renderer.toggle();

        localStorage.setItem('test-key', 'test-value');
        renderer.render();

        expect(renderer.dom.content.innerHTML).toContain('Local Storage');
        expect(renderer.dom.content.innerHTML).toContain('test-key');
        expect(renderer.dom.content.innerHTML).toContain('test-value');

        localStorage.removeItem('test-key');
    });

    test('renders system tab', () => {
        renderer.switchTab('system');
        renderer.toggle();

        expect(renderer.dom.content.innerHTML).toContain('FPS');
        expect(renderer.dom.content.innerHTML).toContain('VIEWPORT');
    });

    test('applying theme', () => {
        renderer.setConfig({ theme: { primary: 'red' } });
        expect(document.documentElement.style.getPropertyValue('--odc-primary')).toBe('red');
    });

    test('applying trigger config', () => {
        renderer.setConfig({ trigger: { text: 'DEBUG', color: 'blue', position: 'top-left' } });
        const btn = document.getElementById('odc-btn') as HTMLElement;
        expect(btn.innerHTML).toContain('DEBUG');
        expect(btn.style.getPropertyValue('--odc-trigger-bg')).toBe('blue');
    });

    test('search filter', () => {
        const input = document.getElementById('odc-search') as HTMLInputElement;
        input.value = 'FilterMe';
        input.dispatchEvent(new Event('input'));

        expect(store.state.searchQuery).toBe('filterme');
    });

    test('command input execution', () => {
        const input = document.getElementById('odc-cmd') as HTMLInputElement;
        input.value = '1+1';

        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

        input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

        expect(logSpy).toHaveBeenCalledWith(2);
        expect(input.value).toBe('');
    });

    test('renderObject handles different types', () => {
        const container = document.createElement('div');

        // Null/Undefined
        container.appendChild(renderer.renderObject(null));
        expect(container.innerHTML).toContain('null');
        container.innerHTML = '';
        container.appendChild(renderer.renderObject(undefined));
        expect(container.innerHTML).toContain('undefined');

        // Primitives
        container.innerHTML = '';
        container.appendChild(renderer.renderObject(123));
        expect(container.innerHTML).toContain('123');
        container.innerHTML = '';
        container.appendChild(renderer.renderObject(true));
        expect(container.innerHTML).toContain('true');
        container.innerHTML = '';
        container.appendChild(renderer.renderObject("hello"));
        expect(container.innerHTML).toContain('"hello"');

        // Function
        container.innerHTML = '';
        const fn = function testFn() { };
        container.appendChild(renderer.renderObject(fn));
        expect(container.innerHTML).toContain('f testFn');

        // Object / Array (Details)
        container.innerHTML = '';
        container.appendChild(renderer.renderObject({ a: 1 }));
        expect(container.innerHTML).toContain('Object {1}');

        container.innerHTML = '';
        container.appendChild(renderer.renderObject([1, 2]));
        expect(container.innerHTML).toContain('Array(2)');
    });

    test('renderObject expands details', () => {
        const obj = { key: 'val' };
        const el = renderer.renderObject(obj);
        const details = el as HTMLDetailsElement;

        expect(details.open).toBe(false);
        details.open = true;
        details.dispatchEvent(new Event('toggle'));

        expect(details.innerHTML).toContain('key:');
        expect(details.innerHTML).toContain('"val"');
    });

    test('command input handles error', () => {
        const input = document.getElementById('odc-cmd') as HTMLInputElement;
        input.value = 'throw new Error("Eval Fail")';

        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

        expect(errorSpy).toHaveBeenCalled();
        expect(input.value).toBe('');
    });

    test('renders storage cleanup button logic', () => {
        jest.useFakeTimers();
        renderer.switchTab('storage');
        renderer.toggle();

        jest.runAllTimers();

        window.confirm = jest.fn(() => true);
        const clearSpy = jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => { });

        const clearBtn = document.getElementById('clr-LocalStorage');
        expect(clearBtn).toBeTruthy();

        clearBtn?.click();
        expect(clearSpy).toHaveBeenCalled();
    });
});
