
import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Palette, GripVertical } from "lucide-react";

export const PerformanceFlowLayout: React.FC<any> = ({
    layout,
    template,
    onLayoutUpdate,
    ...wrapperProps
}) => {
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Resizing State
    const [isResizing, setIsResizing] = useState(false);
    const resizingRef = useRef<{
        startX: number;
        startWidth: number;
        sectionId: string;
    } | null>(null);

    // Resolve sections based on order or template defaults
    const sectionIds =
        layout.sectionOrder && layout.sectionOrder.length > 0
            ? layout.sectionOrder
            : template.sections.map((s: any) => s.id);

    // Resolve Background Color (Global setting)
    const globalData = layout.customSectionData?.["_global"] || {};
    const backgroundColor = globalData.backgroundColor || "#1a1a1a";

    const handleUpdateGlobal = (field: string, value: any) => {
        if (!onLayoutUpdate) return;
        const newCustomData = {
            ...layout.customSectionData,
            _global: {
                ...globalData,
                [field]: value,
            },
        };
        onLayoutUpdate({
            ...layout,
            customSectionData: newCustomData,
        });
    };

    const handleAddSection = () => {
        if (!onLayoutUpdate) return;
        const newId = `flow-${Date.now()}`;

        // Create new section state
        const newSection: CanvasSectionState = {
            id: newId,
            content: { type: "empty" },
        };

        const newSections = [...layout.sections, newSection];
        const newOrder = [...sectionIds, newId];

        const newCustomData = {
            ...layout.customSectionData,
            [newId]: {
                name: "New Feature",
                subtitle: "Performance Class '23", // Default subtitle matches existing style
            },
        };

        onLayoutUpdate({
            ...layout,
            sections: newSections,
            sectionOrder: newOrder,
            customSectionData: newCustomData,
        });
    };

    const handleDeleteSection = (idToDelete: string) => {
        if (!onLayoutUpdate) return;
        if (!confirm("Delete this panel?")) return;

        const newSections = layout.sections.filter((s: any) => s.id !== idToDelete);
        const newOrder = sectionIds.filter((id: string) => id !== idToDelete);

        const newCustomData = { ...layout.customSectionData };
        delete newCustomData[idToDelete];

        onLayoutUpdate({
            ...layout,
            sections: newSections,
            sectionOrder: newOrder,
            customSectionData: newCustomData,
        });
    };

    const handleUpdateText = (id: string, field: string, value: string) => {
        if (!onLayoutUpdate) return;
        const currentData = layout.customSectionData?.[id] || {};

        const newCustomData = {
            ...layout.customSectionData,
            [id]: {
                ...currentData,
                [field]: value,
            },
        };

        onLayoutUpdate({
            ...layout,
            customSectionData: newCustomData,
        });
    };

    // Resizing Logic
    const handleResizeStart = (e: React.MouseEvent, sectionId: string, currentWidth: number) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        resizingRef.current = {
            startX: e.clientX,
            startWidth: currentWidth,
            sectionId,
        };

        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = useCallback((e: MouseEvent) => {
        if (!resizingRef.current || !onLayoutUpdate) return;

        const { startX, startWidth, sectionId } = resizingRef.current;
        const diff = e.clientX - startX;
        const newWidth = Math.max(300, startWidth + diff); // Minimum 300px

        // Update layout with new width in customSectionStyles
        const newStyles = {
            ...layout.customSectionStyles,
            [sectionId]: {
                ...layout.customSectionStyles?.[sectionId],
                width: `${newWidth}px`,
            }
        };

        onLayoutUpdate({
            ...layout,
            customSectionStyles: newStyles,
        });

    }, [layout, onLayoutUpdate]);

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false);
        resizingRef.current = null;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    }, [handleResizeMove]);


    return (
        <div
            className="w-full h-full flex items-center overflow-hidden relative transition-colors duration-500"
            style={{ backgroundColor }}
            ref={containerRef}
        >
            {/* Background Color Picker UI */}
            <div className="absolute top-4 right-4 z-50 group">
                <div className="bg-black/80 backdrop-blur text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-black transition-colors">
                    <Palette className="w-5 h-5" />
                </div>
                <div className="absolute top-full right-0 mt-2 p-3 bg-black/90 backdrop-blur rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto w-48">
                    <p className="text-xs text-white/70 mb-2 uppercase font-mono">Background</p>
                    <div className="flex gap-2 flex-wrap">
                        {["#1a1a1a", "#000000", "#1e3a8a", "#3f2c2c", "#064e3b"].map(color => (
                            <button
                                key={color}
                                className={cn(
                                    "w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform",
                                    backgroundColor === color && "ring-2 ring-white"
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => handleUpdateGlobal("backgroundColor", color)}
                            />
                        ))}
                        <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => handleUpdateGlobal("backgroundColor", e.target.value)}
                            className="w-full h-8 mt-2 cursor-pointer rounded opacity-50 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />

            <motion.div
                className="flex gap-4 px-[10vw] h-[80vh] items-center cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={containerRef}
                whileTap={{ cursor: isResizing ? "col-resize" : "grabbing" }}
                dragListener={!isResizing} // Disable drag when resizing
            >
                <AnimatePresence mode="popLayout">
                    {sectionIds.map((sectionId: string, index: number) => {
                        const section =
                            layout.sections.find((s: any) => s.id === sectionId) ||
                            ({
                                id: sectionId,
                                content: { type: "empty" },
                            } as CanvasSectionState);

                        const templateSection = template.sections.find((s: any) => s.id === sectionId) || { id: sectionId };
                        const customData = layout.customSectionData?.[sectionId] || {};
                        const customStyle = layout.customSectionStyles?.[sectionId] || {};

                        const widthString = customStyle.width as string;
                        const width = widthString ? parseInt(widthString) : 400; // Default 400px

                        const name = customData.name ?? templateSection.name ?? "Featured Item";
                        const subtitle = customData.subtitle ?? "Performance Class '23";

                        const isHovered = hoveredSectionId === sectionId;

                        return (
                            <motion.div
                                key={sectionId}
                                layout={!isResizing} // disable layout animation during resize to prevent jitter
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                className={cn(
                                    "relative h-full bg-black/40 rounded-sm overflow-hidden border border-white/10 group",
                                    "flex-shrink-0 transition-all duration-300 ease-out"
                                )}
                                style={{ width: `${width}px`, minWidth: `${width}px` }}
                                onMouseEnter={() => setHoveredSectionId(sectionId)}
                                onMouseLeave={() => setHoveredSectionId(null)}
                                whileHover={{
                                    zIndex: 10,
                                    borderColor: "rgba(255,255,255,0.3)"
                                }}
                            >
                                {/* Resize Handle */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 w-4 z-50 cursor-col-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                                    onMouseDown={(e) => handleResizeStart(e, sectionId, width)}
                                    // Prevent dragging parent
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <div className="w-[2px] h-8 bg-white/30 rounded-full" />
                                </div>

                                {/* Overlay Gradient for Text Readability */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none" />

                                <div className="absolute top-4 left-4 z-30 opacity-70 group-hover:opacity-100 transition-opacity flex justify-between w-full pr-8">
                                    <span className="text-xs font-mono uppercase tracking-widest text-white/60 border border-white/20 px-2 py-1 rounded-full pointer-events-none select-none">
                                        {index < 9 ? `0${index + 1}` : index + 1}
                                    </span>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSection(sectionId);
                                        }}
                                        className="p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3 H-3" />
                                    </button>
                                </div>

                                <div className="absolute bottom-6 left-6 z-30 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 w-[90%]">
                                    <input
                                        value={name}
                                        onChange={(e) => handleUpdateText(sectionId, "name", e.target.value)}
                                        className="text-2xl font-bold text-white mb-1 leading-tight tracking-tight bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-white/50 rounded w-full placeholder-white/30"
                                        placeholder="Item Title"
                                    />
                                    <input
                                        value={subtitle}
                                        onChange={(e) => handleUpdateText(sectionId, "subtitle", e.target.value)}
                                        className="text-white/60 text-sm font-light tracking-wide uppercase bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-white/50 rounded w-full placeholder-white/20"
                                        placeholder="Subtitle"
                                    />
                                </div>

                                <div className="w-full h-full relative">
                                    <GridSectionWrapper
                                        {...wrapperProps}
                                        section={section}
                                        templateSection={templateSection}
                                        isHovered={isHovered}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Add Section Button */}
                <motion.button
                    layout
                    onClick={handleAddSection}
                    className="min-w-[100px] h-full flex flex-col items-center justify-center border border-dashed border-white/20 rounded-sm hover:bg-white/5 hover:border-white/40 transition-colors text-white/50 hover:text-white group flex-shrink-0"
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Add Panel</span>
                </motion.button>

                {/* Padding to ensure last item is visible/draggable fully */}
                <div className="min-w-[10vw]" />
            </motion.div>
        </div>
    );
};
