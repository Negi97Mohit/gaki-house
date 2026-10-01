import React, { useEffect } from "react";
import { Undo2, Redo2 } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { useSceneStore } from "@/stores/scene.store";
import { useShallow } from "zustand/react/shallow";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";
import { OBSImportButton } from "./OBSImportButton";
import { SceneState } from "@gaki/core/types/caption";

export interface SceneControlsProps {
    onUndo: () => void;
    onRedo: () => void;
    onResetScene: () => void;
    onAutoSwitchToggle?: (enabled: boolean) => void;
    isAutoSwitching?: boolean;
    onImportOBSScenes?: (scenes: SceneState[], stingerConfig?: { path: string; transitionPoint: number }) => void;
    onClearAllScenes?: () => void;
}

export const SceneControls: React.FC<SceneControlsProps> = ({
    onUndo,
    onRedo,
    onResetScene,
    onImportOBSScenes,
}) => {
    useEffect(() => {
    }, []);
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
                    className="rounded-xl h-8 w-8 text-white/75 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:hover:bg-transparent transition-all duration-150"
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
                    className="rounded-xl h-8 w-8 text-white/75 hover:text-white hover:bg-white/[0.08] disabled:opacity-25 disabled:hover:bg-transparent transition-all duration-150"
                    onClick={onRedo}
                    disabled={!canRedo}
                    aria-label="Redo last action"
                    aria-disabled={!canRedo}
                >
                    <Redo2 className="w-3.5 h-3.5" />
                </Button>
            </ShortcutTooltip>

            {onImportOBSScenes && (
              <OBSImportButton onImportOBSScenes={onImportOBSScenes} />
            )}
        </div>
    );
};
