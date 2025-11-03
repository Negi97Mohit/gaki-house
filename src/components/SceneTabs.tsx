// src/components/SceneTabs.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { SceneState, SceneTransition } from "@/types/caption";
import { cn } from "@/lib/utils";

// SVG icon for the transition button
const TransitionIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.25 3.625h.913c.487 0 .937.258 1.184.677l1.767 3c.253.43.253.965 0 1.396l-1.767 3c-.247.42-.697.677-1.184.677H4.25c-.76 0-1.375-.616-1.375-1.375V5c0-.76.616-1.375 1.375-1.375Z"
      stroke="currentColor"
      strokeWidth="1.25"
    ></path>
    <path
      d="m11.35 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".3"
      strokeWidth="1.25"
      strokeLinecap="round"
    ></path>
    <path
      d="m8.75 3.755 1.861 3.251a2 2 0 0 1 0 1.988l-1.861 3.25"
      stroke="currentColor"
      strokeOpacity=".6"
      strokeWidth="1.25"
      strokeLinecap="round"
    ></path>
  </svg>
);

interface SceneTabsProps {
  scenes: SceneState[];
  activeSceneId: string;
  transitions: SceneTransition[];
  onSceneSelect: (id: string) => void;
  onSceneAdd: () => void;
  onTransitionClick: (transition: SceneTransition) => void;
  onSceneClose: (id: string) => void;
  onSceneReorder: (fromIndex: number, toIndex: number) => void;
  onSceneRename: (id: string, newName: string) => void;
}

