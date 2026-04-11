import { useState, useRef, useEffect } from "react";
import {
  CanvasLayoutState,
  CanvasSectionState,
  ExtendedCSSProperties,
} from "@caption-cam/core/types/caption";

export interface UseLayoutEditorProps {
  layout: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
}

export const useLayoutEditor = ({
  layout,
  onLayoutUpdate,
}: UseLayoutEditorProps) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<{
    id: string;
    rect: DOMRect;
    computedValues?: {
      fontSize: string;
      color: string;
      fontFamily: string;
      textAlign: string;
    };
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
    // Capture the actual rendered styles to populate the toolbar defaults
    const computed = window.getComputedStyle(e.target);

    setFocusedField({
      id: fieldId,
      rect,
      computedValues: {
        fontSize: computed.fontSize,
        color: computed.color,
        fontFamily: computed.fontFamily,
        textAlign: computed.textAlign,
      },
    });
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

    // Removed native confirm() to allow custom UI handling
    const newSections = layout.sections.filter((s) => s.id !== id);
    onLayoutUpdate({
      ...layout,
      sections: newSections,
    });
  };

  const getFieldStyle = (
    fieldId: string,
    defaultStyle: React.CSSProperties = {}
  ) => {
    const s = layout.customSectionStyles?.[fieldId] || {};

    // Fix: Properly handle color fallback.
    // If s.color is undefined, we must NOT override defaultStyle.color with undefined.
    const effectiveColor = s.color || defaultStyle.color;

    return {
      ...defaultStyle,
      ...s,
      fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
      fontWeight: s.bold ? "bold" : "normal",
      fontStyle: s.italic ? "italic" : "normal",
      textAlign: (s.textAlign as any) || "left",
      color: effectiveColor,
    };
  };

  const getGlobalSettings = (
    defaultBg = "#ffffff",
    defaultText = "#000000"
  ) => {
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
    updateGlobalSetting,
  };
};
