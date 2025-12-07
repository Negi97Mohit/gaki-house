// src/hooks/useRAFThrottle.ts

import { useCallback, useRef } from 'react';

/**
 * Hook to throttle high-frequency events to requestAnimationFrame
 * 
 * This prevents jank by capping updates at 60-120 FPS instead of 300+ events/sec
 * Critical for smooth drag/resize operations
 * 
 * @example
 * const throttledMove = useRAFThrottle((e: PointerEvent) => {
 *   updatePosition(e.clientX, e.clientY);
 * });
 */
export function useRAFThrottle<T extends any[]>(
  callback: (...args: T) => void
): (...args: T) => void {
  const pendingRef = useRef(false);
  const lastArgsRef = useRef<T | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const throttled = useCallback(
    (...args: T) => {
      lastArgsRef.current = args;

      if (pendingRef.current) {
        // Already scheduled, just update args
        return;
      }

      pendingRef.current = true;

      rafIdRef.current = requestAnimationFrame(() => {
        if (lastArgsRef.current) {
          callback(...lastArgsRef.current);
        }
        pendingRef.current = false;
        rafIdRef.current = null;
      });
    },
    [callback]
  );

  // Cleanup on unmount
  const cancel = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      pendingRef.current = false;
    }
  }, []);

  return throttled;
}

/**
 * Hook to throttle with immediate first call
 * Useful when you want instant feedback on pointerdown
 */
export function useRAFThrottleImmediate<T extends any[]>(
  callback: (...args: T) => void
): (...args: T) => void {
  const isFirstCallRef = useRef(true);
  const throttled = useRAFThrottle(callback);

  return useCallback(
    (...args: T) => {
      if (isFirstCallRef.current) {
        isFirstCallRef.current = false;
        callback(...args);
      } else {
        throttled(...args);
      }
    },
    [callback, throttled]
  );
}
