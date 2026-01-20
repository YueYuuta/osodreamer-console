
import OsoDreamerConsole from '../src/index';

describe('OsoDreamerConsole', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        // Mock console.log to avoid noise
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    test('initializes via constructor', () => {
        const odc = new OsoDreamerConsole();
        expect(odc).toBeInstanceOf(OsoDreamerConsole);
        expect(odc.store).toBeDefined();
    });

    test('initializes via static method', () => {
        const odc = OsoDreamerConsole.init({ maxLogs: 500 });
        expect(odc.config.maxLogs).toBe(500);
        expect(document.getElementById('odc-btn')).toBeTruthy();
    });

    test('starts system monitor', async () => {
        jest.useFakeTimers();
        const odc = new OsoDreamerConsole();

        // Simulate open system tab
        odc.store.state.isOpen = true;
        odc.store.state.activeTab = 'system';

        const renderSpy = jest.spyOn(odc.renderer, 'render');

        // Fast forward time to trigger loop
        jest.advanceTimersByTime(1100);

        expect(renderSpy).toHaveBeenCalled();
    });

    test('attaches to window', () => {
        // @ts-ignore
        expect(window.OsoDreamerConsole).toBe(OsoDreamerConsole);
    });
});
