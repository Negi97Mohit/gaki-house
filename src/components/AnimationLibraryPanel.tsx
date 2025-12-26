// src/components/AnimationLibraryPanel.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Sparkles,
  Zap,
  Box,
  Type,
  Paintbrush,
  Layers,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { SmartTextAnimator } from "./SmartTextAnimator";
import { AnimationEditor } from "./AnimationEditor";
import { GSAPAnimationEditor } from "./GSAPAnimationEditor";
import { AnimationPreset } from "@/types/animation";
import { cn } from "@/shared/lib/utils";
import { useAnimationLibrary } from "@/hooks/useAnimationLibrary";
import { ANIMATION_CATEGORIES } from "@/lib/animationLibrary";
import { toast } from "sonner";
import { AnimationGridItem } from "./AnimationGridItem";
import { GSAPPresetPreview } from "./GSAPAnimatedBanner";
import { GSAP_PRESETS, GSAPPreset } from "@/lib/gsapAnimations";

interface AnimationLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  // NEW: Accept the active animation ID
  activeAnimationId?: string;
  onSelect: (preset: AnimationPreset) => void;
  onSelectGSAP?: (
    preset: GSAPPreset,
    customText?: string,
    customColor?: string
  ) => void;
}

const GSAP_CATEGORIES = [
  { id: "all", name: "All", icon: Sparkles },
  { id: "effects", name: "Effects", icon: Sparkles },
  { id: "reveal", name: "Reveal", icon: Layers },
  { id: "kinetic", name: "Kinetic", icon: Zap },
  { id: "glitch", name: "Glitch", icon: Paintbrush },
  { id: "3d", name: "3D", icon: Box },
  { id: "text", name: "Text", icon: Type },
  { id: "stylized", name: "Stylized", icon: Sparkles },
];

