// src/components/video-canvas/HybridDraggable.tsx

/**
 * HybridDraggable Component
 * 
 * High-performance draggable with 60fps smoothness via:
 * 1. Pointer Events + setPointerCapture (no missed events)
 * 2. Direct DOM manipulation during drag (bypasses React)
 * 3. requestAnimationFrame throttling (60-120 fps max)
 * 4. GPU-accelerated CSS transforms (no layout recalc)
 * 5. React state commits only on interaction end
 * 
 * This is the "Canva/Figma secret sauce" for smooth interactions
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { usePointerInteraction } from '@/hooks/usePointerInteraction';
import { useTransformMatrix } from '@/hooks/useTransformMatrix';
import {
    applyGPUTransform,
    createIframeBlocker,
    removeIframeBlocker,
    optimizeForDrag,
    restoreAfterDrag,
    percentToPixels,
    pixelsToPercent,
    clamp,
} from '@/lib/transformUtils';
import {
    useSnapGuides,
    OverlayElement,
    GuideLine,
} from '@/hooks/useSnapGuides';

export interface LayoutUpdate {
    position?: { x: number; y: number }; // Percentage
    size?: { width: number; height: number }; // Percentage
    rotation?: number;
}

export interface HybridDraggableProps {
    id: string;
    position: { x: number; y: number }; // Percentage (0-100)
    size: { width: number; height: number }; // Percentage (0-100)
    rotation?: number; // Degrees
    zIndex: number;
    containerSize: { width: number; height: number }; // Pixels

    // Interaction callbacks
    onCommit: (id: string, layout: LayoutUpdate) => void; // Called on interaction END
    onSelect?: (id: string) => void;

    // Snapping
    allOverlays?: OverlayElement[];
    onSnapGuidesChange?: (guides: GuideLine[]) => void;

    // Configuration
    minWidth?: number; // Pixels
    minHeight?: number; // Pixels
    lockAspectRatio?: boolean;
    enableResizing?: boolean;
    enableRotation?: boolean;

    // Styling
    children: React.ReactNode;
    className?: string;
    dragHandleSelector?: string; // CSS selector for drag handle
    cancelSelector?: string; // CSS selector for non-draggable areas
    isSelected?: boolean;
}

type InteractionMode = 'idle' | 'dragging' | 'resizing' | 'rotating';
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

export const HybridDraggable: React.FC<HybridDraggableProps> = ({
    id,
    position,
    size,
    rotation = 0,
    zIndex,
    containerSize,
    onCommit,
    onSelect,
    allOverlays = [],
    onSnapGuidesChange,
    minWidth = 50,
    minHeight = 50,
    lockAspectRatio = false,
    enableResizing = true,
    enableRotation = true,
    children,
    className,
    dragHandleSelector,
    cancelSelector,
    isSelected = false,
}) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const iframeBlockerRef = useRef<HTMLElement | null>(null);

    const [mode, setMode] = useState<InteractionMode>('idle');
    const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);

    // Local state for smooth visual updates (pixels)
    const [localTransform, setLocalTransform] = useState({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotation,
    });

    // Track interaction start position
    const startStateRef = useRef({
        pointerX: 0,
        pointerY: 0,
        elementX: 0,
        elementY: 0,
        elementWidth: 0,
        elementHeight: 0,
        rotation: 0,
    });

    const { createTransformCSS } = useTransformMatrix();
    const { calculateSnap } = useSnapGuides({
        containerSize,
        allElements: allOverlays,
        currentElementId: id,
        snapThreshold: 3,
    });

    // Sync local state with props when not interacting
    useEffect(() => {
        if (mode === 'idle' && containerSize.width > 0 && containerSize.height > 0) {
            const pixels = percentToPixels(position, containerSize);
            setLocalTransform({
                x: pixels.x,
                y: pixels.y,
                width: (size.width / 100) * containerSize.width,
                height: (size.height / 100) * containerSize.height,
                rotation,
            });
        }
    }, [position, size, rotation, containerSize, mode]);

    // --- Drag Handlers ---

    const handleDragStart = useCallback(
        (e: PointerEvent) => {
            if (!elementRef.current) return;

            // Check if drag should be cancelled
            if (cancelSelector) {
                const target = e.target as HTMLElement;
                if (target.closest(cancelSelector)) return;
            }

            // Check if drag handle is specified
            if (dragHandleSelector) {
                const target = e.target as HTMLElement;
                if (!target.closest(dragHandleSelector)) return;
            }

            setMode('dragging');
            onSelect?.(id);

            // Store start state
            startStateRef.current = {
                pointerX: e.clientX,
                pointerY: e.clientY,
                elementX: localTransform.x,
                elementY: localTransform.y,
                elementWidth: localTransform.width,
                elementHeight: localTransform.height,
                rotation: localTransform.rotation,
            };

            // Optimize element for dragging
            optimizeForDrag(elementRef.current);

            // Add iframe blocker
            if (elementRef.current.querySelector('iframe')) {
                iframeBlockerRef.current = createIframeBlocker(elementRef.current);
            }
        },
        [id, onSelect, localTransform, cancelSelector, dragHandleSelector]
    );

    const handleDragMove = useCallback(
        (e: PointerEvent) => {
            if (!elementRef.current || mode !== 'dragging') return;

            const deltaX = e.clientX - startStateRef.current.pointerX;
            const deltaY = e.clientY - startStateRef.current.pointerY;

            let newX = startStateRef.current.elementX + deltaX;
            let newY = startStateRef.current.elementY + deltaY;

            // Convert to percentage for snapping
            const xPercent = (newX / containerSize.width) * 100;
            const yPercent = (newY / containerSize.height) * 100;
            const widthPercent = (localTransform.width / containerSize.width) * 100;
            const heightPercent = (localTransform.height / containerSize.height) * 100;

            // Calculate snap
            const snapResult = calculateSnap(
                { x: xPercent, y: yPercent },
                { width: widthPercent, height: heightPercent }
            );

            // Show snap guides
            onSnapGuidesChange?.(snapResult.guides);

            // Apply snap to pixel position
            const snappedPixels = percentToPixels(
                snapResult.snappedPosition,
                containerSize
            );
            newX = snappedPixels.x;
            newY = snappedPixels.y;

            // Clamp to bounds
            newX = clamp(newX, 0, containerSize.width - localTransform.width);
            newY = clamp(newY, 0, containerSize.height - localTransform.height);

            // Update local state
            setLocalTransform((prev) => ({ ...prev, x: newX, y: newY }));

            // Apply transform directly to DOM (bypasses React)
            applyGPUTransform(elementRef.current, {
                x: newX,
                y: newY,
                rotation: localTransform.rotation,
            });
        },
        [mode, containerSize, localTransform, calculateSnap, onSnapGuidesChange]
    );

    const handleDragEnd = useCallback(
        (e: PointerEvent) => {
            if (!elementRef.current) return;

            setMode('idle');

            // Clean up
            restoreAfterDrag(elementRef.current);
            if (iframeBlockerRef.current) {
                removeIframeBlocker(iframeBlockerRef.current);
                iframeBlockerRef.current = null;
            }

            // Clear snap guides
            onSnapGuidesChange?.([]);

            // Convert to percentage and commit to React state
            const percent = pixelsToPercent(
                { x: localTransform.x, y: localTransform.y },
                containerSize
            );

            onCommit(id, {
                position: {
                    x: clamp(percent.x, 0, 100),
                    y: clamp(percent.y, 0, 100),
                },
            });
        },
        [id, localTransform, containerSize, onCommit, onSnapGuidesChange]
    );

    // Bind pointer events for dragging
    const dragBind = usePointerInteraction({
        onStart: handleDragStart,
        onMove: handleDragMove,
        onEnd: handleDragEnd,
    });

    // --- Resize Handlers ---
    // (Simplified - full implementation would handle all 8 resize handles)

    const handleResizeStart = useCallback(
        (e: React.PointerEvent, handle: ResizeHandle) => {
            e.stopPropagation();
            if (!elementRef.current) return;

            setMode('resizing');
            setResizeHandle(handle);
            onSelect?.(id);

            startStateRef.current = {
                pointerX: e.clientX,
                pointerY: e.clientY,
                elementX: localTransform.x,
                elementY: localTransform.y,
                elementWidth: localTransform.width,
                elementHeight: localTransform.height,
                rotation: localTransform.rotation,
            };

            optimizeForDrag(elementRef.current);
        },
        [id, onSelect, localTransform]
    );

    const handleResizeMove = useCallback(
        (e: PointerEvent) => {
            if (!elementRef.current || mode !== 'resizing' || !resizeHandle) return;

            const deltaX = e.clientX - startStateRef.current.pointerX;
            const deltaY = e.clientY - startStateRef.current.pointerY;

            let newWidth = startStateRef.current.elementWidth;
            let newHeight = startStateRef.current.elementHeight;
            let newX = startStateRef.current.elementX;
            let newY = startStateRef.current.elementY;

            // Handle different resize directions
            switch (resizeHandle) {
                case 'se': // Bottom-right
                    newWidth = Math.max(minWidth, startStateRef.current.elementWidth + deltaX);
                    newHeight = Math.max(minHeight, startStateRef.current.elementHeight + deltaY);
                    break;
                case 'nw': // Top-left
                    newWidth = Math.max(minWidth, startStateRef.current.elementWidth - deltaX);
                    newHeight = Math.max(minHeight, startStateRef.current.elementHeight - deltaY);
                    newX = startStateRef.current.elementX + (startStateRef.current.elementWidth - newWidth);
                    newY = startStateRef.current.elementY + (startStateRef.current.elementHeight - newHeight);
                    break;
                // Add other handles...
            }

            // Lock aspect ratio if enabled
            if (lockAspectRatio) {
                const aspectRatio = startStateRef.current.elementWidth / startStateRef.current.elementHeight;
                newHeight = newWidth / aspectRatio;
            }

            setLocalTransform((prev) => ({
                ...prev,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
            }));

            // Apply to DOM
            elementRef.current.style.width = `${newWidth}px`;
            elementRef.current.style.height = `${newHeight}px`;
            applyGPUTransform(elementRef.current, {
                x: newX,
                y: newY,
                rotation: localTransform.rotation,
            });
        },
        [mode, resizeHandle, minWidth, minHeight, lockAspectRatio, localTransform]
    );

    const handleResizeEnd = useCallback(
        (e: PointerEvent) => {
            if (!elementRef.current) return;

            setMode('idle');
            setResizeHandle(null);
            restoreAfterDrag(elementRef.current);

            // Commit to React state
            const posPercent = pixelsToPercent(
                { x: localTransform.x, y: localTransform.y },
                containerSize
            );
            const sizePercent = {
                width: (localTransform.width / containerSize.width) * 100,
                height: (localTransform.height / containerSize.height) * 100,
            };

            onCommit(id, {
                position: posPercent,
                size: sizePercent,
            });
        },
        [id, localTransform, containerSize, onCommit]
    );

    const resizeBind = usePointerInteraction({
        onMove: handleResizeMove,
        onEnd: handleResizeEnd,
    });

    // --- Rotation Handlers ---
    // (Simplified - full implementation would use pointer events)

    const handleRotationStart = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!elementRef.current) return;

            setMode('rotating');
            onSelect?.(id);

            const rect = elementRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
            const initialRotation = localTransform.rotation;

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
                const angleDiff = currentAngle - startAngle;
                const newRotation = initialRotation + angleDiff;

                setLocalTransform((prev) => ({ ...prev, rotation: newRotation }));

                if (elementRef.current) {
                    applyGPUTransform(elementRef.current, {
                        x: localTransform.x,
                        y: localTransform.y,
                        rotation: newRotation,
                    });
                }
            };

            const handleMouseUp = () => {
                setMode('idle');
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);

                // Commit rotation
                onCommit(id, { rotation: localTransform.rotation });
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        },
        [id, onSelect, localTransform, onCommit]
    );

    return (
        <div
            ref={elementRef}
            {...dragBind()}
            className={cn(
                'absolute pointer-events-auto',
                className,
                mode !== 'idle' && 'cursor-grabbing',
                isSelected && 'ring-2 ring-primary'
            )}
            style={{
                width: `${localTransform.width}px`,
                height: `${localTransform.height}px`,
                zIndex: mode !== 'idle' ? 9999 : zIndex,
                transform: createTransformCSS({
                    x: localTransform.x,
                    y: localTransform.y,
                    rotation: localTransform.rotation,
                }),
                transformOrigin: 'top left',
            }}
        >
            {children}

            {/* Resize Handles */}
            {isSelected && enableResizing && (
                <>
                    <div
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full cursor-nwse-resize"
                        onPointerDown={(e) => handleResizeStart(e, 'se')}
                    />
                    <div
                        className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full cursor-nwse-resize"
                        onPointerDown={(e) => handleResizeStart(e, 'nw')}
                    />
                </>
            )}

            {/* Rotation Handle */}
            {isSelected && enableRotation && (
                <div
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full cursor-alias"
                    onMouseDown={handleRotationStart}
                />
            )}
        </div>
    );
};
