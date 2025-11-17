import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Paintbrush,
  Zap,
  Palette,
  Droplets,
  Sparkles,
  Square,
  Share2, // --- 1. ADD Share2
  Users, // --- 2. ADD Users
  CloudOff, // --- 2. ADD Users
  Loader2, // --- 3. ADD Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { StyleControls } from "./StyleControls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { DYNAMIC_STYLES } from "@/lib/dynamicCaptionStyles";
import { CAPTION_PRESETS } from "@/lib/captionPresets";
import { CaptionStyle, GeneratedOverlay } from "@/types/caption";
import { CANVAS_PRESETS, CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { CanvasPreset } from "@/types/canvasPreset";
import { ScrollArea } from "./ui/scroll-area";
import {
  LayoutGrid,
  Crown,
  Zap as ZapIcon,
  Minus,
  Cpu,
  Film,
  Shirt,
  Clock,
} from "lucide-react";
import { Input } from "./ui/input";
import { ASPECT_RATIOS } from "@/lib/backgrounds";
import { Label } from "./ui/label";
import { FILTER_PRESETS } from "@/lib/filters";

interface FloatingControlsPanelProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  dynamicStyle: string;
  onDynamicStyleChange: (styleId: string) => void;
  backgroundEffect: "none" | "blur" | "image";
  onBackgroundEffectChange: (effect: "none" | "blur" | "image") => void;

  // --- All PiP/Camera controls removed ---

  savedOverlays: GeneratedOverlay[];
  onAddSavedOverlay: (overlay: GeneratedOverlay) => void;
  onDeleteSavedOverlay: (id: string) => void;
  isMouseActive: boolean;
  isOpen: boolean;
  onClose: () => void;

  // --- Canvas Aspect Ratio (Kept) ---
  canvasAspectRatio: string;
  onCanvasAspectRatioChange: (ratio: string) => void;

  // Canvas Preset
  onCanvasPresetSelect?: (preset: CanvasPreset) => void;
  customCanvasPresets?: CanvasPreset[];
  onSaveCanvasPreset?: (name: string) => void;
  onDeleteCanvasPreset?: (id: string) => void;
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
  onShareCanvasPreset?: (preset: CanvasPreset, authorName?: string) => void;
  onUnshareCanvasPreset?: (preset: CanvasPreset) => void; // <-- 2. Add prop
}

