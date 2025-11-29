// src/hooks/usePointerInteraction.ts

import { useCallback, useRef, useEffect } from 'react';
import { useRAFThrottle } from './useRAFThrottle';

export interface PointerInteractionCallbacks {
    onStart?: (e: PointerEvent) => void;
    onMove?: (e: PointerEvent) => void;
    onEnd?: (e: PointerEvent) => void;
    onCancel?: (e: PointerEvent) => void;
}

export interface PointerInteractionOptions {
    throttleMove?: boolean; // Default: true
    capturePointer?: boolean; // Default: true
    preventDefault?: boolean; // Default: true
}

/**
 * High-performance pointer interaction hook using Pointer Events + setPointerCapture
 * 
 * Advantages over mouse events:
 * - Works with mouse, touch, and stylus
 * - No missed events during fast movement
 * - No interference between DOM layers (iframes)
 * - GPU-accelerated tracking
 * 
 * @example
 * const bind = usePointerInteraction({
 *   onStart: (e) => console.log('Started'),
 *   onMove: (e) => updatePosition(e.clientX, e.clientY),
 *   onEnd: (e) => console.log('Ended'),
 * });
 * 
 * return <div {...bind()}>Drag me</div>;
 */
export function usePointerInteraction(
    callbacks: PointerInteractionCallbacks,
    options: PointerInteractionOptions = {}
) {
    const {
        throttleMove = true,
        capturePointer = true,
        preventDefault = true,
    } = options;

    const { onStart, onMove, onEnd, onCancel } = callbacks;

    const activePointerRef = useRef<number | null>(null);
    const targetElementRef = useRef<HTMLElement | null>(null);

    // Throttle move events to RAF
    const throttledMove = useRAFThrottle((e: PointerEvent) => {
        onMove?.(e);
    });

    const handleMove = throttleMove ? throttledMove : onMove;

    // Pointer Down Handler
    const handlePointerDown = useCallback(
        (e: PointerEvent) => {
            // Only handle primary pointer (left mouse, first touch)
            if (!e.isPrimary) return;

            if (preventDefault) {
                e.preventDefault();
            }

            const target = e.currentTarget as HTMLElement;
            targetElementRef.current = target;
            activePointerRef.current = e.pointerId;

            // Capture pointer to receive all events, even outside element
            if (capturePointer && target) {
                target.setPointerCapture(e.pointerId);
            }

            onStart?.(e);
        },
        [onStart, capturePointer, preventDefault]
    );

    // Pointer Move Handler
    const handlePointerMove = useCallback(
        (e: PointerEvent) => {
            // Only handle the active pointer
            if (e.pointerId !== activePointerRef.current) return;

            if (preventDefault) {
                e.preventDefault();
            }

            handleMove?.(e);
        },
        [handleMove, preventDefault]
    );

    // Pointer Up Handler
    const handlePointerUp = useCallback(
        (e: PointerEvent) => {
            // Only handle the active pointer
            if (e.pointerId !== activePointerRef.current) return;

            if (preventDefault) {
                e.preventDefault();
            }

            const target = targetElementRef.current;
            if (capturePointer && target) {
                target.releasePointerCapture(e.pointerId);
            }

            onEnd?.(e);

            activePointerRef.current = null;
            targetElementRef.current = null;
        },
        [onEnd, capturePointer, preventDefault]
    );

    // Pointer Cancel Handler (e.g., when pointer is lost)
    const handlePointerCancel = useCallback(
        (e: PointerEvent) => {
            // Only handle the active pointer
            if (e.pointerId !== activePointerRef.current) return;

            const target = targetElementRef.current;
            if (capturePointer && target) {
                target.releasePointerCapture(e.pointerId);
            }

            onCancel?.(e);

            activePointerRef.current = null;
            targetElementRef.current = null;
        },
        [onCancel, capturePointer]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (activePointerRef.current !== null && targetElementRef.current) {
                targetElementRef.current.releasePointerCapture(activePointerRef.current);
            }
        };
    }, []);

    /**
     * Returns event handlers to spread onto element
     */
    const bind = useCallback(
        () => ({
            onPointerDown: handlePointerDown as any,
            onPointerMove: handlePointerMove as any,
            onPointerUp: handlePointerUp as any,
            onPointerCancel: handlePointerCancel as any,
            // Prevent touch actions for smooth dragging
            style: { touchAction: 'none' } as React.CSSProperties,
        }),
        [handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel]
    );

    return bind;
}
