// src/hooks/usePredictiveSmoothing.ts

import { useRef, useCallback } from 'react';

export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    x: number;
    y: number;
}

/**
 * Hook for predictive motion smoothing (Apple trackpad-like fluidity)
 * 
 * During fast drags:
 * - Predicts next frame position based on velocity
 * - Interpolates position instead of jumping exactly to pointer
 * - Creates fluid, natural-feeling movement
 * 
 * This is the "secret sauce" for premium feel
 */
export function usePredictiveSmoothing(
    predictionStrength = 0.3, // 0.0 = no prediction, 1.0 = full prediction
    smoothingFactor = 0.2 // 0.0 = no smoothing, 1.0 = max smoothing
) {
    const velocityRef = useRef<Velocity>({ x: 0, y: 0 });
    const lastPosRef = useRef<Position>({ x: 0, y: 0 });
    const lastTimeRef = useRef<number>(Date.now());

    /**
     * Calculate smoothed and predicted position
     */
    const smoothPosition = useCallback(
        (currentPos: Position): Position => {
            const now = Date.now();
            const dt = Math.max(1, now - lastTimeRef.current); // Time delta in ms

            // Calculate current velocity (pixels per ms)
            const rawVelocity = {
                x: (currentPos.x - lastPosRef.current.x) / dt,
                y: (currentPos.y - lastPosRef.current.y) / dt,
            };

            // Apply exponential smoothing to velocity (reduces jitter)
            velocityRef.current = {
                x: velocityRef.current.x * (1 - smoothingFactor) + rawVelocity.x * smoothingFactor,
                y: velocityRef.current.y * (1 - smoothingFactor) + rawVelocity.y * smoothingFactor,
            };

            // Predict next position based on velocity
            const predictedDelta = {
                x: velocityRef.current.x * 16, // Assume 16ms per frame (60fps)
                y: velocityRef.current.y * 16,
            };

            const predictedPos = {
                x: currentPos.x + predictedDelta.x * predictionStrength,
                y: currentPos.y + predictedDelta.y * predictionStrength,
            };

            // Update refs
            lastPosRef.current = currentPos;
            lastTimeRef.current = now;

            return predictedPos;
        },
        [predictionStrength, smoothingFactor]
    );

    /**
     * Reset state (call on interaction end)
     */
    const reset = useCallback(() => {
        velocityRef.current = { x: 0, y: 0 };
        lastPosRef.current = { x: 0, y: 0 };
        lastTimeRef.current = Date.now();
    }, []);

    /**
     * Get current velocity
     */
    const getVelocity = useCallback((): Velocity => {
        return { ...velocityRef.current };
    }, []);

    return {
        smoothPosition,
        reset,
        getVelocity,
    };
}

/**
 * Hook for inertia/easing on interaction end
 * Adds gentle deceleration after releasing pointer
 */
export function useInertia(
    friction = 0.92, // 0.0 = instant stop, 1.0 = no friction
    minVelocity = 0.1 // Stop when velocity drops below this
) {
    const animationFrameRef = useRef<number | null>(null);
    const velocityRef = useRef<Velocity>({ x: 0, y: 0 });
    const currentPosRef = useRef<Position>({ x: 0, y: 0 });

    /**
     * Start inertia animation
     */
    const start = useCallback(
        (
            initialVelocity: Velocity,
            startPos: Position,
            onUpdate: (pos: Position) => void,
            onComplete?: () => void
        ) => {
            velocityRef.current = initialVelocity;
            currentPosRef.current = startPos;

            const animate = () => {
                // Apply friction
                velocityRef.current.x *= friction;
                velocityRef.current.y *= friction;

                // Update position
                currentPosRef.current.x += velocityRef.current.x;
                currentPosRef.current.y += velocityRef.current.y;

                onUpdate({ ...currentPosRef.current });

                // Check if velocity is too small to continue
                const speed = Math.sqrt(
                    velocityRef.current.x ** 2 + velocityRef.current.y ** 2
                );

                if (speed > minVelocity) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                } else {
                    animationFrameRef.current = null;
                    onComplete?.();
                }
            };

            animate();
        },
        [friction, minVelocity]
    );

    /**
     * Cancel ongoing inertia animation
     */
    const cancel = useCallback(() => {
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    return {
        start,
        cancel,
    };
}
