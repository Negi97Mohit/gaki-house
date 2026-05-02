// src/hooks/useSnapGuides.ts

import { useMemo } from 'react';
import { GeneratedLayout } from "@gaki/core/types/caption";

export interface SnapPoint {
    value: number; // Position in percentage
    type: 'center' | 'edge' | 'element';
    axis: 'x' | 'y';
    elementId?: string;
    label?: string; // For debugging
}

export interface GuideLine {
    axis: 'x' | 'y';
    position: number; // Percentage
    type: 'center' | 'edge' | 'element';
}

export interface SnapResult {
    snappedPosition: { x: number; y: number };
    guides: GuideLine[];
}

export interface OverlayElement {
    id: string;
    layout: GeneratedLayout;
    type?: string; // 'text', 'browser', 'file', etc.
}

interface UseSnapGuidesProps {
    containerSize: { width: number; height: number };
    allElements: OverlayElement[];
    currentElementId?: string;
    snapThreshold?: number; // Percentage threshold for snapping (default: 2%)
}

/**
 * Custom hook to calculate snap points and guide lines for draggable elements
 * 
 * Features:
 * - Snap to canvas center (50%, 50%)
 * - Snap to canvas edges (0%, 100%)
 * - Snap to other element edges and centers
 * - Visual guide lines when snapping
 */
export function useSnapGuides({
    containerSize,
    allElements,
    currentElementId,
    snapThreshold = 3, // 3% = 15-30px on typical canvas - more forgiving
}: UseSnapGuidesProps) {

    /**
     * Calculate all possible snap points
     */
    const snapPoints = useMemo((): { x: SnapPoint[]; y: SnapPoint[] } => {
        const xPoints: SnapPoint[] = [];
        const yPoints: SnapPoint[] = [];

        // Canvas center
        xPoints.push({ value: 50, type: 'center', axis: 'x', label: 'Canvas Center X' });
        yPoints.push({ value: 50, type: 'center', axis: 'y', label: 'Canvas Center Y' });

        // Canvas edges
        xPoints.push({ value: 0, type: 'edge', axis: 'x', label: 'Canvas Left Edge' });
        xPoints.push({ value: 100, type: 'edge', axis: 'x', label: 'Canvas Right Edge' });
        yPoints.push({ value: 0, type: 'edge', axis: 'y', label: 'Canvas Top Edge' });
        yPoints.push({ value: 100, type: 'edge', axis: 'y', label: 'Canvas Bottom Edge' });

        // Other elements (excluding current element)
        allElements.forEach((element) => {
            if (element.id === currentElementId) return;

            const { position, size } = element.layout;

            // Element edges
            const left = position.x;
            const right = position.x + size.width;
            const top = position.y;
            const bottom = position.y + size.height;

            // Element center
            const centerX = position.x + size.width / 2;
            const centerY = position.y + size.height / 2;

            // X-axis snap points
            xPoints.push({ value: left, type: 'element', axis: 'x', elementId: element.id, label: `${element.type} Left` });
            xPoints.push({ value: right, type: 'element', axis: 'x', elementId: element.id, label: `${element.type} Right` });
            xPoints.push({ value: centerX, type: 'element', axis: 'x', elementId: element.id, label: `${element.type} Center X` });

            // Y-axis snap points
            yPoints.push({ value: top, type: 'element', axis: 'y', elementId: element.id, label: `${element.type} Top` });
            yPoints.push({ value: bottom, type: 'element', axis: 'y', elementId: element.id, label: `${element.type} Bottom` });
            yPoints.push({ value: centerY, type: 'element', axis: 'y', elementId: element.id, label: `${element.type} Center Y` });
        });

        return { x: xPoints, y: yPoints };
    }, [allElements, currentElementId]);

    /**
     * Calculate snap result for a given position and size
     */
    const calculateSnap = (
        position: { x: number; y: number },
        size: { width: number; height: number }
    ): SnapResult => {
        const guides: GuideLine[] = [];
        let snappedX = position.x;
        let snappedY = position.y;

        // Calculate element edges and center
        const elementLeft = position.x;
        const elementRight = position.x + size.width;
        const elementCenterX = position.x + size.width / 2;

        const elementTop = position.y;
        const elementBottom = position.y + size.height;
        const elementCenterY = position.y + size.height / 2;

        // Check X-axis snapping
        let closestXDist = Infinity;
        let closestXPoint: SnapPoint | null = null;
        let xSnapType: 'left' | 'right' | 'center' | null = null;

        snapPoints.x.forEach((point) => {
            // Check left edge
            const leftDist = Math.abs(elementLeft - point.value);
            if (leftDist < closestXDist && leftDist <= snapThreshold) {
                closestXDist = leftDist;
                closestXPoint = point;
                xSnapType = 'left';
            }

            // Check right edge
            const rightDist = Math.abs(elementRight - point.value);
            if (rightDist < closestXDist && rightDist <= snapThreshold) {
                closestXDist = rightDist;
                closestXPoint = point;
                xSnapType = 'right';
            }

            // Check center
            const centerDist = Math.abs(elementCenterX - point.value);
            if (centerDist < closestXDist && centerDist <= snapThreshold) {
                closestXDist = centerDist;
                closestXPoint = point;
                xSnapType = 'center';
            }
        });

        // Apply X snapping
        if (closestXPoint && xSnapType) {
            if (xSnapType === 'left') {
                snappedX = closestXPoint.value;
            } else if (xSnapType === 'right') {
                snappedX = closestXPoint.value - size.width;
            } else if (xSnapType === 'center') {
                snappedX = closestXPoint.value - size.width / 2;
            }

            guides.push({
                axis: 'x',
                position: closestXPoint.value,
                type: closestXPoint.type,
            });
        }

        // Check Y-axis snapping (same logic as X)
        let closestYDist = Infinity;
        let closestYPoint: SnapPoint | null = null;
        let ySnapType: 'top' | 'bottom' | 'center' | null = null;

        snapPoints.y.forEach((point) => {
            // Check top edge
            const topDist = Math.abs(elementTop - point.value);
            if (topDist < closestYDist && topDist <= snapThreshold) {
                closestYDist = topDist;
                closestYPoint = point;
                ySnapType = 'top';
            }

            // Check bottom edge
            const bottomDist = Math.abs(elementBottom - point.value);
            if (bottomDist < closestYDist && bottomDist <= snapThreshold) {
                closestYDist = bottomDist;
                closestYPoint = point;
                ySnapType = 'bottom';
            }

            // Check center
            const centerDist = Math.abs(elementCenterY - point.value);
            if (centerDist < closestYDist && centerDist <= snapThreshold) {
                closestYDist = centerDist;
                closestYPoint = point;
                ySnapType = 'center';
            }
        });

        // Apply Y snapping
        if (closestYPoint && ySnapType) {
            if (ySnapType === 'top') {
                snappedY = closestYPoint.value;
            } else if (ySnapType === 'bottom') {
                snappedY = closestYPoint.value - size.height;
            } else if (ySnapType === 'center') {
                snappedY = closestYPoint.value - size.height / 2;
            }

            guides.push({
                axis: 'y',
                position: closestYPoint.value,
                type: closestYPoint.type,
            });
        }

        return {
            snappedPosition: { x: snappedX, y: snappedY },
            guides,
        };
    };

    return {
        calculateSnap,
        snapPoints, // Exposed for debugging
    };
}
