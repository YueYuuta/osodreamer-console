
import { Draggable } from '../src/ui/draggable';

describe('Draggable', () => {
    let el: HTMLElement;
    let draggable: Draggable;
    let onClick: jest.Mock;

    beforeEach(() => {
        el = document.createElement('div');
        document.body.appendChild(el);
        el.style.width = '50px';
        el.style.height = '50px';
        el.style.position = 'fixed';
        onClick = jest.fn();
        draggable = new Draggable(el, onClick);
        jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
            left: 0, top: 0, width: 50, height: 50, right: 50, bottom: 50, x: 0, y: 0,
            toJSON: () => { }
        });
    });

    afterEach(() => {
        document.body.removeChild(el);
    });

    test('initializes correctness', () => {
        expect(el.style.bottom).toBe('');

    });

    test('handles click without drag', () => {
        const start = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
        el.dispatchEvent(start);

        const end = new MouseEvent('mouseup');
        el.dispatchEvent(end);

        expect(onClick).toHaveBeenCalled();
    });

    test('handles drag', () => {

        el.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));


        el.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10, buttons: 1, bubbles: true }));


        expect(draggable.isDragging).toBe(true);
        expect(el.style.left).not.toBe('');


        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(onClick).not.toHaveBeenCalled();

        expect(el.style.transition).toContain('all');
    });

    test('handles touch drag', () => {

        el.dispatchEvent(new TouchEvent('touchstart', {
            touches: [{ clientX: 0, clientY: 0 } as any] as any
        }));


        el.dispatchEvent(new TouchEvent('touchmove', {
            touches: [{ clientX: 40, clientY: 40 } as any] as any,
            cancelable: true
        }));

        expect(el.style.left).toBe('40px');
        expect(el.style.top).toBe('40px');
        expect(onClick).not.toHaveBeenCalled();
    });

    test('snaps to bounds correctly', () => {

        jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
            left: -100, top: -100, width: 50, height: 50, right: -50, bottom: -50, x: -100, y: -100,
            toJSON: () => { }
        });


        el.style.left = '0px';
        el.style.top = '0px';
        el.dispatchEvent(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }));
        draggable.isDragging = true;

        window.dispatchEvent(new MouseEvent('mouseup'));


        expect(el.style.left).toBe('10px');
        expect(el.style.top).toBe('10px');
    });

    test('cleanup transition after snap', () => {
        jest.useFakeTimers();
        draggable.snapToBounds();
        expect(el.style.transition).toBeTruthy();
        jest.runAllTimers();
        expect(el.style.transition).toBe('');
    });
});
