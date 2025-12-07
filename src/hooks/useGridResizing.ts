import { useState, useRef, useEffect, useCallback } from "react";
import { CanvasLayoutState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";

interface UseGridResizingProps {
    layout: CanvasLayoutState;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    template: CanvasLayoutTemplate | null;
    containerRef: React.RefObject<HTMLDivElement>;
}

export const useGridResizing = ({
    layout,
    onLayoutUpdate,
    template,
    containerRef,
}: UseGridResizingProps) => {
    const [resizing, setResizing] = useState<{
        sectionId: string;
        edge: string;
    } | null>(null);

    const resizeDataRef = useRef<{
        startX: number;
        startY: number;
        startStyles: Record<string, React.CSSProperties>;
    } | null>(null);

    // Get resize edges
    const getResizeEdges = useCallback(
        (sectionId: string) => {
            if (!template)
                return { right: false, bottom: false, left: false, top: false };

            const sections = template.sections.map((s) => ({
                ...s,
                style: layout.customSectionStyles?.[s.id] || s.style,
            }));

            const section = sections.find((s) => s.id === sectionId);
            if (!section)
                return { right: false, bottom: false, left: false, top: false };

            const left = parseFloat(section.style.left as string);
            const top = parseFloat(section.style.top as string);
            const width = parseFloat(section.style.width as string);
            const height = parseFloat(section.style.height as string);

            return {
                right: left + width < 99.5,
                bottom: top + height < 99.5,
                left: left > 0.5,
                top: top > 0.5,
            };
        },
        [template, layout.customSectionStyles]
    );

    // Handle resize start
    const handleResizeStart = (
        sectionId: string,
        edge: string,
        e: React.MouseEvent
    ) => {
        e.preventDefault();
        e.stopPropagation();

        if (!template) return;

        const startStyles: Record<string, React.CSSProperties> = {};
        template.sections.forEach((s) => {
            startStyles[s.id] = layout.customSectionStyles?.[s.id] || s.style;
        });

        resizeDataRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startStyles,
        };

        setResizing({ sectionId, edge });
    };

    // Handle resize move
    useEffect(() => {
        if (
            !resizing ||
            !containerRef.current ||
            !resizeDataRef.current ||
            !onLayoutUpdate ||
            !template
        )
            return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current || !resizeDataRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const deltaXPx = e.clientX - resizeDataRef.current.startX;
            const deltaYPx = e.clientY - resizeDataRef.current.startY;
            const deltaX = (deltaXPx / rect.width) * 100;
            const deltaY = (deltaYPx / rect.height) * 100;

            const { sectionId, edge } = resizing;
            const startStyles = resizeDataRef.current.startStyles;
            const newStyles = { ...startStyles };

            const style = startStyles[sectionId];
            const left = parseFloat(style.left as string);
            const top = parseFloat(style.top as string);
            const width = parseFloat(style.width as string);
            const height = parseFloat(style.height as string);

            if (edge === "right") {
                const newWidth = Math.max(10, Math.min(100 - left, width + deltaX));
                newStyles[sectionId] = { ...style, width: `${newWidth}%` };

                // Adjust right neighbor
                template.sections.forEach((s) => {
                    if (s.id === sectionId) return;
                    const sStyle = startStyles[s.id];
                    const sLeft = parseFloat(sStyle.left as string);
                    const sWidth = parseFloat(sStyle.width as string);

                    if (Math.abs(sLeft - (left + width)) < 2) {
                        const newSWidth = Math.max(10, sWidth - deltaX);
                        newStyles[s.id] = {
                            ...sStyle,
                            left: `${left + newWidth}%`,
                            width: `${newSWidth}%`,
                        };
                    }
                });
            } else if (edge === "bottom") {
                const newHeight = Math.max(10, Math.min(100 - top, height + deltaY));
                newStyles[sectionId] = { ...style, height: `${newHeight}%` };

                // Adjust bottom neighbor
                template.sections.forEach((s) => {
                    if (s.id === sectionId) return;
                    const sStyle = startStyles[s.id];
                    const sTop = parseFloat(sStyle.top as string);
                    const sHeight = parseFloat(sStyle.height as string);

                    if (Math.abs(sTop - (top + height)) < 2) {
                        const newSHeight = Math.max(10, sHeight - deltaY);
                        newStyles[s.id] = {
                            ...sStyle,
                            top: `${top + newHeight}%`,
                            height: `${newSHeight}%`,
                        };
                    }
                });
            } else if (edge === "left") {
                const newLeft = Math.max(0, Math.min(left + width - 10, left + deltaX));
                const newWidth = Math.max(10, width - (newLeft - left));
                newStyles[sectionId] = {
                    ...style,
                    left: `${newLeft}%`,
                    width: `${newWidth}%`,
                };

                // Adjust left neighbor
                template.sections.forEach((s) => {
                    if (s.id === sectionId) return;
                    const sStyle = startStyles[s.id];
                    const sLeft = parseFloat(sStyle.left as string);
                    const sWidth = parseFloat(sStyle.width as string);

                    if (Math.abs(sLeft + sWidth - left) < 2) {
                        const newSWidth = Math.max(10, sWidth + (newLeft - left));
                        newStyles[s.id] = { ...sStyle, width: `${newSWidth}%` };
                    }
                });
            } else if (edge === "top") {
                const newTop = Math.max(0, Math.min(top + height - 10, top + deltaY));
                const newHeight = Math.max(10, height - (newTop - top));
                newStyles[sectionId] = {
                    ...style,
                    top: `${newTop}%`,
                    height: `${newHeight}%`,
                };

                // Adjust top neighbor
                template.sections.forEach((s) => {
                    if (s.id === sectionId) return;
                    const sStyle = startStyles[s.id];
                    const sTop = parseFloat(sStyle.top as string);
                    const sHeight = parseFloat(sStyle.height as string);

                    if (Math.abs(sTop + sHeight - top) < 2) {
                        const newSHeight = Math.max(10, sHeight + (newTop - top));
                        newStyles[s.id] = { ...sStyle, height: `${newSHeight}%` };
                    }
                });
            }

            onLayoutUpdate({
                ...layout,
                customSectionStyles: newStyles,
            });
        };

        const handleMouseUp = () => {
            setResizing(null);
            resizeDataRef.current = null;
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [resizing, layout, onLayoutUpdate, template, containerRef]);

    return {
        resizing,
        handleResizeStart,
        getResizeEdges,
    };
};
