// src/lib/transformUtils.ts

/**
 * Performance utilities for GPU-accelerated transforms
 * 
 * Why CSS transforms instead of top/left?
 * - GPU accelerated (no CPU layout recalculation)
 * - No repaint cascades
 * - 10× faster for drag/rotate/resize
 * - Smooth 60fps by default
 */

export interface TransformProperties {
    x: number;
    y: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
}

/**
 * Apply GPU-accelerated transform to element
 * Use this instead of manipulating top/left/width/height during drag
 */
export function applyGPUTransform(
    element: HTMLElement,
    { x, y, rotation = 0, scaleX = 1, scaleY = 1 }: TransformProperties
): void {
    // Compose transform in optimal order: translate → rotate → scale
    element.style.transform =
        `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;

    // Tell browser to optimize for this property
    element.style.willChange = 'transform';
}

/**
 * Apply transform optimized for dragging (no rotation/scale)
 */
export function applyDragTransform(
    element: HTMLElement,
    x: number,
    y: number
): void {
    // translate3d triggers GPU acceleration
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    element.style.willChange = 'transform';
}

/**
 * Remove GPU optimization hints after interaction ends
 */
export function clearGPUOptimization(element: HTMLElement): void {
    element.style.willChange = 'auto';
}

/**
 * Read current transform values from element
 * Useful for getting current position during interaction
 */
export function getTransformValues(element: HTMLElement): TransformProperties {
    const transform = window.getComputedStyle(element).transform;

    if (transform === 'none') {
        return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    }

    // Parse matrix(a, b, c, d, tx, ty)
    const values = transform.match(/matrix\(([^)]+)\)/)?.[1].split(', ').map(Number);

    if (!values || values.length !== 6) {
        return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    }

    const [a, b, c, d, tx, ty] = values;

    // Extract rotation (in degrees)
    const rotation = Math.atan2(b, a) * (180 / Math.PI);

    // Extract scale
    const scaleX = Math.sqrt(a * a + b * b);
    const scaleY = Math.sqrt(c * c + d * d);

    return {
        x: tx,
        y: ty,
        rotation,
        scaleX,
        scaleY,
    };
}

/**
 * Create a ghost element for smooth dragging
 * This element moves via CSS transforms while React state updates lag-free
 */
export function createGhostElement(
    original: HTMLElement,
    className = 'drag-ghost'
): HTMLElement {
    const ghost = original.cloneNode(true) as HTMLElement;
    ghost.classList.add(className);
    ghost.style.position = 'absolute';
    ghost.style.pointerEvents = 'none';
    ghost.style.opacity = '0.8';
    ghost.style.zIndex = '9999';

    return ghost;
}

/**
 * Add overlay to prevent iframe from capturing pointer events during drag
 */
export function createIframeBlocker(
    container: HTMLElement
): HTMLElement {
    const blocker = document.createElement('div');
    blocker.className = 'iframe-blocker';
    blocker.style.position = 'absolute';
    blocker.style.inset = '0';
    blocker.style.zIndex = '1';
    blocker.style.cursor = 'inherit';

    container.appendChild(blocker);
    return blocker;
}

/**
 * Remove iframe blocker
 */
export function removeIframeBlocker(blocker: HTMLElement): void {
    blocker.remove();
}

/**
 * Optimize element for dragging
 * Call on pointerdown
 */
export function optimizeForDrag(element: HTMLElement): void {
    element.style.willChange = 'transform';
    element.style.userSelect = 'none';
    element.style.cursor = 'grabbing';
}

/**
 * Restore element after dragging
 * Call on pointerup
 */
export function restoreAfterDrag(element: HTMLElement): void {
    element.style.willChange = 'auto';
    element.style.userSelect = '';
    element.style.cursor = '';
}

/**
 * Smoothly animate transform to target value
 * Useful for snap-to animations
 */
export function animateTransform(
    element: HTMLElement,
    target: TransformProperties,
    duration = 200,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
): void {
    element.style.transition = `transform ${duration}ms ${easing}`;
    applyGPUTransform(element, target);

    // Clear transition after animation
    setTimeout(() => {
        element.style.transition = '';
    }, duration);
}

/**
 * Convert percentage position to pixels
 */
export function percentToPixels(
    percent: { x: number; y: number },
    containerSize: { width: number; height: number }
): { x: number; y: number } {
    return {
        x: (percent.x / 100) * containerSize.width,
        y: (percent.y / 100) * containerSize.height,
    };
}

/**
 * Convert pixel position to percentage
 */
export function pixelsToPercent(
    pixels: { x: number; y: number },
    containerSize: { width: number; height: number }
): { x: number; y: number } {
    return {
        x: (pixels.x / containerSize.width) * 100,
        y: (pixels.y / containerSize.height) * 100,
    };
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Check if two transforms are approximately equal
 * Useful for preventing unnecessary updates
 */
export function transformsEqual(
    a: TransformProperties,
    b: TransformProperties,
    epsilon = 0.01
): boolean {
    return (
        Math.abs(a.x - b.x) < epsilon &&
        Math.abs(a.y - b.y) < epsilon &&
        Math.abs((a.rotation || 0) - (b.rotation || 0)) < epsilon &&
        Math.abs((a.scaleX || 1) - (b.scaleX || 1)) < epsilon &&
        Math.abs((a.scaleY || 1) - (b.scaleY || 1)) < epsilon
    );
}
