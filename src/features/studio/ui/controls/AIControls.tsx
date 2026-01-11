import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AICommandPopover } from "@/features/ai-assistant/ui/AICommandPopover";
import { useSceneStore } from "@/stores/scene.store";
import { useShallow } from "zustand/react/shallow";
import { useUiStore } from "@/stores/ui.store";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";
import { AIChatbot } from "@/features/ai-assistant/ui/AIChatbot";
import { cn } from "@/shared/lib/utils";

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
                        "rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200",
                        isChatbotOpen && "bg-primary/15 text-primary"
                    )}
                    aria-label="Open AI Assistant"
                    onClick={handleAIClick}
                >
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                </Button>
            </ShortcutTooltip>
            
            <AIChatbot 
                isOpen={isChatbotOpen} 
                onClose={() => setChatbotOpen(false)} 
            />
        </>
    );
};
