// src/components/AnimationLibraryPanel.tsx
import React, { useState } from "react";
import { X, Search, Play, Edit2, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SmartTextAnimator } from "./SmartTextAnimator";
import { AnimationEditor } from "./AnimationEditor";
import { AnimationPreset } from "@/types/animation";
import { cn } from "@/lib/utils";
import { useAnimationLibrary } from "@/hooks/useAnimationLibrary";
import { ANIMATION_CATEGORIES } from "@/lib/animationLibrary";
import { toast } from "sonner"; // For copy feedback
import { AnimationGridItem } from "./AnimationGridItem";

interface AnimationLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (preset: AnimationPreset) => void;
}

export const AnimationLibraryPanel: React.FC<AnimationLibraryPanelProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { allPresets, savePreset, deletePreset, prepareForEditing } =
    useAnimationLibrary();

  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPreset, setEditingPreset] = useState<AnimationPreset | null>(
    null
  );

  if (!isOpen) return null;

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

  if (isEditing && editingPreset) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" style={{ zIndex: "var(--z-sessions-panel)" }}>
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8" style={{ zIndex: "var(--z-sessions-panel)" }}>
      <div className="w-full max-w-6xl h-full max-h-[85vh] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="text-primary">✨</span> Animation Library
          </h2>
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

        {/* Categories */}
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

        {/* Grid Content */}
        <ScrollArea className="flex-1 p-6 bg-muted/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPresets.map((preset) => (
              <AnimationGridItem
                key={preset.id}
                preset={preset}
                isPlaying={hoveredId === preset.id}
                onHover={setHoveredId}
                onSelect={onSelect}
                onEdit={handleEditClick}
                onDuplicate={handleDuplicateClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
          {filteredPresets.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <p>No animations found matching your criteria.</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
