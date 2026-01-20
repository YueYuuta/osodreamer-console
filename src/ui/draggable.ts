export class Draggable {
    element: HTMLElement;
    isDragging: boolean = false;
    startX: number = 0;
    startY: number = 0;
    initialLeft: number = 0;
    initialTop: number = 0;
    onClick: () => void;
    private isTracking: boolean = false;

    constructor(element: HTMLElement, onClick: () => void) {
        this.element = element;
        this.onClick = onClick;
        this.init();
    }

    init() {
        this.element.style.touchAction = 'none';
        this.element.style.userSelect = 'none';
        this.element.style.cursor = 'grab';

        this.element.addEventListener('mousedown', this.onMouseDown.bind(this));

        this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
        this.element.addEventListener('touchcancel', this.onTouchCancel.bind(this));
    }

    private onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;

        this.startDrag(e.clientX, e.clientY);

        const onMouseMove = (ev: MouseEvent) => {
            this.moveDrag(ev.clientX, ev.clientY);
        };

        const onMouseUp = () => {
            this.endDragSafe();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    private onTouchStart(e: TouchEvent) {
        if (e.touches.length > 1) return;

        const touch = e.touches[0];
        this.startDrag(touch.clientX, touch.clientY);
    }

    private onTouchMove(e: TouchEvent) {
        if (!this.isTracking) return;

        if (e.cancelable) e.preventDefault();

        const touch = e.touches[0];
        this.moveDrag(touch.clientX, touch.clientY);
    }

    private onTouchEnd(e: TouchEvent) {
        if (e.cancelable) e.preventDefault();
        this.endDragSafe();
    }

    private onTouchCancel() {
        this.endDragSafe(false);
    }

    private startDrag(clientX: number, clientY: number) {
        this.isTracking = true;
        this.isDragging = false;
        this.startX = clientX;
        this.startY = clientY;

        const rect = this.element.getBoundingClientRect();
        this.initialLeft = rect.left;
        this.initialTop = rect.top;

        this.element.style.bottom = 'auto';
        this.element.style.right = 'auto';
        this.element.style.left = this.initialLeft + 'px';
        this.element.style.top = this.initialTop + 'px';

        this.element.style.transition = 'none';
        this.element.style.cursor = 'grabbing';
    }

    private moveDrag(clientX: number, clientY: number) {
        if (!this.isTracking) return;

        const dx = clientX - this.startX;
        const dy = clientY - this.startY;

        if (!this.isDragging) {
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                this.isDragging = true;
            }
        }

        if (this.isDragging) {
            this.element.style.left = (this.initialLeft + dx) + 'px';
            this.element.style.top = (this.initialTop + dy) + 'px';
        }
    }

    private endDragSafe(shouldClick: boolean = true) {
        if (!this.isTracking) return;
        this.isTracking = false;
        this.element.style.cursor = 'grab';

        if (this.isDragging) {
            this.snapToBounds();
            this.isDragging = false;
        } else if (shouldClick) {
            this.onClick();
        }
    }

    snapToBounds() {
        const rect = this.element.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const pad = 10;

        let left = rect.left;
        let top = rect.top;

        if (left < pad) left = pad;
        if (left + rect.width > winW - pad) left = winW - rect.width - pad;
        if (top < pad) top = pad;
        if (top + rect.height > winH - pad) top = winH - rect.height - pad;

        this.element.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        this.element.style.left = left + 'px';
        this.element.style.top = top + 'px';


        setTimeout(() => {
            this.element.style.transition = '';
        }, 300);
    }
}
