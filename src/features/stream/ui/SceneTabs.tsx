import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Plus,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Layers,
  GitBranch,
  MoreHorizontal,
  Copy,
  Sparkles,
  RotateCcw,
  DownloadCloud,
  Loader2,
} from "lucide-react";
import { SceneState, SceneTransition, SubSceneState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { StreamStyleSelector } from "@/features/stream/ui/scenes/StreamStyleSelector";
import { StreamStylePreset } from "@/types/streamStyle";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";
import { useImportSceneCollection } from "@/features/vault/hooks/useImportSceneCollection";

const TransitionIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.25 3.625h.913c.487 0 .937.258 1.184.677l1.767 3c.253.43.253.965 0 1.396l-1.767 3c-.247.42-.697.677-1.184.677H4.25c-.76 0-1.375-.616-1.375-1.375V5c0-.76.616-1.375 1.375-1.375Z"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="m11.35 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".4"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="m8.75 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".7"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

interface SceneTabsProps {
  scenes: SceneState[];
  activeSceneId: string;
  activeSubsceneId?: string;
  transitions: SceneTransition[];
  onSceneSelect: (id: string, subsceneId?: string) => void;
  onSceneAdd: () => void;
  onSubsceneAdd?: (parentId: string) => void;
  onTransitionClick: (transition: SceneTransition) => void;
  onSceneClose: (id: string) => void;
  onSubsceneClose?: (parentId: string, subsceneId: string) => void;
  onSceneReorder: (fromIndex: number, toIndex: number) => void;
  onSubsceneReorder?: (
    parentId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
  onSceneRename: (id: string, newName: string) => void;
  onSubsceneRename?: (
    parentId: string,
    subsceneId: string,
    newName: string
  ) => void;
  onToggleExpand?: (sceneId: string) => void;
  onDuplicateScene?: (sceneId: string) => void;
  onResetScene?: (sceneId: string) => void;
  isHidden: boolean;
  onHide: () => void;
  isPopoverOpen?: boolean; // Prevent hiding when popover is open
  onApplyStreamStyle?: (preset: StreamStylePreset) => void;
  onReplaceSceneCollection?: (name: string, scenes: SceneState[]) => void;
}

export const SceneTabs: React.FC<SceneTabsProps> = ({
  scenes,
  activeSceneId,
  activeSubsceneId,
  transitions,
  onSceneSelect,
  onSceneAdd,
  onSubsceneAdd,
  onTransitionClick,
  onSceneClose,
  onSubsceneClose,
  onSceneReorder,
  onSubsceneReorder,
  onSceneRename,
  onSubsceneRename,
  onToggleExpand,
  onDuplicateScene,
  onResetScene,
  isHidden,
  onHide,
  isPopoverOpen = false,
  onApplyStreamStyle,
  onReplaceSceneCollection,
}) => {
  const [dragState, setDragState] = useState<{
    type: "scene" | "subscene";
    index: number;
    parentId?: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    type: "scene" | "subscene";
    index: number;
    parentId?: string;
    position: "before" | "after";
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showTopScroll, setShowTopScroll] = useState(false);
  const [showBottomScroll, setShowBottomScroll] = useState(false);
  const [isStreamStyleSelectorOpen, setIsStreamStyleSelectorOpen] =
    useState(false);

  const { importSetup, isImporting } = useImportSceneCollection({
    onSuccess: (name, importedScenes) => {
      onReplaceSceneCollection?.(name, importedScenes);
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // NEW: Ref to store all tab elements by ID
  const tabsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // NEW: Effect to scroll active tab into view
  useEffect(() => {
    // Determine which ID is the "active" one to scroll to
    const targetId = activeSubsceneId || activeSceneId;

    if (targetId && tabsRef.current[targetId]) {
      const element = tabsRef.current[targetId];
      if (element) {
        // Use a small timeout to ensure layout is settled (e.g. after expanding a folder)
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "nearest", // Ensures it doesn't scroll the whole page
          });
        }, 50);
      }
    }
  }, [activeSceneId, activeSubsceneId, scenes]); // Depend on scenes in case expansion changes layout

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        setShowTopScroll(scrollTop > 0);
        setShowBottomScroll(scrollTop < scrollHeight - clientHeight - 1);
      }
    };

    checkScroll();
    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [scenes]);

  const scroll = (direction: "up" | "down") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: direction === "up" ? -100 : 100,
        behavior: "smooth",
      });
    }
  };

  const handleDragStart = (
    e: React.DragEvent,
    type: "scene" | "subscene",
    index: number,
    parentId?: string
  ) => {
    setDragState({ type, index, parentId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragOver = (
    e: React.DragEvent,
    type: "scene" | "subscene",
    index: number,
    parentId?: string
  ) => {
    e.preventDefault();
    if (!dragState) return;

    // Only allow same-type drags
    if (dragState.type !== type) return;
    if (type === "subscene" && dragState.parentId !== parentId) return;
    if (dragState.index === index && dragState.parentId === parentId) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "before" : "after";

    setDropTarget({ type, index, parentId, position });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragState || !dropTarget) {
      setDragState(null);
      setDropTarget(null);
      return;
    }

    let toIndex = dropTarget.index;
    if (dropTarget.position === "after") {
      toIndex += 1;
    }
    // Adjust if dragging from before the drop position
    if (dragState.index < toIndex) {
      toIndex -= 1;
    }

    if (dragState.type === "scene" && dropTarget.type === "scene") {
      if (dragState.index !== toIndex) {
        onSceneReorder(dragState.index, toIndex);
      }
    } else if (
      dragState.type === "subscene" &&
      dropTarget.type === "subscene" &&
      dragState.parentId === dropTarget.parentId &&
      onSubsceneReorder
    ) {
      if (dragState.index !== toIndex) {
        onSubsceneReorder(dragState.parentId!, dragState.index, toIndex);
      }
    }

    setDragState(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDragState(null);
    setDropTarget(null);
  };

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = (sceneId: string, subsceneId?: string) => {
    if (editingName.trim()) {
      if (subsceneId && onSubsceneRename) {
        onSubsceneRename(sceneId, subsceneId, editingName.trim());
      } else {
        onSceneRename(sceneId, editingName.trim());
      }
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    sceneId: string,
    subsceneId?: string
  ) => {
    if (e.key === "Enter") {
      handleNameSubmit(sceneId, subsceneId);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditingName("");
    }
  };

  const getTransitionBetweenScenes = (
    fromSceneId: string,
    toSceneId: string
  ) => {
    return transitions.find(
      (t) =>
        (t.fromSceneId === fromSceneId && t.toSceneId === toSceneId) ||
        (t.fromSceneId === toSceneId && t.toSceneId === fromSceneId)
    );
  };

  // Don't hide while dragging or while popover is open
  const effectivelyHidden = isHidden && !dragState && !isPopoverOpen;

  return (
    <div
      className={cn(
        "fixed top-1/2 right-3 -translate-y-1/2",
        "transition-all duration-300 ease-in-out",
        effectivelyHidden
          ? "translate-x-full opacity-0 pointer-events-none"
          : "opacity-100"
      )}
      style={{ zIndex: "var(--z-scene-tabs)" }}
    >
      {/* Main Container - Sleek glass island */}
      <div className="relative bg-background/80 dark:bg-background/60 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl w-44 max-h-[60vh] flex flex-col pointer-events-auto shadow-2xl shadow-black/10 dark:shadow-black/30">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
        
        {/* Header - Compact */}
        <div className="relative flex-shrink-0 flex items-center justify-between px-2.5 py-2 border-b border-border/10 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-muted-foreground/70" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Scenes
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              className="w-5 h-5 flex items-center justify-center text-primary/80 hover:text-primary rounded-lg hover:bg-primary/10 transition-all"
              onClick={() => setIsStreamStyleSelectorOpen(true)}
              title="Stream Styles"
            >
              <Sparkles className="w-3 h-3" />
            </button>
            <ShortcutTooltip label="Hide Scenes" shortcut="toggleGridLayout" side="left">
              <button
                className="w-5 h-5 flex items-center justify-center text-muted-foreground/60 hover:text-foreground rounded-lg hover:bg-foreground/5 transition-all"
                onClick={onHide}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </ShortcutTooltip>
          </div>
        </div>

        {/* Scroll Up */}
        {showTopScroll && (
          <button
            className="relative flex-shrink-0 w-full py-0.5 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
            onClick={() => scroll("up")}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        )}

        {/* Scenes List */}
        <div
          ref={scrollContainerRef}
          className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1 px-1"
          style={{ scrollbarWidth: "none" }}
        >
          {scenes.map((scene, index) => {
            const isActive = scene.id === activeSceneId && !activeSubsceneId;
            const isDragging =
              dragState?.type === "scene" && dragState.index === index;
            const isDropBefore =
              dropTarget?.type === "scene" &&
              dropTarget.index === index &&
              dropTarget.position === "before";
            const isDropAfter =
              dropTarget?.type === "scene" &&
              dropTarget.index === index &&
              dropTarget.position === "after";
            const hasSubscenes = scene.subscenes && scene.subscenes.length > 0;
            const isExpanded = scene.isExpanded ?? true;

            // Get transition to next scene
            const nextScene = scenes[index + 1];
            const transitionToNext = nextScene
              ? getTransitionBetweenScenes(scene.id, nextScene.id)
              : null;

            return (
              <React.Fragment key={scene.id}>
                {/* Drop indicator before */}
                {isDropBefore && (
                  <div className="h-0.5 bg-primary/50 mx-1.5 rounded-full" />
                )}

                {/* Scene Tab - Minimal pill style */}
                <div
                  ref={(el) => (tabsRef.current[scene.id] = el)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "scene", index)}
                  onDragOver={(e) => handleDragOver(e, "scene", index)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group flex items-center h-7 px-2 rounded-xl cursor-pointer transition-all duration-200",
                    isActive
                      ? "bg-primary/15 dark:bg-primary/20 text-foreground"
                      : "hover:bg-foreground/5 dark:hover:bg-white/5",
                    isDragging && "opacity-40"
                  )}
                  onClick={(e) => {
                    if (editingId) return;
                    const target = e.target as HTMLElement;
                    if (target.closest("[data-expand-toggle]")) return;
                    onSceneSelect(scene.id);
                  }}
                  onDoubleClick={() => handleDoubleClick(scene.id, scene.name)}
                >
                  {/* Expand/Collapse or dot indicator */}
                  <div className="w-4 flex items-center justify-center flex-shrink-0">
                    {hasSubscenes ? (
                      <button
                        data-expand-toggle
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onToggleExpand?.(scene.id);
                        }}
                        className="hover:bg-foreground/10 rounded-md p-0.5 transition-all"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-2.5 h-2.5" />
                        ) : (
                          <ChevronRight className="w-2.5 h-2.5" />
                        )}
                      </button>
                    ) : (
                      <div
                        className={cn(
                          "w-1 h-1 rounded-full transition-colors",
                          isActive
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        )}
                      />
                    )}
                  </div>

                  {/* Drag Handle - Hidden until hover */}
                  <GripVertical
                    className="w-2.5 h-2.5 mr-0.5 opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0 cursor-grab"
                  />

                  {/* Tab Name or Input */}
                  {editingId === scene.id ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editingName}
                      onChange={handleNameChange}
                      onBlur={() => handleNameSubmit(scene.id)}
                      onKeyDown={(e) => handleKeyDown(e, scene.id)}
                      className="flex-1 bg-transparent border-b border-primary/50 outline-none text-[11px] min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex-1 text-[11px] truncate min-w-0",
                        isActive ? "font-medium text-foreground" : "font-normal text-muted-foreground"
                      )}
                    >
                      {scene.name}
                    </span>
                  )}

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-foreground/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-2.5 w-2.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-32 z-[9999] bg-popover/95 backdrop-blur-2xl border border-border/20 dark:border-white/10 shadow-xl rounded-xl"
                    >
                      <DropdownMenuItem
                        onClick={() => handleDoubleClick(scene.id, scene.name)}
                        className="text-[11px] py-1.5"
                      >
                        Rename
                      </DropdownMenuItem>
                      {onDuplicateScene && (
                        <DropdownMenuItem
                          onClick={() => onDuplicateScene(scene.id)}
                          className="text-[11px] py-1.5"
                        >
                          <Copy className="w-2.5 h-2.5 mr-1.5" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onSubsceneAdd && (
                        <DropdownMenuItem
                          onClick={() => onSubsceneAdd(scene.id)}
                          className="text-[11px] py-1.5"
                        >
                          <GitBranch className="w-2.5 h-2.5 mr-1.5" />
                          Subscene
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-border/20" />
                      {onResetScene && (
                        <DropdownMenuItem
                          onClick={() => onResetScene(scene.id)}
                          className="text-[11px] py-1.5"
                        >
                          <RotateCcw className="w-2.5 h-2.5 mr-1.5" />
                          Reset
                        </DropdownMenuItem>
                      )}
                      {scenes.length > 1 && (
                        <DropdownMenuItem
                          onClick={() => onSceneClose(scene.id)}
                          className="text-destructive focus:text-destructive text-[11px] py-1.5"
                        >
                          <X className="w-2.5 h-2.5 mr-1.5" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Drop indicator after */}
                {isDropAfter && !hasSubscenes && (
                  <div className="h-0.5 bg-primary/50 mx-1.5 rounded-full" />
                )}

                {/* Subscenes with git-tree visualization */}
                {hasSubscenes && isExpanded && (
                  <div className="ml-3 relative">
                    {/* Vertical git line */}
                    <div className="absolute left-2 top-0 bottom-2 w-px bg-border/30" />

                    {scene
                      .subscenes!.sort((a, b) => a.order - b.order)
                      .map((subscene, subIndex) => {
                        const isSubActive =
                          scene.id === activeSceneId &&
                          subscene.id === activeSubsceneId;
                        const isSubDragging =
                          dragState?.type === "subscene" &&
                          dragState.parentId === scene.id &&
                          dragState.index === subIndex;
                        const isSubDropBefore =
                          dropTarget?.type === "subscene" &&
                          dropTarget.parentId === scene.id &&
                          dropTarget.index === subIndex &&
                          dropTarget.position === "before";
                        const isSubDropAfter =
                          dropTarget?.type === "subscene" &&
                          dropTarget.parentId === scene.id &&
                          dropTarget.index === subIndex &&
                          dropTarget.position === "after";
                        const nextSubscene = scene.subscenes![subIndex + 1];

                        return (
                          <div key={subscene.id} className="relative">
                            {/* Horizontal branch line */}
                            <div className="absolute left-2 top-[11px] w-2 h-px bg-border/30" />

                            {/* Branch node */}
                            <div
                              className={cn(
                                "absolute left-[5px] top-[8px] w-1.5 h-1.5 rounded-full",
                                isSubActive
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
                              )}
                            />

                            {/* Drop indicator before */}
                            {isSubDropBefore && (
                              <div className="h-0.5 bg-primary/50 ml-4 mr-0.5 rounded-full" />
                            )}

                            <div
                              ref={(el) => (tabsRef.current[subscene.id] = el)}
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(
                                  e,
                                  "subscene",
                                  subIndex,
                                  scene.id
                                )
                              }
                              onDragOver={(e) =>
                                handleDragOver(
                                  e,
                                  "subscene",
                                  subIndex,
                                  scene.id
                                )
                              }
                              onDrop={handleDrop}
                              onDragEnd={handleDragEnd}
                              className={cn(
                                "group flex items-center gap-0.5 h-6 px-1.5 ml-4 rounded-lg cursor-pointer transition-all duration-200",
                                isSubActive
                                  ? "bg-primary/10 dark:bg-primary/15 text-foreground"
                                  : "hover:bg-foreground/5 dark:hover:bg-white/5",
                                isSubDragging && "opacity-40"
                              )}
                              onClick={() =>
                                onSceneSelect(scene.id, subscene.id)
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(subscene.id, subscene.name)
                              }
                            >
                              <GripVertical className="w-2 h-2 opacity-0 group-hover:opacity-30 flex-shrink-0 cursor-grab" />

                              {editingId === subscene.id ? (
                                <input
                                  ref={inputRef}
                                  value={editingName}
                                  onChange={handleNameChange}
                                  onBlur={() =>
                                    handleNameSubmit(scene.id, subscene.id)
                                  }
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, scene.id, subscene.id)
                                  }
                                  className="flex-1 bg-transparent border-b border-primary/50 text-[10px] outline-none min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span
                                  className={cn(
                                    "flex-1 text-[10px] truncate",
                                    isSubActive
                                      ? "font-medium text-foreground"
                                      : "text-muted-foreground/70"
                                  )}
                                >
                                  {subscene.name}
                                </span>
                              )}

                              {onSubsceneClose && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 rounded-md hover:bg-foreground/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSubsceneClose(scene.id, subscene.id);
                                  }}
                                >
                                  <X className="h-2 w-2" />
                                </Button>
                              )}
                            </div>

                            {/* Drop indicator after */}
                            {isSubDropAfter && (
                              <div className="h-0.5 bg-primary/50 ml-4 mr-0.5 rounded-full" />
                            )}

                            {/* Transition between subscenes */}
                            {nextSubscene && (
                              <div className="flex items-center ml-5 py-0.5">
                                <div className="flex-1 h-px bg-border/10" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-3.5 w-3.5 mx-0.5 transition-all rounded-md",
                                    subscene.transitionToNext
                                      ? "text-muted-foreground/60 hover:text-primary"
                                      : "text-muted-foreground/20 hover:text-primary"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (subscene.transitionToNext) {
                                      onTransitionClick(
                                        subscene.transitionToNext
                                      );
                                    } else {
                                      const newTransition: SceneTransition = {
                                        id: `subtrans-${Date.now()}`,
                                        fromSceneId: subscene.id,
                                        toSceneId: nextSubscene.id,
                                        type: "cross_dissolve",
                                        durationMs: 200,
                                        animationIn: "ease-in-out",
                                        animationOut: "ease-in-out",
                                        overlayEnabled: false,
                                      };
                                      onTransitionClick(newTransition);
                                    }
                                  }}
                                  title={
                                    subscene.transitionToNext
                                      ? `${subscene.transitionToNext.type} (${subscene.transitionToNext.durationMs}ms)`
                                      : "Add transition"
                                  }
                                >
                                  {subscene.transitionToNext ? (
                                    <TransitionIcon />
                                  ) : (
                                    <Plus className="w-2 h-2" />
                                  )}
                                </Button>
                                <div className="flex-1 h-px bg-border/10" />
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Add subscene at end */}
                    {onSubsceneAdd && (
                      <div className="relative">
                        <div className="absolute left-2 top-2 w-2 h-px bg-border/20" />
                        <button
                          onClick={() => onSubsceneAdd(scene.id)}
                          className="ml-4 px-1.5 py-0.5 text-[9px] text-muted-foreground/40 hover:text-muted-foreground hover:bg-foreground/5 rounded-md flex items-center gap-0.5 transition-all"
                        >
                          <Plus className="w-2 h-2" />
                          <span>Add</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Transition Button between scenes */}
                {index < scenes.length - 1 && (
                  <div className="flex items-center justify-center py-0.5 mx-1.5">
                    <div className="flex-1 h-px bg-border/10" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-4 w-4 mx-0.5 rounded-md transition-all",
                        transitionToNext
                          ? "text-muted-foreground/50 hover:text-primary border-transparent"
                          : "text-muted-foreground/20 border-dashed border-border/20 hover:border-primary/30 hover:text-primary"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (transitionToNext) {
                          onTransitionClick(transitionToNext);
                        } else {
                          const newTransition: SceneTransition = {
                            id: `trans-${Date.now()}`,
                            fromSceneId: scene.id,
                            toSceneId: nextScene.id,
                            type: "cross_dissolve",
                            durationMs: 300,
                            animationIn: "ease-in-out",
                            animationOut: "ease-in-out",
                            overlayEnabled: false,
                          };
                          onTransitionClick(newTransition);
                        }
                      }}
                      title={
                        transitionToNext
                          ? `${transitionToNext.type} (${transitionToNext.durationMs}ms)`
                          : "Add transition"
                      }
                    >
                      {transitionToNext ? (
                        <TransitionIcon />
                      ) : (
                        <Plus className="w-2.5 h-2.5" />
                      )}
                    </Button>
                    <div className="flex-1 h-px bg-border/10" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scroll Down */}
        {showBottomScroll && (
          <button
            className="relative flex-shrink-0 w-full py-0.5 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
            onClick={() => scroll("down")}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        )}

        {/* Add Button - Compact */}
        <div className="relative flex-shrink-0 border-t border-border/10 dark:border-white/5 p-1.5 flex items-center justify-between gap-1">
          <ShortcutTooltip label="Add Scene" shortcut="addScene" side="left">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-6 text-[10px] gap-1 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
              onClick={onSceneAdd}
            >
              <Plus className="w-2.5 h-2.5" />
              Add
            </Button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Import Setup (OBS / Streamlabs)" side="top">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 h-6 text-[10px] px-2 gap-1 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
              onClick={importSetup}
              disabled={isImporting}
            >
              {isImporting ? (
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
              ) : (
                <DownloadCloud className="w-2.5 h-2.5" />
              )}
              Import
            </Button>
          </ShortcutTooltip>
        </div>
      </div>

      {/* Stream Style Selector Dialog */}
      <StreamStyleSelector
        isOpen={isStreamStyleSelectorOpen}
        onClose={() => setIsStreamStyleSelectorOpen(false)}
        onApplyStyle={(preset) => {
          onApplyStreamStyle?.(preset);
          setIsStreamStyleSelectorOpen(false);
        }}
      />
    </div>
  );
};
