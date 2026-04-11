// src/components/banner-editor/EditableBannerContent.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BannerElement, BannerElementData } from "./BannerElement";
import { BannerCustomizationToolbar } from "./BannerCustomizationToolbar";
import { BannerTextToolbar } from "./BannerTextToolbar"; // Import the missing toolbar
import { AnimatedBannerDesign } from "@caption-cam/core/types/animatedBanner";

// Re-export for use in other files
export type { BannerElementData } from "./BannerElement";

export interface EditableBannerState {
  elements: BannerElementData[];
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
}

interface EditableBannerContentProps {
  design: AnimatedBannerDesign;
  initialState?: EditableBannerState;
  isEditing: boolean;
  containerSize: { width: number; height: number };
  onStateChange: (state: EditableBannerState) => void;
  onEditingComplete?: () => void;
}

const createDefaultElements = (
  design: AnimatedBannerDesign
): BannerElementData[] => {
  const elements: BannerElementData[] = [];

  if (design.showAvatar) {
    elements.push({
      id: "avatar",
      type: "avatar",
      content: "",
      visible: true,
      position: { x: 20, y: 20 },
      style: {
        fontSize: 16,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: "normal",
      },
    });
  }

  elements.push({
    id: "name",
    type: "name",
    content: "Your Name",
    visible: true,
    position: { x: 80, y: 25 },
    style: {
      fontSize: 24,
      fontFamily: "Inter",
      color: "#ffffff",
      fontWeight: "bold",
    },
  });

  if (design.showTagline) {
    elements.push({
      id: "tagline",
      type: "tagline",
      content: "Creator • Streamer",
      visible: true,
      position: { x: 80, y: 55 },
      style: {
        fontSize: 14,
        fontFamily: "Inter",
        color: "rgba(255,255,255,0.8)",
        fontWeight: "normal",
      },
    });
  }

  return elements;
};

export const EditableBannerContent: React.FC<EditableBannerContentProps> = ({
  design,
  initialState,
  isEditing,
  containerSize,
  onStateChange,
  onEditingComplete,
}) => {
  const [elements, setElements] = useState<BannerElementData[]>(
    () => initialState?.elements || createDefaultElements(design)
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [backgroundColor, setBackgroundColor] = useState(
    initialState?.backgroundColor || design.preview
  );
  const [primaryColor, setPrimaryColor] = useState(
    initialState?.primaryColor || design.particleSettings?.color || "#a855f7"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    initialState?.secondaryColor ||
      design.particleSettings?.colorVariant ||
      "#3b82f6"
  );

  // Sync state changes to parent
  useEffect(() => {
    onStateChange({
      elements,
      backgroundColor,
      primaryColor,
      secondaryColor,
    });
  }, [elements, backgroundColor, primaryColor, secondaryColor, onStateChange]);

  const handlePositionChange = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, position } : el))
      );
    },
    []
  );

  const handleContentChange = useCallback((id: string, content: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, content } : el))
    );
  }, []);

  const handleStyleChange = useCallback(
    (id: string, style: Partial<BannerElementData["style"]>) => {
      setElements((prev) =>
        prev.map((el) =>
          el.id === id ? { ...el, style: { ...el.style, ...style } } : el
        )
      );
    },
    []
  );

  const handleElementToggle = useCallback((id: string, visible: boolean) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, visible } : el))
    );
  }, []);

  const handleAddElement = useCallback((type: BannerElementData["type"]) => {
    const newElement: BannerElementData = {
      id: `${type}-${Date.now()}`,
      type,
      content: type === "avatar" ? "" : "New Text",
      visible: true,
      position: { x: 50, y: 50 },
      style: {
        fontSize: type === "avatar" ? 16 : 18,
        fontFamily: "Inter",
        color: "#ffffff",
        fontWeight: "normal",
      },
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  }, []);

  const handleRemoveElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [selectedElementId]
  );

  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    // Deselect if clicking on background
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
    }
  }, []);

  // Helper to get the selected element object
  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedElementId),
    [elements, selectedElementId]
  );

  // Helper to determine if we should show text controls
  const showTextToolbar =
    selectedElement &&
    (selectedElement.type === "name" ||
      selectedElement.type === "tagline" ||
      selectedElement.type === "custom" ||
      selectedElement.type === "socialLinks");

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onClick={handleBackgroundClick}
    >
      {/* Render all banner elements */}
      {elements.map((element) => (
        <BannerElement
          key={element.id}
          element={element}
          isEditing={isEditing}
          containerSize={containerSize}
          onPositionChange={handlePositionChange}
          onContentChange={handleContentChange}
          onStyleChange={handleStyleChange}
          onSelect={setSelectedElementId}
          isSelected={selectedElementId === element.id}
        />
      ))}

      {/* Floating Text Toolbar and Customization Toolbar */}
      <AnimatePresence>
        {isEditing && (
          <>
            {/* Render BannerTextToolbar when a text element is selected */}
            {showTextToolbar && (
              <BannerTextToolbar
                position={selectedElement!.position}
                fontSize={selectedElement!.style.fontSize}
                fontFamily={selectedElement!.style.fontFamily}
                color={selectedElement!.style.color}
                fontWeight={selectedElement!.style.fontWeight}
                onFontSizeChange={(size) =>
                  handleStyleChange(selectedElement!.id, { fontSize: size })
                }
                onFontFamilyChange={(family) =>
                  handleStyleChange(selectedElement!.id, { fontFamily: family })
                }
                onColorChange={(color) =>
                  handleStyleChange(selectedElement!.id, { color })
                }
                onFontWeightChange={(weight) =>
                  handleStyleChange(selectedElement!.id, { fontWeight: weight })
                }
              />
            )}

            <BannerCustomizationToolbar
              elements={elements}
              selectedElementId={selectedElementId}
              backgroundColor={backgroundColor}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onElementToggle={handleElementToggle}
              onElementStyleChange={handleStyleChange}
              onBackgroundChange={setBackgroundColor}
              onPrimaryColorChange={setPrimaryColor}
              onSecondaryColorChange={setSecondaryColor}
              onAddElement={handleAddElement}
              onRemoveElement={handleRemoveElement}
              onClose={() => onEditingComplete?.()}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
