// src/hooks/useLayerControls.ts
// Layer ordering controls for canvas elements (like Microsoft Office)

import { useCallback, useMemo } from "react";
import {
    SceneState,
    TextOverlayState,
    FileOverlayState,
    BrowserOverlayState,
    GeneratedOverlay,
    GeneratedLayout,
} from "@/types/caption";

export type ElementType = "text" | "file" | "browser" | "generated" | "camera";

export interface LayerElement {
    id: string;
    type: ElementType;
    zIndex: number;
    layerOrder?: "above-video" | "below-video" | "auto";
}

interface UseLayerControlsProps {
    activeScene: SceneState;
    updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;
    // Camera position is stored as pipPosition/pipSize in scene, not as overlay
    // We'll treat camera as a virtual layer element
}

export interface UseLayerControlsReturn {
    /** Get all elements sorted by zIndex (lowest first) */
    getAllElementsSorted: () => LayerElement[];

    /** Bring element to front (highest zIndex) */
    bringToFront: (id: string, type: ElementType) => void;

    /** Send element to back (lowest zIndex) */
    sendToBack: (id: string, type: ElementType) => void;

    /** Bring element forward by one layer */
    bringForward: (id: string, type: ElementType) => void;

    /** Send element backward by one layer */
    sendBackward: (id: string, type: ElementType) => void;
}

// Base z-index values for different element types
const BASE_Z_INDEX = 100;
const Z_INDEX_STEP = 1;

