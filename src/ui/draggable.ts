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

        const endTouch = (e: TouchEvent) => {
            if (!this.isDragging) {
                if (e.cancelable) e.preventDefault(); // Prevent mouse emulation
                this.onClick();
            }
        };

        const endMouse = () => {
            if (!this.isDragging) {
                this.onClick();
            }
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
            if (this.isDragging || (e.buttons === 1 && this.element.contains(e.target as Node)))
                move(e.clientX, e.clientY);
        });
        this.element.addEventListener('mouseup', endMouse);

        this.element.onclick = () => {
            if (!('ontouchstart' in window) && !this.isDragging) {
                // Logic handled by mouseup, but just in case
            }
        };
    }
}
