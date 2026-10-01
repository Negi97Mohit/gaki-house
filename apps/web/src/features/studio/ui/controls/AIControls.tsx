import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { AICommandPopover } from "@/features/ai-assistant/ui/AICommandPopover";
import { useSceneStore } from "@/stores/scene.store";
import { useShallow } from "zustand/react/shallow";
import { useUiStore } from "@/stores/ui.store";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";
import { AIChatbot } from "@/features/ai-assistant/ui/AIChatbot";
import { cn } from "@gaki/core/lib/utils";

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

    const { isFullscreen, isChatbotOpen, setChatbotOpen } = useUiStore(useShallow(s => ({
        isFullscreen: s.isFullscreen,
        isChatbotOpen: s.isChatbotOpen,
        setChatbotOpen: s.setChatbotOpen
    })));

    const handleAIClick = () => {
        setChatbotOpen(prev => !prev);
    };

    return (
        <>
            <ShortcutTooltip label="AI Assistant" shortcut="aiAssistant">
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "group relative rounded-xl h-8 w-8 text-white/70 hover:text-white border border-transparent hover:border-white/15 hover:bg-white/[0.04] active:scale-95 transition-all duration-150 flex items-center justify-center",
                        isChatbotOpen &&
                          "border-white/30 text-white after:absolute after:bottom-1 after:left-2 after:right-2 after:h-[1.5px] after:bg-white after:rounded-full after:shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                    )}
                    aria-label="Open AI Assistant"
                    onClick={handleAIClick}
                >
                    <Sparkles className="w-3.5 h-3.5 text-white/80 group-hover:text-white" />
                </Button>
            </ShortcutTooltip>
            
            <AIChatbot 
                isOpen={isChatbotOpen} 
                onClose={() => setChatbotOpen(false)} 
            />
        </>
    );
};
