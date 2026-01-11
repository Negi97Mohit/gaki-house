import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AICommandPopover } from "@/features/ai-assistant/ui/AICommandPopover";
import { useSceneStore } from "@/stores/scene.store";
import { useShallow } from "zustand/react/shallow";
import { useUiStore } from "@/stores/ui.store";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";

interface AIControlsProps {
    onAiCommandSubmit: (text: string, targetId: string | null) => void;
    isAiProcessing: boolean;
    hasAiPopoverAutoOpenedRef: React.RefObject<boolean>;
    portalContainer?: HTMLElement | null;
}

export const AIControls: React.FC<AIControlsProps> = ({
    onAiCommandSubmit,
    isAiProcessing,
    hasAiPopoverAutoOpenedRef,
    portalContainer,
}) => {
    const {
        activeOverlays,
        isAiModeEnabled, setAiModeEnabled,
        captionsEnabled, setCaptionsEnabled,
    } = useSceneStore(useShallow(state => ({
        activeOverlays: state.activeOverlays,
        isAiModeEnabled: state.isAiModeEnabled,
        setAiModeEnabled: state.setAiModeEnabled,
        captionsEnabled: state.captionsEnabled,
        setCaptionsEnabled: state.setCaptionsEnabled,
    })));

    const isFullscreen = useUiStore(s => s.isFullscreen);

    return (
        <AICommandPopover
            onSubmit={onAiCommandSubmit}
            isProcessing={isAiProcessing}
            activeOverlays={activeOverlays}
            isFullscreen={isFullscreen}
            isAiModeEnabled={isAiModeEnabled}
            onAiModeToggle={setAiModeEnabled}
            captionsEnabled={captionsEnabled}
            onCaptionsToggle={setCaptionsEnabled}
            portalContainer={portalContainer}
            hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
        >
            <ShortcutTooltip label="AI Assistant" shortcut="aiAssistant">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-background/60 text-yellow-500 hover:text-yellow-600"
                    aria-label="Open AI Assistant"
                >
                    <Sparkles className="w-4 h-4" />
                </Button>
            </ShortcutTooltip>
        </AICommandPopover>
    );
};
