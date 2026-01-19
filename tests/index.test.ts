import OsoDreamerConsole from '../src/index';

describe('Index', () => {
    test('starts system monitor loop', () => {
        jest.useFakeTimers();
        const consoleInstance = new OsoDreamerConsole();
        const renderSpy = jest.spyOn(consoleInstance.renderer, 'render');

        consoleInstance.store.state.isOpen = true;
        consoleInstance.store.state.activeTab = 'system';

        jest.advanceTimersByTime(2000);

        expect(consoleInstance.store.state.fps).toBeGreaterThanOrEqual(0);
        expect(renderSpy).toHaveBeenCalled();
    });
});
