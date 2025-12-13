import React, { useState, useRef, useEffect } from "react";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { cn } from "@/lib/utils";
import { AssetResult } from "../AssetLibrary";
import { GridSectionRenderer } from "../GridSectionRenderer";
import {
    Plus,
    Trash2,
    ArrowLeftRight,
    Bold,
    Italic,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Type,
    X
} from "lucide-react";

interface MagnetismGridLayoutProps {
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    onSectionContentChange: (
        sectionId: string,
        content: CanvasSectionState["content"]
    ) => void;
    onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

export const MagnetismGridLayout: React.FC<MagnetismGridLayoutProps> = ({
    layout,
    template,
    onSectionContentChange,
    onGridAssetSelect,
    onLayoutUpdate,
    ...props
}) => {
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

    // Text Styling State
    const [focusedField, setFocusedField] = useState<{ id: string, rect: DOMRect } | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const gridSections = layout.sections.filter(
        s => s.id !== 'header' && s.id !== 'footer'
    );

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

    const handleUpdateStyle = (id: string, field: string, value: any) => {
        if (!onLayoutUpdate) return;
        const currentStyle = layout.customSectionStyles?.[id] || {};
        const newCustomStyles = {
            ...layout.customSectionStyles,
            [id]: {
                ...currentStyle,
                [field]: value,
            }
        };
        onLayoutUpdate({
            ...layout,
            customSectionStyles: newCustomStyles,
        });
    };

    const handleFocus = (fieldId: string, e: React.FocusEvent<HTMLElement>) => {
        const rect = e.target.getBoundingClientRect();
        setFocusedField({ id: fieldId, rect });
    };

    // Close toolbar when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                focusedField &&
                toolbarRef.current &&
                !toolbarRef.current.contains(e.target as Node) &&
                !(e.target as HTMLElement).closest('textarea') &&
                !(e.target as HTMLElement).closest('input')
            ) {
                // If clicked outside toolbar AND outside inputs/textareas
                setFocusedField(null);
            }
        };

        window.addEventListener('mousedown', handleClickOutside);
        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [focusedField]);

    const handleAddSection = () => {
        if (!onLayoutUpdate) return;
        const newId = `media-${Date.now()}`;
        const newSection: CanvasSectionState = {
            id: newId,
            content: { type: "empty" },
        };

        const newSections = [...layout.sections, newSection];

        onLayoutUpdate({
            ...layout,
            sections: newSections,
        });
    };

    const handleDeleteSection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onLayoutUpdate) return;
        if (!confirm("Remove this panel?")) return;

        const newSections = layout.sections.filter(s => s.id !== id);
        onLayoutUpdate({
            ...layout,
            sections: newSections,
        });
    };

    const toggleWidth = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const currentStyle = layout.customSectionStyles?.[id] || {};
        const currentSpan = currentStyle.gridColumn === "span 2" ? "2" : "1";
        const newSpan = currentSpan === "2" ? "span 1" : "span 2";

        handleUpdateStyle(id, "gridColumn", newSpan);
    };

    // Header Data
    const headerData = layout.customSectionData?.["header"] || {};
    const footerData = layout.customSectionData?.["footer"] || {};

    // Helper to get style for a field
    const getFieldStyle = (fieldId: string) => {
        const s = layout.customSectionStyles?.[fieldId] || {};
        return {
            fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
            fontWeight: s.bold ? 'bold' : 'normal',
            fontStyle: s.italic ? 'italic' : 'normal',
            textAlign: s.textAlign as any || 'left',
            // Ensure line-height adapts
            // lineHeight: s.fontSize ? '1.2' : undefined,
            ...s
        };
    };

    // Default Pattern Helper
    const getDefaultGridClasses = (index: number) => {
        const mod = index % 9;
        if (mod === 0) return { aspect: "1.775", colSpan: "span 2" }; // Video Large
        if (mod === 1 || mod === 2) return { aspect: "1", colSpan: "span 1" }; // Square
        if (mod === 3 || mod === 4) return { aspect: "0.66", colSpan: "span 1" }; // Portrait
        if (mod === 5) return { aspect: "1.775", colSpan: "span 2" }; // Video Large
        if (mod === 6) return { aspect: "1.77", colSpan: "span 2" }; // Wide Image
        if (mod === 7 || mod === 8) return { aspect: "1", colSpan: "span 1" }; // Square
        return { aspect: "1", colSpan: "span 1" };
    };

    // Current Style Values for Toolbar
    const currentFontSize = focusedField ? (layout.customSectionStyles?.[focusedField.id]?.fontSize || "16") : "16";
    const currentAlign = focusedField ? (layout.customSectionStyles?.[focusedField.id]?.textAlign || "left") : "left";
    const isBold = focusedField ? (layout.customSectionStyles?.[focusedField.id]?.bold || false) : false;
    const isItalic = focusedField ? (layout.customSectionStyles?.[focusedField.id]?.italic || false) : false;

    return (
        <div className="w-full h-full overflow-y-auto bg-white text-black font-sans scrollbar-hide relative">

            {/* Floating Toolbar - High Z-Index & Portal-like positioning */}
            {focusedField && (
                <div
                    ref={toolbarRef}
                    className="fixed px-3 py-2 bg-black text-white rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 border border-white/10"
                    style={{
                        zIndex: 9999, // User requested "always on top"
                        top: Math.max(80, focusedField.rect.top - 50), // Ensure it's not off-screen top
                        left: Math.max(20, Math.min(window.innerWidth - 300, focusedField.rect.left)) // Simplified bounds
                    }}
                // REMOVED preventDefault here to allow input focus
                >
                    <div className="flex items-center gap-2 mr-2 border-r border-white/20 pr-2">
                        <Type className="w-3 h-3 text-white/50" />
                        <input
                            type="text" // Change to text to allow easier typing/backspacing
                            className="w-8 bg-transparent text-sm font-medium text-white text-center focus:outline-none focus:bg-white/10 rounded"
                            value={currentFontSize} // value from state
                            onChange={(e) => {
                                // Allow empty string for typing, otherwise number
                                const val = e.target.value;
                                if (val === '' || /^\d+$/.test(val)) {
                                    handleUpdateStyle(focusedField.id, "fontSize", val);
                                }
                            }}
                            onBlur={(e) => {
                                // Enforce default if left empty
                                if (!e.target.value) handleUpdateStyle(focusedField.id, "fontSize", "16");
                            }}
                            // Prevent event propagation so clicking input doesn't trigger other things
                            onMouseDown={(e) => e.stopPropagation()}
                        />
                        <span className="text-[10px] text-white/40">px</span>
                    </div>

                    <div className="flex items-center bg-white/10 rounded-lg p-0.5 gap-0.5">
                        <button
                            onClick={() => handleUpdateStyle(focusedField.id, "textAlign", "left")}
                            onMouseDown={(e) => e.preventDefault()} // Prevent blur of textarea
                            className={cn("p-1.5 rounded-md transition-colors", currentAlign === 'left' ? "bg-white/20" : "hover:bg-white/5")}
                        >
                            <AlignLeft className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => handleUpdateStyle(focusedField.id, "textAlign", "center")}
                            onMouseDown={(e) => e.preventDefault()}
                            className={cn("p-1.5 rounded-md transition-colors", currentAlign === 'center' ? "bg-white/20" : "hover:bg-white/5")}
                        >
                            <AlignCenter className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => handleUpdateStyle(focusedField.id, "textAlign", "right")}
                            onMouseDown={(e) => e.preventDefault()}
                            className={cn("p-1.5 rounded-md transition-colors", currentAlign === 'right' ? "bg-white/20" : "hover:bg-white/5")}
                        >
                            <AlignRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="w-px h-4 bg-white/20 mx-1" />

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleUpdateStyle(focusedField.id, "bold", !isBold)}
                            onMouseDown={(e) => e.preventDefault()}
                            className={cn("p-1.5 rounded-md transition-colors", isBold ? "bg-white text-black" : "hover:bg-white/10")}
                        >
                            <Bold className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => handleUpdateStyle(focusedField.id, "italic", !isItalic)}
                            onMouseDown={(e) => e.preventDefault()}
                            className={cn("p-1.5 rounded-md transition-colors", isItalic ? "bg-white text-black" : "hover:bg-white/10")}
                        >
                            <Italic className="w-3 h-3" />
                        </button>
                    </div>

                    <button
                        onClick={() => setFocusedField(null)}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-colors"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}

            <div className="max-w-[1920px] mx-auto p-4 md:p-8">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-20">

                    {/* Left Column: Sticky Header */}
                    <div className="lg:col-span-4 xl:col-span-3">
                        <section className="sticky top-8 group/header">
                            <div className="flex flex-col gap-8">
                                <div>
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter leading-none mb-4 relative">
                                        <span className="block text-sm md:text-base font-normal mb-2 tracking-normal opacity-0 pointer-events-none select-none">
                                            Richard Mille
                                        </span>
                                        {/* Editable Title - Auto-wrapping textarea */}
                                        <textarea
                                            value={headerData.title ?? "Global Communication"}
                                            onChange={(e) => {
                                                handleUpdateText("header", "title", e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            onFocus={(e) => handleFocus("header_title", e)}
                                            style={getFieldStyle("header_title")}
                                            className="bg-transparent border-none w-full focus:outline-none focus:ring-1 focus:ring-black/10 rounded px-1 -ml-1 resize-none overflow-hidden"
                                            rows={1}
                                            ref={el => {
                                                if (el) {
                                                    el.style.height = 'auto';
                                                    el.style.height = el.scrollHeight + 'px';
                                                }
                                            }}
                                        />
                                    </h1>

                                    <div className="flex gap-6 text-xs md:text-sm border-t border-black/10 pt-4 mt-8 opacity-60">
                                        <textarea
                                            value={headerData.date ?? "2018-2025"}
                                            onChange={(e) => handleUpdateText("header", "date", e.target.value)}
                                            onFocus={(e) => handleFocus("header_date", e)}
                                            style={getFieldStyle("header_date")}
                                            className="bg-transparent w-24 border-none focus:outline-none focus:ring-1 focus:ring-black/10 resize-none overflow-hidden"
                                            rows={1}
                                        />
                                        <textarea
                                            value={headerData.category ?? "360° Scope"}
                                            onChange={(e) => handleUpdateText("header", "category", e.target.value)}
                                            onFocus={(e) => handleFocus("header_category", e)}
                                            style={getFieldStyle("header_category")}
                                            className="bg-transparent w-full border-none focus:outline-none focus:ring-1 focus:ring-black/10 resize-none overflow-hidden"
                                            rows={1}
                                        />
                                    </div>
                                </div>

                                <div className="text-sm md:text-base leading-relaxed">
                                    <textarea
                                        value={headerData.subtitle ?? "Performance, aesthetics, technicality."}
                                        onChange={(e) => handleUpdateText("header", "subtitle", e.target.value)}
                                        onFocus={(e) => handleFocus("header_subtitle", e)}
                                        style={getFieldStyle("header_subtitle")}
                                        className="text-xs font-bold uppercase tracking-wider mb-4 w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-black/10 resize-none overflow-hidden"
                                        rows={1}
                                    />
                                    <textarea
                                        value={headerData.description ?? "Since 2018, Richard Mille, celebrated by elites in sports, arts, and cinema, has partnered with Magnetism to accelerate its brand development globally. This comprehensive collaboration spans strategic vision implementation and management of its digital ecosystem."}
                                        onChange={(e) => handleUpdateText("header", "description", e.target.value)}
                                        onFocus={(e) => handleFocus("header_description", e)}
                                        style={getFieldStyle("header_description")}
                                        className="opacity-80 w-full h-40 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-black/10 resize-none"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Dynamic Media Grid */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {gridSections.map((section, index) => {
                                const defaultStyle = getDefaultGridClasses(index);
                                const customStyle = layout.customSectionStyles?.[section.id] || {};

                                const colSpanClass = customStyle.gridColumn === 'span 2' ? 'md:col-span-2' :
                                    customStyle.gridColumn === 'span 1' ? 'md:col-span-1' :
                                        defaultStyle.colSpan === 'span 2' ? 'md:col-span-2' : 'md:col-span-1';

                                const aspectStyle = customStyle.aspectRatio ? { aspectRatio: customStyle.aspectRatio } : { aspectRatio: defaultStyle.aspect };

                                return (
                                    <div
                                        key={section.id}
                                        className={cn(
                                            colSpanClass,
                                            "relative group overflow-hidden transition-all duration-300 ease-in-out border border-transparent hover:border-black/5 rounded-md"
                                        )}
                                        style={aspectStyle}
                                        onMouseEnter={() => setHoveredSectionId(section.id)}
                                        onMouseLeave={() => setHoveredSectionId(null)}
                                    >
                                        <GridSectionRenderer
                                            section={section}
                                            onSectionContentChange={onSectionContentChange}
                                            onGridAssetSelect={onGridAssetSelect}
                                            {...props}
                                        />

                                        {/* Controls Overlay */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleDeleteSection(section.id, e)}
                                                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
                                                title="Remove Panel"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => toggleWidth(section.id, e)}
                                                className="bg-white text-black p-2 rounded-full hover:scale-110 border border-black/10 shadow-md"
                                                title="Toggle Width (Half/Full)"
                                            >
                                                <ArrowLeftRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add Button */}
                            <div className="md:col-span-1 aspect-square flex items-center justify-center border-2 border-dashed border-black/10 rounded hover:bg-black/5 cursor-pointer transition-colors" onClick={handleAddSection}>
                                <div className="flex flex-col items-center gap-2 text-black/40">
                                    <Plus className="w-8 h-8" />
                                    <span className="text-xs uppercase font-bold tracking-widest">Add Panel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <section className="mt-20 pt-8 border-t border-black/10">
                    <div className="flex justify-between items-end">
                        <div>
                            <input
                                value={footerData.title ?? "Daniel Roth"}
                                onChange={(e) => handleUpdateText("footer", "title", e.target.value)}
                                onFocus={(e) => handleFocus("footer_title", e)}
                                style={getFieldStyle("footer_title")}
                                className="text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-black/10 w-full"
                            />
                            <input
                                value={footerData.subtitle ?? "Brand ID ~ website"}
                                onChange={(e) => handleUpdateText("footer", "subtitle", e.target.value)}
                                onFocus={(e) => handleFocus("footer_subtitle", e)}
                                style={getFieldStyle("footer_subtitle")}
                                className="text-sm opacity-60 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-black/10 w-full"
                            />
                        </div>
                        <div className="text-right">
                            <div className="text-sm">2023</div>
                            <div className="text-sm opacity-60">Launch & Website</div>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};
