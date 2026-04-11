// src/hooks/useCursorFeedback.ts

import { useMemo } from 'react';

export type InteractionZone =
    | 'corner-nw'
    | 'corner-ne'
    | 'corner-sw'
    | 'corner-se'
    | 'edge-n'
    | 'edge-s'
    | 'edge-e'
    | 'edge-w'
    | 'rotate'
    | 'center'
    | null;

export interface CursorStyle {
    cursor: string;
    description: string;
}

/**
 * Hook for reactive cursor feedback based on interaction zone
 * 
 * Provides visual feedback for:
 * - Resize directions (8 directions)
 * - Rotation handle
 * - Drag area
 * 
 * This polish detail makes the UI feel professional
 */
export function useCursorFeedback(zone: InteractionZone): CursorStyle {
    return useMemo(() => {
        switch (zone) {
            // Corner resize cursors
            case 'corner-nw':
                return { cursor: 'nwse-resize', description: 'Resize top-left' };
            case 'corner-ne':
                return { cursor: 'nesw-resize', description: 'Resize top-right' };
            case 'corner-sw':
                return { cursor: 'nesw-resize', description: 'Resize bottom-left' };
            case 'corner-se':
                return { cursor: 'nwse-resize', description: 'Resize bottom-right' };

            // Edge resize cursors
            case 'edge-n':
                return { cursor: 'ns-resize', description: 'Resize top' };
            case 'edge-s':
                return { cursor: 'ns-resize', description: 'Resize bottom' };
            case 'edge-e':
                return { cursor: 'ew-resize', description: 'Resize right' };
            case 'edge-w':
                return { cursor: 'ew-resize', description: 'Resize left' };

            // Rotation
            case 'rotate':
                return { cursor: 'alias', description: 'Rotate' };

            // Drag
            case 'center':
                return { cursor: 'move', description: 'Move' };

            default:
                return { cursor: 'default', description: 'Default' };
        }
    }, [zone]);
}

/**
 * Detect interaction zone based on pointer position relative to element
 */
export function detectInteractionZone(
    pointerX: number,
    pointerY: number,
    elementRect: DOMRect,
    handleSize = 10 // pixels
): InteractionZone {
    const { left, top, right, bottom, width, height } = elementRect;

    const isNear = (value: number, target: number, threshold: number) =>
        Math.abs(value - target) <= threshold;

    // Check corners first (priority)
    if (isNear(pointerX, left, handleSize) && isNear(pointerY, top, handleSize)) {
        return 'corner-nw';
    }
    if (isNear(pointerX, right, handleSize) && isNear(pointerY, top, handleSize)) {
        return 'corner-ne';
    }
    if (isNear(pointerX, left, handleSize) && isNear(pointerY, bottom, handleSize)) {
        return 'corner-sw';
    }
    if (isNear(pointerX, right, handleSize) && isNear(pointerY, bottom, handleSize)) {
        return 'corner-se';
    }

    // Check edges
    if (isNear(pointerY, top, handleSize) && pointerX > left + handleSize && pointerX < right - handleSize) {
        return 'edge-n';
    }
    if (isNear(pointerY, bottom, handleSize) && pointerX > left + handleSize && pointerX < right - handleSize) {
        return 'edge-s';
    }
    if (isNear(pointerX, left, handleSize) && pointerY > top + handleSize && pointerY < bottom - handleSize) {
        return 'edge-w';
    }
    if (isNear(pointerX, right, handleSize) && pointerY > top + handleSize && pointerY < bottom - handleSize) {
        return 'edge-e';
    }

    // Inside element = drag
    if (pointerX >= left && pointerX <= right && pointerY >= top && pointerY <= bottom) {
        return 'center';
    }

    return null;
}

/**
 * Get cursor style for rotation based on handle position
 * Adjusts cursor to match rotation angle for intuitive feel
 */
export function getRotationCursor(rotation: number): string {
    // Normalize rotation to 0-360
    const normalized = ((rotation % 360) + 360) % 360;

    // Round to nearest 45 degrees for cursor mapping
    const rounded = Math.round(normalized / 45) * 45;

    const cursorMap: Record<number, string> = {
        0: 'alias',
        45: 'ne-resize',
        90: 'alias',
        135: 'nw-resize',
        180: 'alias',
        225: 'sw-resize',
        270: 'alias',
        315: 'se-resize',
    };

    return cursorMap[rounded] || 'alias';
}
