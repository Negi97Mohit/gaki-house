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
        <div className="flex items-center gap-0.5" role="group" aria-label="Scene History Controls">
            <ShortcutTooltip label="Undo" shortcut="undo">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-background/60 disabled:opacity-30"
                    onClick={onUndo}
                    disabled={!canUndo}
                    aria-label="Undo last action"
                    aria-disabled={!canUndo}
                >
                    <Undo2 className="w-4 h-4" />
                </Button>
            </ShortcutTooltip>
            
            <ShortcutTooltip label="Redo" shortcut="redo">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-background/60 disabled:opacity-30"
                    onClick={onRedo}
                    disabled={!canRedo}
                    aria-label="Redo last action"
                    aria-disabled={!canRedo}
                >
                    <Redo2 className="w-4 h-4" />
                </Button>
            </ShortcutTooltip>

            <ShortcutTooltip label="Reset Scene" shortcut="resetScene">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-background/60 text-destructive hover:text-destructive"
                    onClick={onResetScene}
                    aria-label="Reset Scene to Default"
                >
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </ShortcutTooltip>
        </div>
    );
};
