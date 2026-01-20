export class Draggable {
    element: HTMLElement;
    isDragging: boolean = false;
    startX: number = 0;
    startY: number = 0;
    initialLeft: number = 0;
    initialTop: number = 0;
    onClick: () => void;

    constructor(element: HTMLElement, onClick: () => void) {
        this.element = element;
        this.onClick = onClick;
        this.init();
    }

    init() {
        const start = (cx: number, cy: number) => {
            this.isDragging = false;
            this.startX = cx;
            this.startY = cy;
            const rect = this.element.getBoundingClientRect();
            this.initialLeft = rect.left;
            this.initialTop = rect.top;

            this.element.style.bottom = 'auto';
            this.element.style.right = 'auto';
            this.element.style.left = this.initialLeft + 'px';
            this.element.style.top = this.initialTop + 'px';
        };

        const move = (cx: number, cy: number) => {
            if (Math.abs(cx - this.startX) > 5 || Math.abs(cy - this.startY) > 5) {
                this.isDragging = true;
            }
            if (this.isDragging) {
                this.element.style.left = (this.initialLeft + (cx - this.startX)) + 'px';
                this.element.style.top = (this.initialTop + (cy - this.startY)) + 'px';
            }
        };

        const endDrag = () => {
            if (this.isDragging) {
                this.snapToBounds();
            } else {
                this.onClick();
            }
        };

        const endTouch = (e: TouchEvent) => {
            if (e.cancelable) e.preventDefault();
            endDrag();
        };

        const endMouse = () => {
            endDrag();
        };

        // Touch events
        this.element.addEventListener('touchstart', (e) => start(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
        this.element.addEventListener('touchmove', (e) => {
            if (e.cancelable) e.preventDefault();
            move(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
        this.element.addEventListener('touchend', endTouch);

        this.element.addEventListener('mousedown', (e) => start(e.clientX, e.clientY));
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging || (e.buttons === 1 && this.element.contains(e.target as Node))) {
                move(e.clientX, e.clientY);
            }
        });
        window.addEventListener('mouseup', (e) => {
            if (this.isDragging) endMouse();
        });
        this.element.addEventListener('mouseup', (e) => {
            if (!this.isDragging) endMouse();
        });
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

        // Remove transition after animation
        setTimeout(() => {
            this.element.style.transition = '';
        }, 300);
    }
}
