// src/components/animated-banners/EditableBannerContent.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { BannerElementEditor, BannerElement } from "./BannerElementEditor";
import { Plus, Type, Image, Link, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { generateSimpleId } from "@/lib/id";

export interface EditableBannerContentData {
  elements: BannerElement[];
}

interface EditableBannerContentProps {
  isEditing: boolean;
  containerSize: { width: number; height: number };
  initialData?: EditableBannerContentData;
  primaryColor?: string;
  secondaryColor?: string;
  onChange?: (data: EditableBannerContentData) => void;
  showAvatar?: boolean;
  showTagline?: boolean;
}

// Default elements for a new banner
const createDefaultElements = (
  containerSize: { width: number; height: number },
  showAvatar: boolean,
  showTagline: boolean
): BannerElement[] => {
  const centerY = containerSize.height / 2;
  const elements: BannerElement[] = [];

  if (showAvatar) {
    elements.push({
      id: generateSimpleId(),
      type: "avatar",
      position: { x: 20, y: centerY - 24 },
      size: { width: 48, height: 48 },
      content: "",
      visible: true,
    });
  }

  elements.push({
    id: generateSimpleId(),
    type: "text",
    position: { x: showAvatar ? 80 : 20, y: centerY - 16 },
    content: "Your Name",
    style: { fontSize: 18, fontWeight: "bold", color: "#ffffff" },
    visible: true,
  });

  if (showTagline) {
    elements.push({
      id: generateSimpleId(),
      type: "tagline",
      position: { x: showAvatar ? 80 : 20, y: centerY + 8 },
      content: "Creator • Streamer",
      style: { fontSize: 14, color: "#ffffffcc" },
      visible: true,
    });
  }

  return elements;
};

export const EditableBannerContent: React.FC<EditableBannerContentProps> = ({
  isEditing,
  containerSize,
  initialData,
  primaryColor = "#667eea",
  secondaryColor = "#764ba2",
  onChange,
  showAvatar = true,
  showTagline = true,
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Initialize elements from data or create defaults
  const [elements, setElements] = useState<BannerElement[]>(() => {
    if (initialData?.elements && initialData.elements.length > 0) {
      return initialData.elements;
    }
    return createDefaultElements(containerSize, showAvatar, showTagline);
  });

  // Notify parent of changes
  useEffect(() => {
    onChange?.({ elements });
  }, [elements, onChange]);

  // Update element
  const handleUpdateElement = useCallback((id: string, updates: Partial<BannerElement>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  }, []);

  // Remove element
  const handleRemoveElement = useCallback((id: string) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, visible: false } : el)));
    setSelectedElementId(null);
  }, []);

  // Add new element
  const handleAddElement = useCallback(
    (type: BannerElement["type"]) => {
      const centerX = containerSize.width / 2 - 50;
      const centerY = containerSize.height / 2 - 15;

      const newElement: BannerElement = {
        id: generateSimpleId(),
        type,
        position: { x: centerX, y: centerY },
        content: type === "text" ? "New Text" : type === "tagline" ? "New Tagline" : "",
        style:
          type === "text"
            ? { fontSize: 18, fontWeight: "bold", color: "#ffffff" }
            : type === "tagline"
            ? { fontSize: 14, color: "#ffffffcc" }
            : undefined,
        platform: type === "social-link" ? "twitter" : undefined,
        size: type === "avatar" ? { width: 48, height: 48 } : type === "social-link" ? { width: 32, height: 32 } : undefined,
        visible: true,
      };

      setElements((prev) => [...prev, newElement]);
      setSelectedElementId(newElement.id);
    },
    [containerSize]
  );

  // Reset to defaults
  const handleReset = useCallback(() => {
    setElements(createDefaultElements(containerSize, showAvatar, showTagline));
    setSelectedElementId(null);
  }, [containerSize, showAvatar, showTagline]);

  // Click outside to deselect
  const handleContainerClick = useCallback(() => {
    if (isEditing) {
      setSelectedElementId(null);
    }
  }, [isEditing]);

  const visibleElements = useMemo(() => elements.filter((el) => el.visible), [elements]);

  return (
    <div
      className="absolute inset-0 z-10"
      onClick={handleContainerClick}
    >
      {/* Render editable elements */}
      {visibleElements.map((element) => (
        <BannerElementEditor
          key={element.id}
          element={element}
          isSelected={isEditing && selectedElementId === element.id}
          containerSize={containerSize}
          onSelect={(id) => isEditing && setSelectedElementId(id)}
          onUpdate={handleUpdateElement}
          onRemove={handleRemoveElement}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      ))}

      {/* Add element toolbar - only when editing */}
      {isEditing && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleAddElement("text")}>
                <Type className="w-4 h-4 mr-2" />
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("tagline")}>
                <Type className="w-4 h-4 mr-2" />
                Tagline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("avatar")}>
                <Image className="w-4 h-4 mr-2" />
                Avatar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement("social-link")}>
                <Link className="w-4 h-4 mr-2" />
                Social Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          <span className="text-xs text-muted-foreground ml-2">
            Click to select • Double-click text to edit • Drag to move
          </span>
        </div>
      )}
    </div>
  );
};
