import { Draggable } from '../src/ui/draggable';

describe('Draggable', () => {
    let el: HTMLElement;
    let onClick: jest.Mock;

    beforeEach(() => {
        el = document.createElement('div');
        el.style.width = '20px';
        el.style.height = '20px';
        document.body.appendChild(el);
        onClick = jest.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    test('calls onclick on simple click', () => {
        new Draggable(el, onClick);

        el.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
        el.dispatchEvent(new MouseEvent('mouseup', { clientX: 0, clientY: 0 }));

        expect(onClick).toHaveBeenCalled();
    });

    test('moves element on mouse drag', () => {
        new Draggable(el, onClick);

        el.getBoundingClientRect = jest.fn(() => ({ left: 10, top: 10, width: 20, height: 20 } as DOMRect));

        el.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }));

        const moveEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 150, buttons: 1 });
        Object.defineProperty(moveEvent, 'target', { value: el });
        window.dispatchEvent(moveEvent);

        el.dispatchEvent(new MouseEvent('mouseup'));

        expect(onClick).not.toHaveBeenCalled();
        expect(el.style.left).toBe('60px');
        expect(el.style.top).toBe('60px');
    });

    test('handles touch drag', () => {
        new Draggable(el, onClick);
        el.getBoundingClientRect = jest.fn(() => ({ left: 0, top: 0 } as DOMRect));

        el.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 10, clientY: 10 } as Touch]
        }));

        el.dispatchEvent(new TouchEvent('touchmove', {
            cancelable: true,
            touches: [{ clientX: 50, clientY: 50 } as Touch]
        }));

        el.dispatchEvent(new TouchEvent('touchend', {
            cancelable: true
        }));

        expect(el.style.left).toBe('40px');
        expect(el.style.top).toBe('40px');
        expect(onClick).not.toHaveBeenCalled();
    });
});
