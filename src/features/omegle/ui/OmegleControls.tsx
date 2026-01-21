import React, { useState, useEffect, useRef } from 'react';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';
import { getOmegleDesignNames } from '@/data/omegleDesigns';
import { omegleThemes } from '@/data/omegleThemes';
import { chatThemes } from '@/data/chatThemes';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    SkipForward,
    X,
    Layout,
    MessageSquare,
    Sparkles,
    Sun,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
} from '@/shared/ui/dropdown-menu';
import { ScrollArea } from '@/shared/ui/scroll-area';

interface OmegleControlsProps {
    design: OmegleDesign;
    onFindStranger: () => void;
    onNext: () => void;
    onStop: () => void;
}

export const OmegleControls: React.FC<OmegleControlsProps> = ({
    design,
    onFindStranger,
    onNext,
    onStop,
}) => {
    const {
        connection,
        isCameraEnabled,
        isMicEnabled,
        toggleCamera,
        toggleMic,
        selectedDesign,
        setSelectedDesign,
        selectedChatTheme,
        setChatTheme,
        selectedOmegleTheme,
        setOmegleTheme,
    } = useOmegleStore();

    const [isVisible, setIsVisible] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);
    const hideTimerRef = useRef<NodeJS.Timeout>();
    const { controls } = design.layout;
    const designs = getOmegleDesignNames();

    const isConnected = connection.matchStatus === 'connected';
    const isSearching = connection.matchStatus === 'searching';

    useEffect(() => {
        return () => clearHideTimer();
    }, []);

    useEffect(() => {
        if (hasStarted) {
            resetHideTimer();
        }
    }, [hasStarted]);

    const clearHideTimer = () => {
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
        }
    };

    const resetHideTimer = () => {
        clearHideTimer();
        setIsVisible(true);

        if (hasStarted && controls.autoHide !== false) {
            hideTimerRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        }
    };

    const handleFindStranger = () => {
        setHasStarted(true);
        onFindStranger();
    };

    // Shared button styles for chic minimalist look
    const controlButtonBase = cn(
        "h-10 w-10 rounded-full backdrop-blur-xl transition-all duration-300",
        "border border-white/[0.08] shadow-lg shadow-black/20",
        "hover:scale-105 hover:shadow-xl hover:shadow-black/30",
        "active:scale-95 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0"
    );

    const glassButton = cn(
        controlButtonBase,
        "bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white"
    );

    const dangerButton = cn(
        controlButtonBase,
        "bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border-red-500/20"
    );

    const offButton = cn(
        controlButtonBase,
        "bg-red-500/30 text-red-300 border-red-500/30 hover:bg-red-500/40"
    );

    return (
        <div
            className="fixed top-1/2 right-4 -translate-y-1/2 z-[100]"
            onMouseEnter={() => {
                clearHideTimer();
                setIsVisible(true);
            }}
            onMouseLeave={() => {
                if (hasStarted) {
                    resetHideTimer();
                }
            }}
        >
            {/* Single Vertical Island */}
            <div className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-2xl",
                "bg-black/40 backdrop-blur-2xl border border-white/[0.08]",
                "shadow-2xl shadow-black/40 transition-all duration-500 ease-out",
                !isVisible && hasStarted && 'opacity-0 translate-x-4 pointer-events-none'
            )}>
                {/* Find Stranger Button (only when idle) */}
                {connection.matchStatus === 'idle' && (
                    <Button
                        onClick={handleFindStranger}
                        className={cn(
                            "h-10 w-10 rounded-full font-medium",
                            "bg-emerald-500/90 hover:bg-emerald-400 text-white",
                            "border border-emerald-400/30 backdrop-blur-xl",
                            "shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40",
                            "transition-all duration-300 hover:scale-105 active:scale-95"
                        )}
                        title="Find Stranger"
                    >
                        <Sparkles className="w-4 h-4" />
                    </Button>
                )}

                {/* Next Button (when connected) */}
                {isConnected && (
                    <Button
                        onClick={onNext}
                        className={cn(
                            "h-10 w-10 rounded-full font-medium",
                            "bg-amber-500/90 hover:bg-amber-400 text-white",
                            "border border-amber-400/30 backdrop-blur-xl",
                            "shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40",
                            "transition-all duration-300 hover:scale-105 active:scale-95"
                        )}
                        title="Next Stranger"
                    >
                        <SkipForward className="w-4 h-4" />
                    </Button>
                )}

                {/* Divider */}
                <div className="w-6 h-px bg-white/10" />

                {/* Camera Toggle */}
                <Button
                    onClick={toggleCamera}
                    size="icon"
                    variant="ghost"
                    className={isCameraEnabled ? glassButton : offButton}
                    disabled={isSearching}
                    title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                >
                    {isCameraEnabled ? (
                        <Video className="w-4 h-4" />
                    ) : (
                        <VideoOff className="w-4 h-4" />
                    )}
                </Button>

                {/* Mic Toggle */}
                <Button
                    onClick={toggleMic}
                    size="icon"
                    variant="ghost"
                    className={isMicEnabled ? glassButton : offButton}
                    disabled={isSearching}
                    title={isMicEnabled ? 'Mute mic' : 'Unmute mic'}
                >
                    {isMicEnabled ? (
                        <Mic className="w-4 h-4" />
                    ) : (
                        <MicOff className="w-4 h-4" />
                    )}
                </Button>

                {/* Divider */}
                <div className="w-6 h-px bg-white/10" />

                {/* Global Theme Picker */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={glassButton}
                            title="Change Theme"
                        >
                            <Sun className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        side="left"
                        align="center"
                        className="w-56 bg-black/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl z-[200]"
                    >
                        <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider font-normal px-3 py-2">
                            Theme
                        </DropdownMenuLabel>
                        <ScrollArea className="h-64">
                            <div className="px-1">
                                {omegleThemes.map((t) => (
                                    <DropdownMenuItem
                                        key={t.id}
                                        onClick={() => setOmegleTheme(t.id)}
                                        className={cn(
                                            'cursor-pointer rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors px-3 py-2 mx-1',
                                            selectedOmegleTheme === t.id && 'bg-white/15 text-white'
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-4 h-4 rounded-full border border-white/20"
                                                style={{ background: t.colors.primary }}
                                            />
                                            <span>{t.name}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Layout Design Picker */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={glassButton}
                            title="Change Layout"
                        >
                            <Layout className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        side="left"
                        align="center"
                        className="w-56 bg-black/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl z-[200]"
                    >
                        <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider font-normal px-3 py-2">
                            Layout
                        </DropdownMenuLabel>
                        <ScrollArea className="h-64">
                            <div className="px-1">
                                {designs.map((d) => (
                                    <DropdownMenuItem
                                        key={d.id}
                                        onClick={() => setSelectedDesign(d.id)}
                                        className={cn(
                                            'cursor-pointer rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors px-3 py-2 mx-1',
                                            selectedDesign === d.id && 'bg-white/15 text-white'
                                        )}
                                    >
                                        {d.name}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Chat Theme Picker */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={glassButton}
                            title="Change Chat Theme"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        side="left"
                        align="center"
                        className="w-56 bg-black/95 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl z-[200]"
                    >
                        <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider font-normal px-3 py-2">
                            Chat Theme
                        </DropdownMenuLabel>
                        <ScrollArea className="h-64">
                            <div className="px-1">
                                {chatThemes.map((t) => (
                                    <DropdownMenuItem
                                        key={t.id}
                                        onClick={() => setChatTheme(t.id)}
                                        className={cn(
                                            'cursor-pointer rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors px-3 py-2 mx-1',
                                            selectedChatTheme === t.id && 'bg-white/15 text-white'
                                        )}
                                    >
                                        {t.name}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Divider */}
                <div className="w-6 h-px bg-white/10" />

                {/* Stop/Exit Button */}
                <Button
                    onClick={onStop}
                    size="icon"
                    variant="ghost"
                    className={dangerButton}
                    title="Exit Omegle Mode"
                >
                    <X className="w-4 h-4" />
                </Button>

                {/* Connection Status Indicator */}
                <div className={cn(
                    "flex items-center justify-center w-full px-2 py-1.5 rounded-full",
                    "bg-black/30 border border-white/[0.05]",
                    "transition-all duration-300"
                )}>
                    <div className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors duration-300 mr-1.5',
                        isConnected && 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
                        isSearching && 'bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50',
                        connection.matchStatus === 'idle' && 'bg-white/30',
                        connection.matchStatus === 'disconnected' && 'bg-white/20'
                    )} />
                    <span className="text-[10px] text-white/60 font-medium tracking-wide">
                        {isConnected && 'Live'}
                        {isSearching && '...'}
                        {connection.matchStatus === 'idle' && 'Ready'}
                        {connection.matchStatus === 'disconnected' && 'Off'}
                    </span>
                </div>
            </div>
        </div>
    );
};