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
        "fixed top-1/2 right-4 -translate-y-1/2",
        "transition-all duration-300 ease-in-out",
        effectivelyHidden
          ? "translate-x-full opacity-0 pointer-events-none"
          : "opacity-100"
      )}
      style={{ zIndex: "var(--z-scene-tabs)" }}
    >
      {/* Main Container */}
      <div className="bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-border/60 dark:border-border/40 rounded-lg w-52 max-h-[70vh] flex flex-col pointer-events-auto shadow-lg">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              Scenes
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="w-6 h-6 flex items-center justify-center text-primary hover:text-primary/80 rounded hover:bg-primary/10 transition-colors"
              onClick={() => setIsStreamStyleSelectorOpen(true)}
              title="Stream Styles"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded hover:bg-muted transition-colors"
              onClick={onHide}
              title="Hide Scenes"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll Up */}
        {showTopScroll && (
          <button
            className="flex-shrink-0 w-full py-1 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-b border-border/50"
            onClick={() => scroll("up")}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        )}

        {/* Scenes List */}
        <div
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1"
          style={{ scrollbarWidth: "thin" }}
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
                  <div className="h-0.5 bg-accent mx-2 rounded-full" />
                )}

                {/* Scene Tab */}
                <div
                  // NEW: Attach ref here
                  ref={(el) => (tabsRef.current[scene.id] = el)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, "scene", index)}
                  onDragOver={(e) => handleDragOver(e, "scene", index)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "group flex items-center h-9 px-2 mx-1 rounded-md cursor-pointer transition-all duration-150",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60",
                    isDragging && "opacity-40"
                  )}
                  onClick={(e) => {
                    if (editingId) return;
                    // Check if clicking on expand/collapse area
                    const target = e.target as HTMLElement;
                    if (target.closest("[data-expand-toggle]")) return;
                    onSceneSelect(scene.id);
                  }}
                  onDoubleClick={() => handleDoubleClick(scene.id, scene.name)}
                >
                  {/* Expand/Collapse or dot indicator */}
                  <div className="w-5 flex items-center justify-center flex-shrink-0">
                    {hasSubscenes ? (
                      <button
                        data-expand-toggle
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onToggleExpand?.(scene.id);
                        }}
                        className="hover:bg-background/30 rounded p-0.5 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          isActive
                            ? "bg-accent-foreground/60"
                            : "bg-muted-foreground/40"
                        )}
                      />
                    )}
                  </div>

                  {/* Drag Handle */}
                  <GripVertical
                    className={cn(
                      "w-3 h-3 mr-1 opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 cursor-grab"
                    )}
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
                      className="flex-1 bg-transparent border-b border-accent-foreground/50 outline-none text-xs min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      className={cn(
                        "flex-1 text-xs truncate min-w-0",
                        isActive ? "font-semibold" : "font-medium"
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
                        className={cn(
                          "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity",
                          isActive && "hover:bg-accent-foreground/20"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-36 z-[9999] bg-popover border border-border shadow-lg"
                    >
                      <DropdownMenuItem
                        onClick={() => handleDoubleClick(scene.id, scene.name)}
                      >
                        Rename
                      </DropdownMenuItem>
                      {onDuplicateScene && (
                        <DropdownMenuItem
                          onClick={() => onDuplicateScene(scene.id)}
                        >
                          <Copy className="w-3 h-3 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onSubsceneAdd && (
                        <DropdownMenuItem
                          onClick={() => onSubsceneAdd(scene.id)}
                        >
                          <GitBranch className="w-3 h-3 mr-2" />
                          Add Subscene
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {onResetScene && (
                        <DropdownMenuItem
                          onClick={() => onResetScene(scene.id)}
                        >
                          <RotateCcw className="w-3 h-3 mr-2" />
                          Reset to Default
                        </DropdownMenuItem>
                      )}
                      {scenes.length > 1 && (
                        <DropdownMenuItem
                          onClick={() => onSceneClose(scene.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <X className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Drop indicator after */}
                {isDropAfter && !hasSubscenes && (
                  <div className="h-0.5 bg-accent mx-2 rounded-full" />
                )}

                {/* Subscenes with git-tree visualization */}
                {hasSubscenes && isExpanded && (
                  <div className="ml-4 relative">
                    {/* Vertical git line */}
                    <div className="absolute left-2.5 top-0 bottom-2 w-px bg-border" />

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
                            <div className="absolute left-2.5 top-[14px] w-2.5 h-px bg-border" />

                            {/* Branch node */}
                            <div
                              className={cn(
                                "absolute left-[7px] top-[11px] w-2 h-2 rounded-full border-2",
                                isSubActive
                                  ? "bg-accent border-accent"
                                  : "bg-background border-muted-foreground/40"
                              )}
                            />

                            {/* Drop indicator before */}
                            {isSubDropBefore && (
                              <div className="h-0.5 bg-accent ml-5 mr-1 rounded-full" />
                            )}

                            <div
                              // NEW: Attach ref here for Subscene
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
                                "group flex items-center gap-1 h-7 px-2 ml-5 mr-1 rounded cursor-pointer transition-all",
                                isSubActive
                                  ? "bg-accent/80 text-accent-foreground"
                                  : "hover:bg-muted/40",
                                isSubDragging && "opacity-40"
                              )}
                              onClick={() =>
                                onSceneSelect(scene.id, subscene.id)
                              }
                              onDoubleClick={() =>
                                handleDoubleClick(subscene.id, subscene.name)
                              }
                            >
                              <GripVertical className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 flex-shrink-0 cursor-grab" />

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
                                  className="flex-1 bg-transparent border-b border-accent-foreground/50 text-[11px] outline-none min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span
                                  className={cn(
                                    "flex-1 text-[11px] truncate",
                                    isSubActive
                                      ? "font-medium"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {subscene.name}
                                </span>
                              )}

                              {onSubsceneClose && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSubsceneClose(scene.id, subscene.id);
                                  }}
                                >
                                  <X className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>

                            {/* Drop indicator after */}
                            {isSubDropAfter && (
                              <div className="h-0.5 bg-accent ml-5 mr-1 rounded-full" />
                            )}

                            {/* Transition between subscenes */}
                            {nextSubscene && (
                              <div className="flex items-center ml-7 py-0.5">
                                <div className="flex-1 h-px bg-border/20" />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-4 w-4 mx-0.5 transition-all",
                                    subscene.transitionToNext
                                      ? "text-muted-foreground hover:text-accent"
                                      : "text-muted-foreground/30 hover:text-accent"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (subscene.transitionToNext) {
                                      onTransitionClick(
                                        subscene.transitionToNext
                                      );
                                    } else {
                                      // Create default subscene transition
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
                                    <Plus className="w-2.5 h-2.5" />
                                  )}
                                </Button>
                                <div className="flex-1 h-px bg-border/20" />
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Add subscene at end */}
                    {onSubsceneAdd && (
                      <div className="relative">
                        <div className="absolute left-2.5 top-2 w-2.5 h-px bg-border/50" />
                        <button
                          onClick={() => onSubsceneAdd(scene.id)}
                          className="ml-5 mr-1 px-2 py-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/30 rounded flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Transition Button between scenes */}
                {index < scenes.length - 1 && (
                  <div className="flex items-center justify-center py-1 mx-2">
                    <div className="flex-1 h-px bg-border/30" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-5 w-5 mx-1 border transition-all",
                        transitionToNext
                          ? "text-muted-foreground hover:text-accent border-transparent hover:border-accent/30"
                          : "text-muted-foreground/30 border-dashed border-border/50 hover:border-accent/50 hover:text-accent"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (transitionToNext) {
                          onTransitionClick(transitionToNext);
                        } else {
                          // Create default transition
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
                        <Plus className="w-3 h-3" />
                      )}
                    </Button>
                    <div className="flex-1 h-px bg-border/30" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Scroll Down */}
        {showBottomScroll && (
          <button
            className="flex-shrink-0 w-full py-1 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors border-t border-border/50"
            onClick={() => scroll("down")}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Add Button */}
        <div className="flex-shrink-0 border-t border-border p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs gap-1.5"
            onClick={onSceneAdd}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Scene
          </Button>
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
