import React from "react";
import { Undo2, Redo2, RotateCcw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useSceneStore } from "@/stores/scene.store";
import { useShallow } from "zustand/react/shallow";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";

interface SceneControlsProps {
    onUndo: () => void;
    onRedo: () => void;
    onResetScene: () => void;
}

export const SceneControls: React.FC<SceneControlsProps> = ({
    onUndo,
    onRedo,
    onResetScene,
}) => {
    const { canUndo, canRedo } = useSceneStore(
        useShallow((state) => ({
            canUndo: state.canUndo,
            canRedo: state.canRedo,
        }))
    );

    return (
        <div className="flex items-center gap-1" role="group" aria-label="Scene History Controls">
            <ShortcutTooltip label="Undo" shortcut="undo">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 disabled:opacity-30 transition-all duration-200"
                    onClick={onUndo}
                    disabled={!canUndo}
                    aria-label="Undo last action"
                    aria-disabled={!canUndo}
                >
                    <Undo2 className="w-3.5 h-3.5" />
                </Button>
            </ShortcutTooltip>
            
            <ShortcutTooltip label="Redo" shortcut="redo">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 disabled:opacity-30 transition-all duration-200"
                    onClick={onRedo}
                    disabled={!canRedo}
                    aria-label="Redo last action"
                    aria-disabled={!canRedo}
                >
                    <Redo2 className="w-3.5 h-3.5" />
                </Button>
            </ShortcutTooltip>

            <ShortcutTooltip label="Reset Scene" shortcut="resetScene">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-8 w-8 hover:bg-destructive/10 text-destructive hover:text-destructive transition-all duration-200"
                    onClick={onResetScene}
                    aria-label="Reset Scene to Default"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </Button>
            </ShortcutTooltip>
        </div>
    );
};
