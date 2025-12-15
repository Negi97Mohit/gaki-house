import { useState, useRef, useEffect } from "react";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";

export interface UseLayoutEditorProps {
    layout: CanvasLayoutState;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
}

export const useLayoutEditor = ({ layout, onLayoutUpdate }: UseLayoutEditorProps) => {
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<{
        id: string;
        rect: DOMRect;
    } | null>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    // Close toolbar when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                focusedField &&
                toolbarRef.current &&
                !toolbarRef.current.contains(e.target as Node) &&
                !(e.target as HTMLElement).closest("textarea") &&
                !(e.target as HTMLElement).closest("input")
            ) {
                setFocusedField(null);
            }
        };

        window.addEventListener("mousedown", handleClickOutside);
        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, [focusedField]);

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
            },
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

        const newSections = layout.sections.filter((s) => s.id !== id);
        onLayoutUpdate({
            ...layout,
            sections: newSections,
        });
    };

    const getFieldStyle = (fieldId: string, defaultStyle: React.CSSProperties = {}) => {
        const s = layout.customSectionStyles?.[fieldId] || {};
        return {
            fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
            fontWeight: s.bold ? "bold" : "normal",
            fontStyle: s.italic ? "italic" : "normal",
            textAlign: (s.textAlign as any) || "left",
            color: s.color, // Explicitly pass color if set
            ...defaultStyle,
            ...s,
        };
    };

    // Helper to get global colors with defaults
    const getGlobalSettings = (defaultBg = "#ffffff", defaultText = "#000000") => {
        const globalData = layout.customSectionData?.["_global"] || {};
        return {
            backgroundColor: globalData.backgroundColor || defaultBg,
            textColor: globalData.textColor || defaultText,
        };
    };

    const updateGlobalSetting = (key: string, value: string) => {
        handleUpdateText("_global", key, value);
    };

    return {
        hoveredSectionId,
        setHoveredSectionId,
        focusedField,
        setFocusedField,
        toolbarRef,
        handleUpdateText,
        handleUpdateStyle,
        handleFocus,
        handleAddSection,
        handleDeleteSection,
        getFieldStyle,
        getGlobalSettings,
        updateGlobalSetting
    };
};