export const FloatingControlsPanel = (props: FloatingControlsPanelProps) => {
  const [isOpen, setIsOpen] = [props.isOpen, props.onClose];
  const [activeSection, setActiveSection] = useState<string | null>(
    "canvas-designs"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPresetCategory, setSelectedPresetCategory] =
    useState<string>("all");
  const [savePresetName, setSavePresetName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const categoryIcons = {
    LayoutGrid,
    Crown,
    Zap: ZapIcon,
    Minus,
    Cpu,
    Film,
    Shirt,
    Clock,
    Users,
  };
  const filteredCanvasPresets =
    selectedCategory === "all"
      ? CANVAS_PRESETS
      : selectedCategory === "community"
      ? props.publicPresets || []
      : CANVAS_PRESETS.filter((p) => p.styleTags.includes(selectedCategory));

  const filteredCaptionPresets =
    selectedPresetCategory === "all"
      ? CAPTION_PRESETS
      : CAPTION_PRESETS.filter(
          (p: any) => p.category === selectedPresetCategory
        );

  const handlePresetSelect = (preset: (typeof CAPTION_PRESETS)[0]) => {
    const updates: Partial<CaptionStyle> = {
      fontFamily: preset.style.fontFamily,
      fontSize: preset.style.fontSize,
      color: preset.style.color,
      backgroundColor: preset.style.backgroundColor,
    };
    props.onStyleChange({ ...props.style, ...updates });
  };

  // --- ADDED: State and Effect for looping previews ---
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    // Only run the animation interval when this section is visible
    if (activeSection === "dynamic-styles") {
      const interval = setInterval(() => {
        setPreviewKey((prevKey) => prevKey + 1);
      }, 3000); // Loop every 3 seconds
      return () => clearInterval(interval);
    }
  }, [activeSection]);
  // --- END ADDED ---

  // --- ADDED: Base style for animated previews ---
  const previewBaseStyle: React.CSSProperties = {
    fontSize: "18px",
    fontFamily: "Inter, sans-serif",
    color: "hsl(var(--foreground))",
    fontWeight: "600",
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        // Don't close if clicking the trigger button
        if (!target.closest("[data-floating-trigger]")) {
          setIsOpen();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  const sections = [
    {
      id: "canvas-designs",
      icon: LayoutGrid,
      title: "Designs",
      color: "from-violet-500 to-purple-500",
    },
    // --- REMOVED: "camera" section ---
    {
      id: "dynamic-styles",
      icon: Zap,
      title: "Caption Dynamic Styles",
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "static-presets",
      icon: Paintbrush,
      title: "Style Presets",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "base-text",
      icon: Palette,
      title: "Caption Text Style",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "saved-overlays",
      icon: Sparkles,
      title: "Overlays",
      color: "from-purple-500 to-violet-500",
    },
  ];

  return (
    <>
      {/* Floating Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed bottom-24 left-6 rounded-2xl overflow-hidden",
          "bg-background/40 backdrop-blur-xl border border-border/40 shadow-2xl",
          "transition-all duration-300 ease-out flex",
          isOpen && props.isMouseActive
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
        style={{
          zIndex: "var(--z-floating-panel)",
          maxHeight: "70vh",
        }}
      >
        {/* Sidebar Navigation */}
        <div className="w-16 bg-background/20 backdrop-blur-sm border-r border-border/30 flex flex-col items-center py-3 gap-1.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "hover:bg-background/40 text-muted-foreground hover:text-foreground"
              )}
              title={section.title}
            >
              <section.icon className="w-5 h-5" />
              {activeSection === section.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-l-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-[420px] max-h-[70vh] overflow-y-auto p-5 bg-background/10 backdrop-blur-sm">
          {activeSection === "canvas-designs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold tracking-wide">
                    Canvas Designs
                  </h3>
                </div>
                {props.onSaveCanvasPreset && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSaveInput(!showSaveInput)}
                    className="text-xs"
                  >
                    {showSaveInput ? "Cancel" : "Save Current"}
                  </Button>
                )}
              </div>

              {/* Save Preset Input */}
              {showSaveInput && props.onSaveCanvasPreset && (
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Preset name..."
                    value={savePresetName}
                    onChange={(e) => setSavePresetName(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && savePresetName.trim()) {
                        props.onSaveCanvasPreset!(savePresetName.trim());
                        setSavePresetName("");
                        setShowSaveInput(false);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (savePresetName.trim()) {
                        props.onSaveCanvasPreset!(savePresetName.trim());
                        setSavePresetName("");
                        setShowSaveInput(false);
                      }
                    }}
                    disabled={!savePresetName.trim()}
                  >
                    Save
                  </Button>
                </div>
              )}

              {/* Custom Presets Section */}
              {props.customCanvasPresets &&
                props.customCanvasPresets.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      Your Saved Presets
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {props.customCanvasPresets.map((preset) => (
                        <div key={preset.id} className="relative group">
                          <button
                            onClick={() => props.onCanvasPresetSelect?.(preset)}
                            className="w-full rounded-lg overflow-hidden border-2 border-primary/40 hover:border-primary hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-200 bg-background"
                          >
                            <div
                              className="w-full aspect-video relative overflow-hidden transition-transform duration-200 group-hover:scale-105"
                              style={{
                                background: preset.background.blankCanvasColor,
                              }}
                            >
                              <div
                                className="absolute"
                                style={{
                                  left: `${preset.pip.pipPosition?.x || 50}%`,
                                  top: `${preset.pip.pipPosition?.y || 50}%`,
                                  width: `${preset.pip.pipSize?.width || 40}%`,
                                  height: `${
                                    preset.pip.pipSize?.height || 40
                                  }%`,
                                  transform: "translate(-50%, -50%)",
                                  borderRadius:
                                    preset.pip.cameraShape === "circle"
                                      ? "50%"
                                      : preset.pip.cameraShape === "rounded"
                                      ? "12px"
                                      : "0",
                                  border: `${
                                    preset.pip.pipBorder?.width || 2
                                  }px solid ${
                                    preset.pip.pipBorder?.color || "#fff"
                                  }`,
                                  background: "rgba(100, 100, 100, 0.3)",
                                }}
                              />
                            </div>
                            <div className="px-3 py-2 bg-background/80 backdrop-blur-sm border-t border-border/20">
                              <p className="text-xs font-medium text-foreground truncate">
                                {preset.name}
                              </p>
                            </div>
                          </button>
                          {/* --- 3. MAKE BUTTONS CONDITIONAL --- */}
                          {preset.publicId ? (
                            // ALREADY SHARED: Show Unshare Button
                            <Button
                              size="icon"
                              variant="outline"
                              className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  confirm(
                                    "Are you sure you want to unshare this preset?"
                                  )
                                ) {
                                  props.onUnshareCanvasPreset?.(preset);
                                }
                              }}
                              title="Remove from Community"
                            >
                              <CloudOff className="h-3 w-3" />
                            </Button>
                          ) : (
                            // NOT SHARED: Show Share Button
                            <Button
                              size="icon"
                              variant="outline"
                              className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                const authorName =
                                  prompt("Enter your name (optional):") ||
                                  "Anonymous";
                                props.onShareCanvasPreset?.(preset, authorName);
                              }}
                              title="Share to Community"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          )}
                          {/* --- END SHARE BUTTON --- */}

                          {/* --- 10. MODIFY DELETE BUTTON CONDITION --- */}
                          {props.onDeleteCanvasPreset && (
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                props.onDeleteCanvasPreset!(preset.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Category Navigation */}
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                Template Presets
              </h4>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-3 min-w-max">
                  {CANVAS_PRESET_CATEGORIES.map((cat) => {
                    const IconComponent =
                      categoryIcons[cat.icon as keyof typeof categoryIcons];
                    return (
                      <Button
                        key={cat.id}
                        variant={
                          selectedCategory === cat.id ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "text-xs font-cyber whitespace-nowrap transition-all duration-200",
                          selectedCategory === cat.id
                            ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border-none"
                            : "border-violet-500/30 hover:border-violet-500 text-violet-500"
                        )}
                      >
                        {IconComponent && (
                          <IconComponent className="w-3 h-3 mr-1.5" />
                        )}
                        {cat.name.toUpperCase()}
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
              {/* --- 8. ADD LOADING STATE FOR COMMUNITY TAB --- */}
              {selectedCategory === "community" && props.isLoadingPublic && (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {/* --- END LOADING STATE --- */}

              {/* Canvas Preset Grid */}
              <div className="grid grid-cols-2 gap-3 max-h-[calc(70vh-200px)] overflow-y-auto pr-2">
                {/* --- 9. HIDE PRESETS WHILE COMMUNITY IS LOADING --- */}
                {!(selectedCategory === "community" && props.isLoadingPublic) &&
                  filteredCanvasPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => props.onCanvasPresetSelect?.(preset)}
                      className="group relative rounded-lg overflow-hidden border-2 border-violet-500/20 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-200 bg-background"
                    >
                      {/* Preview */}
                      <div
                        className="w-full aspect-video relative overflow-hidden transition-transform duration-200 group-hover:scale-105"
                        style={{
                          background: preset.background.blankCanvasColor,
                        }}
                      >
                        {/* Mock camera */}
                        <div
                          className="absolute"
                          style={{
                            left: `${preset.pip.pipPosition?.x || 50}%`,
                            top: `${preset.pip.pipPosition?.y || 50}%`,
                            width: `${preset.pip.pipSize?.width || 40}%`,
                            height: `${preset.pip.pipSize?.height || 40}%`,
                            transform: "translate(-50%, -50%)",
                            borderRadius:
                              preset.pip.cameraShape === "circle"
                                ? "50%"
                                : preset.pip.cameraShape === "rounded"
                                ? "12px"
                                : "0",
                            border: `${
                              preset.pip.pipBorder?.width || 2
                            }px solid ${preset.pip.pipBorder?.color || "#fff"}`,
                            boxShadow: preset.pip.pipShadow
                              ? `0 0 ${preset.pip.pipShadow.blur}px ${preset.pip.pipShadow.color}`
                              : "none",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          }}
                        />

                        {/* Text overlays */}
                        {preset.textOverlays.slice(0, 1).map((text) => (
                          <div
                            key={text.id}
                            className="absolute text-center overflow-hidden"
                            style={{
                              left: `${text.layout.position.x}%`,
                              top: `${text.layout.position.y}%`,
                              width: `${text.layout.size.width}%`,
                              height: `${text.layout.size.height}%`,
                              transform: `translate(-50%, -50%) rotate(${text.layout.rotation}deg)`,
                              fontFamily: text.style.fontFamily,
                              fontSize: `${Math.min(
                                text.style.fontSize * 0.15,
                                12
                              )}px`,
                              color: text.style.color,
                              backgroundColor: text.style.backgroundColor,
                              border: text.style.border,
                              backdropFilter: text.style.backdropFilter,
                              textShadow: text.style.textShadow,
                              fontWeight: text.style.fontWeight,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: text.style.textAlign,
                              padding: "2px 4px",
                              lineHeight: 1.2,
                            }}
                          >
                            {text.content
                              .replace(/<[^>]+>/g, " ")
                              .replace(/\s+/g, " ")
                              .trim()}
                          </div>
                        ))}
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 pt-6">
                        <span className="text-xs font-semibold font-cyber text-white block truncate">
                          {preset.name}
                        </span>
                        {/* --- 10. ADD AUTHOR NAME FOR COMMUNITY PRESETS --- */}
                        {selectedCategory === "community" &&
                          (preset as any).authorName && (
                            <span className="text-[9px] text-violet-300 block">
                              by {(preset as any).authorName}
                            </span>
                          )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {preset.styleTags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/30 text-violet-200 font-cyber"
                            >
                              {tag.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>

              {filteredCanvasPresets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No designs found in this category
                </div>
              )}
            </div>
          )}

          {/* --- REMOVED: activeSection === "camera" block --- */}

          {activeSection === "dynamic-styles" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold tracking-wide">
                  Caption Dynamic Styles
                </h3>
              </div>
              <RadioGroup
                value={props.dynamicStyle}
                onValueChange={props.onDynamicStyleChange}
                className="grid grid-cols-2 gap-3"
              >
                {/* --- MODIFIED: Iterate over DYNAMIC_STYLES to get components --- */}
                {Object.values(DYNAMIC_STYLES).map((styleDef) => {
                  const isSelected = props.dynamicStyle === styleDef.id;
                  const Component = styleDef.component;

                  return (
                    <div
                      key={styleDef.id}
                      className={cn(
                        "relative rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer group",
                        isSelected
                          ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                          : "border-yellow-500/20 hover:border-yellow-500/60"
                      )}
                      onClick={() => props.onDynamicStyleChange(styleDef.id)}
                    >
                      <RadioGroupItem
                        value={styleDef.id}
                        id={styleDef.id}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={styleDef.id}
                        className="block cursor-pointer"
                      >
                        <div className="aspect-video bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 relative overflow-hidden">
                          <div className="absolute inset-0 bg-grid-yellow-500/10" />
                          {/* --- REPLACED: Static text with live component preview --- */}
                          <div
                            key={`${styleDef.id}-${previewKey}`}
                            className="relative z-10 w-full text-center"
                            style={
                              isSelected
                                ? {
                                    ...previewBaseStyle,
                                    color: "hsl(var(--primary))",
                                  }
                                : previewBaseStyle
                            }
                          >
                            <Component
                              text="This is a preview"
                              fullTranscript="This is a preview"
                              interimTranscript=""
                              baseStyle={
                                isSelected
                                  ? {
                                      ...previewBaseStyle,
                                      color: "hsl(var(--primary))",
                                    }
                                  : previewBaseStyle
                              }
                            />
                          </div>
                        </div>
                        <div
                          className={cn(
                            "p-2 text-center text-xs font-semibold font-cyber transition-colors",
                            isSelected
                              ? "bg-yellow-500 text-black"
                              : "bg-background/80 text-foreground"
                          )}
                        >
                          {styleDef.name}
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {activeSection === "static-presets" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
                <Paintbrush className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold tracking-wide">
                  Caption Static Styles
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredCaptionPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    title={preset.name}
                    className="group relative rounded-lg overflow-hidden border-2 border-pink-500/20 hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-200"
                  >
                    <img
                      src={preset.preview}
                      alt={preset.name}
                      className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                      <span className="text-xs font-semibold font-cyber text-white">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === "base-text" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold tracking-wide">
                  Caption Text Style
                </h3>
              </div>
              <StyleControls
                style={props.style}
                onStyleChange={props.onStyleChange}
              />
            </div>
          )}

          {activeSection === "saved-overlays" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold tracking-wide">
                  Saved Overlays
                </h3>
              </div>
              {props.savedOverlays.length === 0 ? (
                <div className="text-center p-8 rounded-lg bg-background/50 border-2 border-purple-500/20">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500/50" />
                  <p className="text-sm text-muted-foreground font-cyber">
                    Generated overlays will be saved here for reuse.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {props.savedOverlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      className="group relative aspect-square rounded-lg bg-background/50 border-2 border-purple-500/20 hover:border-purple-500 flex items-center justify-center overflow-hidden transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    >
                      <button
                        className="w-full h-full"
                        onClick={() => props.onAddSavedOverlay(overlay)}
                        title="Add overlay to canvas"
                      >
                        {overlay.preview ? (
                          <img
                            src={overlay.preview}
                            alt="Overlay preview"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground font-cyber">
                            NO PREVIEW
                          </span>
                        )}
                      </button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => props.onDeleteSavedOverlay(overlay.id)}
                        title="Delete saved overlay"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