export function useLayerControls({
    activeScene,
    updateActiveScene,
}: UseLayerControlsProps): UseLayerControlsReturn {

    // Collect all layer elements from the scene
    const getAllElements = useCallback((): LayerElement[] => {
        const elements: LayerElement[] = [];

        // Add text overlays
        activeScene.textOverlays.forEach((overlay) => {
            elements.push({
                id: overlay.id,
                type: "text",
                zIndex: overlay.layout.zIndex,
                layerOrder: overlay.layout.layerOrder,
            });
        });

        // Add file overlays
        activeScene.fileOverlays.forEach((overlay) => {
            elements.push({
                id: overlay.id,
                type: "file",
                zIndex: overlay.layout.zIndex,
                layerOrder: overlay.layout.layerOrder,
            });
        });

        // Add browser overlays
        activeScene.browserOverlays.forEach((overlay) => {
            elements.push({
                id: overlay.id,
                type: "browser",
                zIndex: overlay.layout.zIndex,
                layerOrder: overlay.layout.layerOrder,
            });
        });

        // Add generated overlays
        activeScene.activeOverlays.forEach((overlay) => {
            elements.push({
                id: overlay.id,
                type: "generated",
                zIndex: overlay.layout.zIndex,
                layerOrder: overlay.layout.layerOrder,
            });
        });

        // Add camera as a virtual layer element (when in pip mode)
        if (activeScene.layoutMode === "pip") {
            elements.push({
                id: "camera-pip",
                type: "camera",
                zIndex: 100, // Camera default z-index (from CSS variable --z-video-pip)
                layerOrder: "auto",
            });
        }

        return elements;
    }, [activeScene]);

    const getAllElementsSorted = useCallback((): LayerElement[] => {
        return getAllElements().sort((a, b) => a.zIndex - b.zIndex);
    }, [getAllElements]);

    // Helper to update element zIndex by type and id
    const updateElementZIndex = useCallback(
        (id: string, type: ElementType, newZIndex: number) => {
            updateActiveScene((scene) => {
                const updatedScene = { ...scene };

                switch (type) {
                    case "text":
                        updatedScene.textOverlays = scene.textOverlays.map((o) =>
                            o.id === id
                                ? { ...o, layout: { ...o.layout, zIndex: newZIndex } }
                                : o
                        );
                        break;
                    case "file":
                        updatedScene.fileOverlays = scene.fileOverlays.map((o) =>
                            o.id === id
                                ? { ...o, layout: { ...o.layout, zIndex: newZIndex } }
                                : o
                        );
                        break;
                    case "browser":
                        updatedScene.browserOverlays = scene.browserOverlays.map((o) =>
                            o.id === id
                                ? { ...o, layout: { ...o.layout, zIndex: newZIndex } }
                                : o
                        );
                        break;
                    case "generated":
                        updatedScene.activeOverlays = scene.activeOverlays.map((o) =>
                            o.id === id
                                ? { ...o, layout: { ...o.layout, zIndex: newZIndex } }
                                : o
                        );
                        break;
                    case "camera":
                        // Camera zIndex is controlled via CSS, but we can track it for ordering
                        // For now, camera z-index manipulation would require different approach
                        // We'll handle this by adjusting other elements relative to camera
                        break;
                }

                return updatedScene;
            });
        },
        [updateActiveScene]
    );

    const bringToFront = useCallback(
        (id: string, type: ElementType) => {
            const elements = getAllElements();
            const maxZIndex = Math.max(...elements.map((e) => e.zIndex), BASE_Z_INDEX);
            updateElementZIndex(id, type, maxZIndex + Z_INDEX_STEP);
        },
        [getAllElements, updateElementZIndex]
    );

    const sendToBack = useCallback(
        (id: string, type: ElementType) => {
            const elements = getAllElements();
            const minZIndex = Math.min(...elements.map((e) => e.zIndex), BASE_Z_INDEX);
            // Don't go below 1 to keep elements visible
            updateElementZIndex(id, type, Math.max(1, minZIndex - Z_INDEX_STEP));
        },
        [getAllElements, updateElementZIndex]
    );

    const bringForward = useCallback(
        (id: string, type: ElementType) => {
            const sorted = getAllElementsSorted();
            const currentIndex = sorted.findIndex((e) => e.id === id && e.type === type);

            if (currentIndex === -1 || currentIndex === sorted.length - 1) {
                // Element not found or already at front
                return;
            }

            const current = sorted[currentIndex];
            const above = sorted[currentIndex + 1];

            // Swap z-indices
            updateActiveScene((scene) => {
                const updatedScene = { ...scene };

                // Helper to update an element's zIndex
                const updateZIndex = (
                    elements: any[],
                    targetId: string,
                    newZ: number
                ) => {
                    return elements.map((o) =>
                        o.id === targetId
                            ? { ...o, layout: { ...o.layout, zIndex: newZ } }
                            : o
                    );
                };

                // Update current element
                switch (type) {
                    case "text":
                        updatedScene.textOverlays = updateZIndex(
                            updatedScene.textOverlays,
                            id,
                            above.zIndex
                        );
                        break;
                    case "file":
                        updatedScene.fileOverlays = updateZIndex(
                            updatedScene.fileOverlays,
                            id,
                            above.zIndex
                        );
                        break;
                    case "browser":
                        updatedScene.browserOverlays = updateZIndex(
                            updatedScene.browserOverlays,
                            id,
                            above.zIndex
                        );
                        break;
                    case "generated":
                        updatedScene.activeOverlays = updateZIndex(
                            updatedScene.activeOverlays,
                            id,
                            above.zIndex
                        );
                        break;
                }

                // Update the element above
                switch (above.type) {
                    case "text":
                        updatedScene.textOverlays = updateZIndex(
                            updatedScene.textOverlays,
                            above.id,
                            current.zIndex
                        );
                        break;
                    case "file":
                        updatedScene.fileOverlays = updateZIndex(
                            updatedScene.fileOverlays,
                            above.id,
                            current.zIndex
                        );
                        break;
                    case "browser":
                        updatedScene.browserOverlays = updateZIndex(
                            updatedScene.browserOverlays,
                            above.id,
                            current.zIndex
                        );
                        break;
                    case "generated":
                        updatedScene.activeOverlays = updateZIndex(
                            updatedScene.activeOverlays,
                            above.id,
                            current.zIndex
                        );
                        break;
                }

                return updatedScene;
            });
        },
        [getAllElementsSorted, updateActiveScene]
    );

    const sendBackward = useCallback(
        (id: string, type: ElementType) => {
            const sorted = getAllElementsSorted();
            const currentIndex = sorted.findIndex((e) => e.id === id && e.type === type);

            if (currentIndex === -1 || currentIndex === 0) {
                // Element not found or already at back
                return;
            }

            const current = sorted[currentIndex];
            const below = sorted[currentIndex - 1];

            // Swap z-indices
            updateActiveScene((scene) => {
                const updatedScene = { ...scene };

                const updateZIndex = (
                    elements: any[],
                    targetId: string,
                    newZ: number
                ) => {
                    return elements.map((o) =>
                        o.id === targetId
                            ? { ...o, layout: { ...o.layout, zIndex: newZ } }
                            : o
                    );
                };

                // Update current element
                switch (type) {
                    case "text":
                        updatedScene.textOverlays = updateZIndex(
                            updatedScene.textOverlays,
                            id,
                            below.zIndex
                        );
                        break;
                    case "file":
                        updatedScene.fileOverlays = updateZIndex(
                            updatedScene.fileOverlays,
                            id,
                            below.zIndex
                        );
                        break;
                    case "browser":
                        updatedScene.browserOverlays = updateZIndex(
                            updatedScene.browserOverlays,
                            id,
                            below.zIndex
                        );
                        break;
                    case "generated":
                        updatedScene.activeOverlays = updateZIndex(
                            updatedScene.activeOverlays,
                            id,
                            below.zIndex
                        );
                        break;
                }

                // Update the element below
                switch (below.type) {
                    case "text":
                        updatedScene.textOverlays = updateZIndex(
                            updatedScene.textOverlays,
                            below.id,
                            current.zIndex
                        );
                        break;
                    case "file":
                        updatedScene.fileOverlays = updateZIndex(
                            updatedScene.fileOverlays,
                            below.id,
                            current.zIndex
                        );
                        break;
                    case "browser":
                        updatedScene.browserOverlays = updateZIndex(
                            updatedScene.browserOverlays,
                            below.id,
                            current.zIndex
                        );
                        break;
                    case "generated":
                        updatedScene.activeOverlays = updateZIndex(
                            updatedScene.activeOverlays,
                            below.id,
                            current.zIndex
                        );
                        break;
                }

                return updatedScene;
            });
        },
        [getAllElementsSorted, updateActiveScene]
    );

    return {
        getAllElementsSorted,
        bringToFront,
        sendToBack,
        bringForward,
        sendBackward,
    };
}