export const SceneTabs: React.FC<SceneTabsProps> = ({
  scenes,
  activeSceneId,
  transitions,
  onSceneSelect,
  onSceneAdd,
  onTransitionClick,
  onSceneClose,
  onSceneReorder,
  onSceneRename,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredTransitionIndex, setHoveredTransitionIndex] = useState<
    number | null
  >(null);
  const [showTopScroll, setShowTopScroll] = useState(false);
  const [showBottomScroll, setShowBottomScroll] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const transitionButtonRefs = useRef<Map<string, HTMLButtonElement>>(
    new Map()
  );

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Check scroll position
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
      const scrollAmount = 100;
      scrollContainerRef.current.scrollBy({
        top: direction === "up" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    onSceneReorder(draggedIndex, index);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDoubleClick = (scene: SceneState) => {
    setEditingId(scene.id);
    setEditingName(scene.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (editingId && editingName.trim()) {
      onSceneRename(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditingName("");
    }
  };

  return (
    <>
      <style>{`
        @keyframes cybr-glitch {
          0% {
            clip-path: polygon(0 2%, 100% 2%, 100% 95%, 95% 95%, 95% 90%, 85% 90%, 85% 95%, 8% 95%, 0 70%);
          }
          2%, 8% {
            clip-path: polygon(0 78%, 100% 78%, 100% 100%, 95% 100%, 95% 90%, 85% 90%, 85% 100%, 8% 100%, 0 78%);
            transform: translate(-2%, 0);
          }
          6% {
            clip-path: polygon(0 78%, 100% 78%, 100% 100%, 95% 100%, 95% 90%, 85% 90%, 85% 100%, 8% 100%, 0 78%);
            transform: translate(2%, 0);
          }
          9% {
            clip-path: polygon(0 78%, 100% 78%, 100% 100%, 95% 100%, 95% 90%, 85% 90%, 85% 100%, 8% 100%, 0 78%);
            transform: translate(0, 0);
          }
          10% {
            clip-path: polygon(0 44%, 100% 44%, 100% 54%, 95% 54%, 95% 54%, 85% 54%, 85% 54%, 8% 54%, 0 54%);
            transform: translate(2%, 0);
          }
          13% {
            clip-path: polygon(0 44%, 100% 44%, 100% 54%, 95% 54%, 95% 54%, 85% 54%, 85% 54%, 8% 54%, 0 54%);
            transform: translate(0, 0);
          }
          14%, 21% {
            clip-path: polygon(0 0, 100% 0, 100% 0, 95% 0, 95% 0, 85% 0, 85% 0, 8% 0, 0 0);
            transform: translate(2%, 0);
          }
          31%, 61%, 100% {
            clip-path: polygon(0 0, 100% 0, 100% 0, 95% 0, 95% 0, 85% 0, 85% 0, 8% 0, 0 0);
          }
        }

        .cybr-scene-tab {
          position: relative;
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
        }

        .cybr-scene-tab::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: hsl(60, 100%, 50%);
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
          z-index: -1;
        }

        .cybr-scene-tab::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          background: hsl(var(--background));
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
          z-index: -1;
        }

        .cybr-scene-tab.active::after {
          background: transparent;
        }

        .cybr-scene-tab:hover .cybr-glitch-layer {
          display: block;
        }

        .cybr-glitch-layer {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: hsl(60, 100%, 50%);
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
          animation: cybr-glitch 2s infinite;
          display: none;
          pointer-events: none;
          z-index: 1;
        }

        .cybr-glitch-layer::before {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          right: 3px;
          bottom: 3px;
          background: hsl(var(--background));
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
          z-index: -1;
        }

        .cybr-container {
          background: hsl(var(--background));
          border: 2px solid hsl(60, 100%, 50%);
          clip-path: polygon(
            0 8px, 8px 0, 
            calc(100% - 8px) 0, 100% 8px,
            100% calc(100% - 8px), calc(100% - 8px) 100%,
            8px 100%, 0 calc(100% - 8px)
          );
        }

        .cybr-add-btn {
          background: transparent;
          border: 2px solid hsl(60, 100%, 50%);
          color: hsl(60, 100%, 50%);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);
          transition: all 0.2s;
        }

        .cybr-add-btn:hover {
          background: hsl(60, 100%, 50%);
          color: hsl(var(--background));
          box-shadow: 0 0 20px hsl(60, 100%, 50%);
        }

        .cybr-scroll-btn {
          background: transparent;
          border: 1px solid hsl(60, 100%, 50%, 0.3);
          color: hsl(60, 100%, 50%);
          transition: all 0.2s;
        }

        .cybr-scroll-btn:hover {
          background: hsl(60, 100%, 50%, 0.1);
          border-color: hsl(60, 100%, 50%);
        }

        .cybr-transition-btn {
          color: hsl(60, 100%, 50%) !important;
          background: hsl(60, 100%, 20%) !important;
          border: 1px solid hsl(60, 100%, 50%) !important;
          transition: all 0.2s;
        }

        .cybr-transition-btn:hover {
          transform: scale(1.2);
          filter: drop-shadow(0 0 8px hsl(60, 100%, 50%));
          background: hsl(60, 100%, 30%) !important;
        }

        @media (prefers-color-scheme: light) {
          .cybr-transition-btn {
            background: hsl(60, 100%, 85%) !important;
            color: hsl(60, 100%, 25%) !important;
            border: 2px solid hsl(60, 100%, 40%) !important;
          }
          
          .cybr-transition-btn:hover {
            background: hsl(60, 100%, 75%) !important;
            filter: drop-shadow(0 0 8px hsl(60, 100%, 40%));
          }
          /* --- ADDED: Light mode background overrides --- */
          .cybr-container,
          .cybr-glitch-layer::before {
            background: hsl(50, 70%, 85%); /* Tinted Yellow */
          }

          .cybr-scene-tab::after {
            background: hsl(50, 70%, 90%); /* Lighter Tinted Yellow for inactive tabs */
          }

          .cybr-scene-tab.active::after {
            background: transparent; /* Keep active tab transparent */
          }            
        }
      `}</style>

      <div
        className="fixed top-1/2 right-6 -translate-y-1/2 flex items-center justify-center pointer-events-none"
        style={{ zIndex: "var(--z-scene-tabs)" }}
      >
        {/* Island Container */}
        <div className="cybr-container px-3 py-4 flex flex-col items-center gap-2 max-h-[70vh] w-56 pointer-events-auto shadow-[0_0_30px_rgba(255,235,59,0.2)]">
          {/* Top Scroll Button */}
          {showTopScroll && (
            <button
              className="cybr-scroll-btn h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0"
              onClick={() => scroll("up")}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable Tabs Container */}
          <div
            ref={scrollContainerRef}
            className="flex flex-col items-center gap-1 overflow-y-auto overflow-x-hidden scrollbar-hide max-h-[calc(70vh-120px)] w-full scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {scenes.map((scene, index) => {
              const isActive = scene.id === activeSceneId;
              const isDragging = draggedIndex === index;
              const isDraggedOver = dragOverIndex === index;
              const transition =
                index < scenes.length - 1
                  ? transitions.find((t) => t.fromSceneId === scene.id)
                  : null;

              return (
                <React.Fragment key={scene.id}>
                  {/* Scene Tab */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "cybr-scene-tab relative flex items-center h-12 w-full px-4 cursor-pointer group transition-all duration-200 flex-shrink-0",
                      isActive && "active",
                      isDragging && "opacity-40",
                      isDraggedOver && "mt-2"
                    )}
                    onClick={() => !editingId && onSceneSelect(scene.id)}
                    onDoubleClick={() => handleDoubleClick(scene)}
                  >
                    <div className="cybr-glitch-layer" />

                    {/* Drag Handle */}
                    <GripVertical
                      className={cn(
                        "w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 relative z-10",
                        isActive ? "text-black" : "text-yellow-500/50"
                      )}
                    />

                    {/* Tab Name or Input */}
                    {editingId === scene.id ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editingName}
                        onChange={handleNameChange}
                        onBlur={handleNameSubmit}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-transparent border-b border-yellow-500 outline-none text-sm min-w-0 transition-colors text-yellow-500 font-bold uppercase tracking-wider relative z-10"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className={cn(
                          "flex-1 text-sm truncate min-w-0 transition-colors duration-200 font-bold uppercase tracking-wider relative z-10",
                          isActive
                            ? "text-black"
                            : "text-yellow-500 group-hover:text-yellow-400"
                        )}
                      >
                        {scene.name}
                        {isActive && <span className="animate-pulse">_</span>}
                      </span>
                    )}

                    {/* Close Button */}
                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSceneClose(scene.id);
                        }}
                        className={cn(
                          "ml-2 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 relative z-10",
                          "opacity-0 group-hover:opacity-100",
                          isActive
                            ? "text-black hover:text-red-600"
                            : "text-yellow-500 hover:text-red-500"
                        )}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Transition Button */}
                  {transition && index < scenes.length - 1 && (
                    <div
                      className="relative flex items-center justify-center flex-shrink-0 py-1 w-full"
                      onMouseEnter={() => setHoveredTransitionIndex(index)}
                      onMouseLeave={() => setHoveredTransitionIndex(null)}
                    >
                      <Button
                        ref={(el) => {
                          if (el && transition) {
                            transitionButtonRefs.current.set(transition.id, el);
                          }
                        }}
                        variant="ghost"
                        size="icon"
                        className="cybr-transition-btn h-7 w-7 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransitionClick(transition);
                        }}
                        title={`Transition: ${transition.type}`}
                      >
                        <TransitionIcon />
                      </Button>

                      {/* Duration Indicator */}
                      {transition.type !== "none" &&
                        hoveredTransitionIndex === index && (
                          <div className="absolute -left-2 top-1/2 -translate-x-full -translate-y-1/2 text-[10px] font-mono text-yellow-500 bg-background border border-yellow-500/40 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(255,235,59,0.3)] whitespace-nowrap animate-fade-in">
                            {transition.durationMs}ms
                          </div>
                        )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Bottom Scroll Button */}
          {showBottomScroll && (
            <button
              className="cybr-scroll-btn h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0"
              onClick={() => scroll("down")}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {/* Divider */}
          <div className="w-full h-[2px] bg-yellow-500/30 flex-shrink-0 my-1" />

          {/* Add New Tab Button */}
          <button
            className="cybr-add-btn h-10 w-full rounded-md transition-colors flex-shrink-0 flex items-center justify-center gap-2 text-xs"
            onClick={onSceneAdd}
            title="Add new scene"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scene</span>
          </button>
        </div>
      </div>
    </>
  );
};
