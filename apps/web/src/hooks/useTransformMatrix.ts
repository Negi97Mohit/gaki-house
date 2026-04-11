// src/hooks/useTransformMatrix.ts

import { useCallback, useMemo } from 'react';

/**
 * 2D Transformation Matrix (3x3)
 * 
 * [ a  c  tx ]   [ scaleX  skewY   translateX ]
 * [ b  d  ty ] = [ skewX   scaleY  translateY ]
 * [ 0  0  1  ]   [ 0       0       1          ]
 * 
 * For rotation + translation + scale:
 * a = scaleX * cos(θ)
 * b = scaleX * sin(θ)
 * c = scaleY * -sin(θ)
 * d = scaleY * cos(θ)
 * tx = translateX
 * ty = translateY
 */
export interface TransformMatrix {
    a: number;  // scaleX * cos(rotation)
    b: number;  // scaleX * sin(rotation)
    c: number;  // scaleY * -sin(rotation)
    d: number;  // scaleY * cos(rotation)
    tx: number; // translateX
    ty: number; // translateY
}

export interface Transform {
    x: number;
    y: number;
    rotation: number; // degrees
    scaleX?: number;
    scaleY?: number;
}

/**
 * Hook for matrix-based transformations
 * 
 * Why matrices?
 * - Rotation + scaling + translation feel coherent
 * - Dragging rotated objects becomes intuitive
 * - Single CSS transform (GPU-accelerated)
 * - No gimbal lock issues
 * 
 * This is how Figma/Canva achieve smooth transformations
 */
export function useTransformMatrix() {
    /**
     * Create transformation matrix from transform properties
     */
    const createMatrix = useCallback(
        (transform: Transform): TransformMatrix => {
            const { x, y, rotation, scaleX = 1, scaleY = 1 } = transform;

            // Convert degrees to radians
            const rad = (rotation * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);

            return {
                a: scaleX * cos,
                b: scaleX * sin,
                c: scaleY * -sin,
                d: scaleY * cos,
                tx: x,
                ty: y,
            };
        },
        []
    );

    /**
     * Convert matrix to CSS transform string
     */
    const matrixToCSS = useCallback((matrix: TransformMatrix): string => {
        const { a, b, c, d, tx, ty } = matrix;
        return `matrix(${a}, ${b}, ${c}, ${d}, ${tx}, ${ty})`;
    }, []);

    /**
     * Apply matrix transform to DOM element (GPU-accelerated)
     */
    const applyMatrix = useCallback(
        (element: HTMLElement, matrix: TransformMatrix) => {
            element.style.transform = matrixToCSS(matrix);
            element.style.willChange = 'transform';
        },
        [matrixToCSS]
    );

    /**
     * Create CSS transform string directly from transform properties
     * Simpler alternative when you don't need matrix math
     */
    const createTransformCSS = useCallback(
        (transform: Transform): string => {
            const { x, y, rotation, scaleX = 1, scaleY = 1 } = transform;

            // Use individual transforms (also GPU-accelerated)
            return `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
        },
        []
    );

    /**
     * Apply transform directly to element
     */
    const applyTransform = useCallback(
        (element: HTMLElement, transform: Transform) => {
            element.style.transform = createTransformCSS(transform);
            element.style.willChange = 'transform';
        },
        [createTransformCSS]
    );

    /**
     * Remove GPU optimization hint
     */
    const clearWillChange = useCallback((element: HTMLElement) => {
        element.style.willChange = 'auto';
    }, []);

    /**
     * Multiply two matrices (for composing transforms)
     */
    const multiplyMatrices = useCallback(
        (m1: TransformMatrix, m2: TransformMatrix): TransformMatrix => {
            return {
                a: m1.a * m2.a + m1.c * m2.b,
                b: m1.b * m2.a + m1.d * m2.b,
                c: m1.a * m2.c + m1.c * m2.d,
                d: m1.b * m2.c + m1.d * m2.d,
                tx: m1.a * m2.tx + m1.c * m2.ty + m1.tx,
                ty: m1.b * m2.tx + m1.d * m2.ty + m1.ty,
            };
        },
        []
    );

    /**
     * Extract rotation angle from matrix (in degrees)
     */
    const getRotation = useCallback((matrix: TransformMatrix): number => {
        return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
    }, []);

    /**
     * Extract scale from matrix
     */
    const getScale = useCallback(
        (matrix: TransformMatrix): { scaleX: number; scaleY: number } => {
            const scaleX = Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b);
            const scaleY = Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d);
            return { scaleX, scaleY };
        },
        []
    );

    return {
        createMatrix,
        matrixToCSS,
        applyMatrix,
        createTransformCSS,
        applyTransform,
        clearWillChange,
        multiplyMatrices,
        getRotation,
        getScale,
    };
}