export const AnimationLibraryPanel: React.FC<AnimationLibraryPanelProps> = ({
  isOpen,
  onClose,
  activeAnimationId, // Destructure new prop
  onSelect,
  onSelectGSAP,
}) => {
  const { allPresets, savePreset, deletePreset, prepareForEditing } =
    useAnimationLibrary();

  const [activeTab, setActiveTab] = useState<"basic" | "pro">("pro");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeGsapCategory, setActiveGsapCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPreset, setEditingPreset] = useState<AnimationPreset | null>(
    null
  );

  // GSAP editing state
  const [isEditingGSAP, setIsEditingGSAP] = useState(false);
  const [editingGSAPPreset, setEditingGSAPPreset] = useState<GSAPPreset | null>(
    null
  );
  const [customGSAPPresets, setCustomGSAPPresets] = useState<GSAPPreset[]>([]);

  // NEW: Refs for scroll-to-selected
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // NEW: Scroll effect
  useEffect(() => {
    if (isOpen && activeAnimationId && itemRefs.current[activeAnimationId]) {
      const element = itemRefs.current[activeAnimationId];
      if (element) {
        // Small timeout to allow Tab content to mount/paint
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }
  }, [
    isOpen,
    activeAnimationId,
    activeTab,
    activeCategory,
    activeGsapCategory,
  ]);

  if (!isOpen) return null;

  // ... (Keep existing handlers: handleEditClick, handleDuplicateClick, etc.) ...
  const handleEditClick = (e: React.MouseEvent, preset: AnimationPreset) => {
    e.stopPropagation();
    const presetToEdit = prepareForEditing(preset);
    setEditingPreset(presetToEdit);
    setIsEditing(true);
  };

  const handleDuplicateClick = (
    e: React.MouseEvent,
    preset: AnimationPreset
  ) => {
    e.stopPropagation();
    const newPreset = prepareForEditing(preset);
    newPreset.name = `${newPreset.name} (Copy)`;
    savePreset(newPreset);
    toast.success("Animation duplicated");
  };

  const handleSaveEdit = (updatedPreset: AnimationPreset) => {
    savePreset(updatedPreset);
    setIsEditing(false);
    setEditingPreset(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Delete this custom animation?")) {
      deletePreset(id);
    }
  };

  // GSAP handlers
  const handleGSAPEdit = (preset: GSAPPreset) => {
    setEditingGSAPPreset({ ...preset, id: `custom-${Date.now()}` });
    setIsEditingGSAP(true);
  };

  const handleGSAPDuplicate = (preset: GSAPPreset) => {
    const newPreset: GSAPPreset = {
      ...preset,
      id: `custom-${Date.now()}`,
      name: `${preset.name} (Copy)`,
    };
    setCustomGSAPPresets((prev) => [...prev, newPreset]);
    toast.success("GSAP animation duplicated");
  };

  const handleGSAPSave = (
    preset: GSAPPreset,
    customText?: string,
    customColor?: string
  ) => {
    const existingIndex = customGSAPPresets.findIndex(
      (p) => p.id === preset.id
    );
    if (existingIndex >= 0) {
      setCustomGSAPPresets((prev) => {
        const updated = [...prev];
        updated[existingIndex] = preset;
        return updated;
      });
    } else {
      setCustomGSAPPresets((prev) => [...prev, preset]);
    }

    if (onSelectGSAP) {
      onSelectGSAP(preset, customText || preset.name, customColor);
    }

    setIsEditingGSAP(false);
    setEditingGSAPPreset(null);
    toast.success("Animation saved and applied to canvas");
    onClose();
  };

  const handleGSAPSelect = (preset: GSAPPreset) => {
    if (onSelectGSAP) {
      onSelectGSAP(preset);
    }
    toast.success(`Added "${preset.name}" pro animation`);
    onClose();
  };

  // ... (Keep Editors render logic) ...
  if (isEditingGSAP && editingGSAPPreset) {
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        style={{ zIndex: "var(--z-sessions-panel)" }}
      >
        <div className="w-full max-w-6xl h-full max-h-[85vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <GSAPAnimationEditor
            preset={editingGSAPPreset}
            onSave={handleGSAPSave}
            onCancel={() => setIsEditingGSAP(false)}
          />
        </div>
      </div>
    );
  }

  if (isEditing && editingPreset) {
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        style={{ zIndex: "var(--z-sessions-panel)" }}
      >
        <div className="w-full max-w-6xl h-full max-h-[85vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <AnimationEditor
            initialPreset={editingPreset}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  const filteredPresets = allPresets.filter((preset) => {
    const matchesCategory =
      activeCategory === "All" ||
      preset.category === activeCategory ||
      (activeCategory === "User" && preset.isCustom);
    const matchesSearch = preset.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const allGsapPresets = [...GSAP_PRESETS, ...customGSAPPresets];
  const filteredGsapPresets =
    activeGsapCategory === "all"
      ? allGsapPresets.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : allGsapPresets.filter(
          (p) =>
            p.category === activeGsapCategory &&
            p.name.toLowerCase().includes(search.toLowerCase())
        );

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      style={{ zIndex: "var(--z-sessions-panel)" }}
    >
      <div className="w-full max-w-6xl h-full max-h-[85vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Animation Library
            </h2>
            <div className="flex bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab("pro")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
                  activeTab === "pro"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Zap className="w-3.5 h-3.5" />
                Pro (GSAP)
              </button>
              <button
                onClick={() => setActiveTab("basic")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === "basic"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Basic
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md mx-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search animations..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Pro Animations (GSAP) */}
        {activeTab === "pro" && (
          <>
            <div className="flex gap-1 p-3 overflow-x-auto border-b border-border/30 bg-muted/20">
              {GSAP_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveGsapCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                      activeGsapCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>

            <ScrollArea className="flex-1 p-6 bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGsapPresets.map((preset) => (
                  // WRAPPER DIV for REF
                  <div
                    key={preset.id}
                    ref={(el) => (itemRefs.current[preset.id] = el)}
                  >
                    <GSAPPresetPreview
                      preset={preset}
                      // Check if this matches activeAnimationId
                      isSelected={
                        hoveredId === preset.id ||
                        activeAnimationId === preset.id
                      }
                      onClick={() => handleGSAPSelect(preset)}
                      onEdit={handleGSAPEdit}
                      onDuplicate={handleGSAPDuplicate}
                    />
                  </div>
                ))}
              </div>
              {filteredGsapPresets.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                  <Sparkles className="w-10 h-10 mb-3 opacity-30" />
                  <p>No pro animations found matching your search.</p>
                </div>
              )}
            </ScrollArea>

            <div className="p-3 border-t border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
              <p className="text-xs text-muted-foreground text-center">
                <Zap className="w-3 h-3 inline mr-1" />
                {filteredGsapPresets.length} professional animations powered by
                GSAP • Hover to preview
              </p>
            </div>
          </>
        )}

        {/* Basic Animations (Original) */}
        {activeTab === "basic" && (
          <>
            <div className="px-4 pt-2 bg-muted/30">
              <Tabs
                value={activeCategory}
                onValueChange={setActiveCategory}
                className="w-full"
              >
                <TabsList className="w-full justify-start h-auto flex-wrap gap-y-1 bg-transparent p-0">
                  {ANIMATION_CATEGORIES.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                  <TabsTrigger
                    value="User"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    My Creations
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className="flex-1 p-6 bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPresets.map((preset) => (
                  // WRAPPER DIV for REF
                  <div
                    key={preset.id}
                    ref={(el) => (itemRefs.current[preset.id] = el)}
                  >
                    <AnimationGridItem
                      preset={preset}
                      // Check activeAnimationId to auto-play or highlight
                      isPlaying={
                        hoveredId === preset.id ||
                        activeAnimationId === preset.id
                      }
                      onHover={setHoveredId}
                      onSelect={onSelect}
                      onEdit={handleEditClick}
                      onDuplicate={handleDuplicateClick}
                      onDelete={handleDeleteClick}
                    />
                  </div>
                ))}
              </div>
              {filteredPresets.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                  <p>No animations found matching your criteria.</p>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};
