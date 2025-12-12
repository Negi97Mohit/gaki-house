import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  GitBranch,
  GitMerge,
  MoreHorizontal,
  Copy,
} from "lucide-react";
import { SceneState, SceneTransition, SubSceneState } from "@/types/caption";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TransitionIcon = () => (
  <svg
    width="12"
    height="12"
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

interface SceneTreeViewProps {
  scenes: SceneState[];
  activeSceneId: string;
  activeSubsceneId?: string;
  transitions: SceneTransition[];
  onSceneSelect: (id: string, subsceneId?: string) => void;
  onSceneAdd: () => void;
  onSubsceneAdd: (parentId: string) => void;
  onTransitionClick: (transition: SceneTransition) => void;
  onSceneClose: (id: string) => void;
  onSubsceneClose: (parentId: string, subsceneId: string) => void;
  onSceneReorder: (fromIndex: number, toIndex: number) => void;
  onSubsceneReorder: (parentId: string, fromIndex: number, toIndex: number) => void;
  onSceneRename: (id: string, newName: string) => void;
  onSubsceneRename: (parentId: string, subsceneId: string, newName: string) => void;
  onToggleExpand: (sceneId: string) => void;
  onDuplicateScene: (sceneId: string) => void;
}

export const SceneTreeView: React.FC<SceneTreeViewProps> = ({
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
}) => {
  const [dragState, setDragState] = useState<{
    type: 'scene' | 'subscene';
    index: number;
    parentId?: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    type: 'scene' | 'subscene';
    index: number;
    parentId?: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = useCallback((
    e: React.DragEvent,
    type: 'scene' | 'subscene',
    index: number,
    parentId?: string
  ) => {
    setDragState({ type, index, parentId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  }, []);

  const handleDragOver = useCallback((
    e: React.DragEvent,
    type: 'scene' | 'subscene',
    index: number,
    parentId?: string
  ) => {
    e.preventDefault();
    if (!dragState) return;
    
    // Only allow same-type drops (scene to scene, subscene to subscene within same parent)
    if (dragState.type !== type) return;
    if (type === 'subscene' && dragState.parentId !== parentId) return;
    
    setDropTarget({ type, index, parentId });
  }, [dragState]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dragState || !dropTarget) return;
    
    if (dragState.type === 'scene' && dropTarget.type === 'scene') {
      if (dragState.index !== dropTarget.index) {
        onSceneReorder(dragState.index, dropTarget.index);
      }
    } else if (
      dragState.type === 'subscene' && 
      dropTarget.type === 'subscene' &&
      dragState.parentId === dropTarget.parentId
    ) {
      if (dragState.index !== dropTarget.index) {
        onSubsceneReorder(dragState.parentId!, dragState.index, dropTarget.index);
      }
    }
    
    setDragState(null);
    setDropTarget(null);
  }, [dragState, dropTarget, onSceneReorder, onSubsceneReorder]);

  const handleDragEnd = useCallback(() => {
    setDragState(null);
    setDropTarget(null);
  }, []);

  const startEditing = useCallback((id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const finishEditing = useCallback((sceneId: string, subsceneId?: string) => {
    if (editingName.trim()) {
      if (subsceneId) {
        onSubsceneRename(sceneId, subsceneId, editingName.trim());
      } else {
        onSceneRename(sceneId, editingName.trim());
      }
    }
    setEditingId(null);
    setEditingName("");
  }, [editingName, onSceneRename, onSubsceneRename]);

  const getTransitionBetweenScenes = (fromSceneId: string, toSceneId: string) => {
    return transitions.find(
      t => (t.fromSceneId === fromSceneId && t.toSceneId === toSceneId) ||
           (t.fromSceneId === toSceneId && t.toSceneId === fromSceneId)
    );
  };

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm">
      {/* Scene list with git-tree visualization */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {scenes.map((scene, sceneIndex) => {
          const isActive = scene.id === activeSceneId && !activeSubsceneId;
          const hasSubscenes = scene.subscenes && scene.subscenes.length > 0;
          const isExpanded = scene.isExpanded ?? true;
          const isDragging = dragState?.type === 'scene' && dragState.index === sceneIndex;
          const isDropTarget = dropTarget?.type === 'scene' && dropTarget.index === sceneIndex;
          
          // Get transition to next scene
          const nextScene = scenes[sceneIndex + 1];
          const transitionToNext = nextScene ? getTransitionBetweenScenes(scene.id, nextScene.id) : null;

          return (
            <div key={scene.id} className="relative">
              {/* Main Scene Row */}
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, 'scene', sceneIndex)}
                onDragOver={(e) => handleDragOver(e, 'scene', sceneIndex)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded-md cursor-pointer transition-all",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-muted/50",
                  isDragging && "opacity-50",
                  isDropTarget && "ring-2 ring-accent ring-offset-1"
                )}
                onClick={() => onSceneSelect(scene.id)}
              >
                {/* Git tree line indicator */}
                <div className="w-4 flex items-center justify-center flex-shrink-0">
                  {hasSubscenes ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(scene.id);
                      }}
                      className="hover:bg-muted rounded p-0.5"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                    </button>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>

                {/* Drag Handle */}
                <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-50 flex-shrink-0 cursor-grab" />

                {/* Scene Name */}
                {editingId === scene.id ? (
                  <input
                    ref={inputRef}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => finishEditing(scene.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") finishEditing(scene.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 bg-transparent border-b border-accent text-xs outline-none min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span 
                    className="flex-1 text-xs font-medium truncate"
                    onDoubleClick={() => startEditing(scene.id, scene.name)}
                  >
                    {scene.name}
                  </span>
                )}

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => startEditing(scene.id, scene.name)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicateScene(scene.id)}>
                      <Copy className="w-3 h-3 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSubsceneAdd(scene.id)}>
                      <GitBranch className="w-3 h-3 mr-2" />
                      Add Subscene
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {scenes.length > 1 && (
                      <DropdownMenuItem 
                        onClick={() => onSceneClose(scene.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Subscenes (Git Tree Branch Visualization) */}
              {hasSubscenes && isExpanded && (
                <div className="ml-3 relative">
                  {/* Vertical git line */}
                  <div className="absolute left-3 top-0 bottom-2 w-px bg-muted-foreground/20" />
                  
                  {scene.subscenes!.sort((a, b) => a.order - b.order).map((subscene, subIndex) => {
                    const isSubActive = scene.id === activeSceneId && subscene.id === activeSubsceneId;
                    const isSubDragging = 
                      dragState?.type === 'subscene' && 
                      dragState.parentId === scene.id && 
                      dragState.index === subIndex;
                    const isSubDropTarget = 
                      dropTarget?.type === 'subscene' && 
                      dropTarget.parentId === scene.id && 
                      dropTarget.index === subIndex;
                    const nextSubscene = scene.subscenes![subIndex + 1];
                    
                    return (
                      <div key={subscene.id} className="relative">
                        {/* Horizontal branch line */}
                        <div className="absolute left-3 top-3 w-3 h-px bg-muted-foreground/20" />
                        
                        {/* Branch node */}
                        <div className="absolute left-[11px] top-[9px] w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                        
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'subscene', subIndex, scene.id)}
                          onDragOver={(e) => handleDragOver(e, 'subscene', subIndex, scene.id)}
                          onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "group flex items-center gap-1.5 px-2 py-1 ml-5 mr-1 rounded cursor-pointer transition-all",
                            isSubActive
                              ? "bg-accent/80 text-accent-foreground"
                              : "hover:bg-muted/30",
                            isSubDragging && "opacity-50",
                            isSubDropTarget && "ring-1 ring-accent"
                          )}
                          onClick={() => onSceneSelect(scene.id, subscene.id)}
                        >
                          <GripVertical className="w-2.5 h-2.5 opacity-0 group-hover:opacity-50 flex-shrink-0 cursor-grab" />
                          
                          {editingId === subscene.id ? (
                            <input
                              ref={inputRef}
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={() => finishEditing(scene.id, subscene.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") finishEditing(scene.id, subscene.id);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                              className="flex-1 bg-transparent border-b border-accent text-[11px] outline-none min-w-0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span
                              className="flex-1 text-[11px] truncate text-muted-foreground"
                              onDoubleClick={() => startEditing(subscene.id, subscene.name)}
                            >
                              {subscene.name}
                            </span>
                          )}

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
                        </div>

                        {/* Transition between subscenes */}
                        {nextSubscene && subscene.transitionToNext && (
                          <div className="flex items-center justify-center ml-8 py-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 text-muted-foreground hover:text-accent"
                              onClick={() => onTransitionClick(subscene.transitionToNext!)}
                              title={`Transition: ${subscene.transitionToNext.type}`}
                            >
                              <TransitionIcon />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Add subscene button at end of branch */}
                  <div className="relative">
                    <div className="absolute left-3 top-2 w-3 h-px bg-muted-foreground/10" />
                    <button
                      onClick={() => onSubsceneAdd(scene.id)}
                      className="ml-5 mr-1 px-2 py-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/20 rounded flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Add subscene</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Transition button between scenes */}
              {transitionToNext && sceneIndex < scenes.length - 1 && (
                <div className="flex items-center justify-center py-1 mx-1">
                  <div className="flex-1 h-px bg-muted-foreground/10" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 mx-1 text-muted-foreground hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTransitionClick(transitionToNext);
                    }}
                    title={`Transition: ${transitionToNext.type} (${transitionToNext.durationMs}ms)`}
                  >
                    <TransitionIcon />
                  </Button>
                  <div className="flex-1 h-px bg-muted-foreground/10" />
                </div>
              )}
              
              {/* Visual connector when no transition defined */}
              {!transitionToNext && sceneIndex < scenes.length - 1 && (
                <div className="flex items-center justify-center py-1 mx-1">
                  <div className="flex-1 h-px bg-muted-foreground/10" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 mx-1 text-muted-foreground/30 hover:text-accent hover:bg-accent/10 border border-dashed border-muted-foreground/20 hover:border-accent/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Create new transition
                      const defaultTransition: SceneTransition = {
                        id: `trans-${Date.now()}`,
                        fromSceneId: scene.id,
                        toSceneId: nextScene.id,
                        type: 'dissolve',
                        durationMs: 300,
                        animationIn: 'ease-in-out',
                        animationOut: 'ease-in-out',
                        overlayEnabled: false,
                      };
                      onTransitionClick(defaultTransition);
                    }}
                    title="Add transition"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <div className="flex-1 h-px bg-muted-foreground/10" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Scene Button */}
      <div className="border-t border-border p-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSceneAdd}
          className="w-full text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Scene
        </Button>
      </div>
    </div>
  );
};
