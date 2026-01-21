import React, { useState, useEffect, useRef } from 'react';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';
import { getOmegleDesignNames } from '@/data/omegleDesigns';
import { chatThemes } from '@/data/chatThemes';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    SkipForward,
    X,
    Palette,
    MessageSquare,
    Sparkles,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/shared/ui/dropdown-menu';

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

    const getPositionClasses = () => {
        const base = 'absolute flex flex-col items-center gap-1.5 transition-all duration-500 ease-out';

        switch (controls.position) {
            case 'top-left':
                return `${base} top-4 left-4`;
            case 'top-right':
                return `${base} top-4 right-4`;
            case 'top-center':
                return `${base} top-4 right-4`;
            case 'bottom-left':
                return `${base} bottom-4 left-4`;
            case 'bottom-right':
                return `${base} bottom-4 right-4`;
            default:
                return `${base} top-4 right-4`;
        }
    };

    // Shared button styles for chic minimalist look
    const controlButtonBase = cn(
        "h-9 w-9 rounded-full backdrop-blur-xl transition-all duration-300",
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

    const activeButton = cn(
        controlButtonBase,
        "bg-white/[0.12] text-white border-white/20"
    );

    const offButton = cn(
        controlButtonBase,
        "bg-red-500/30 text-red-300 border-red-500/30 hover:bg-red-500/40"
    );

    return (
        <div
            className={cn(
                getPositionClasses(),
                "p-3"
            )}
            style={{
                zIndex: 100,
                ...controls.style,
            }}
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
            <div className={cn(
                "flex flex-col items-center gap-2 transition-all duration-500 ease-out",
                !isVisible && hasStarted && 'opacity-0 translate-x-4 pointer-events-none'
            )}>
                {/* Find Stranger Button (only when idle) */}
                {connection.matchStatus === 'idle' && (
                    <Button
                        onClick={handleFindStranger}
                        className={cn(
                            "h-10 px-5 rounded-full font-medium text-sm tracking-wide",
                            "bg-emerald-500/90 hover:bg-emerald-400 text-white",
                            "border border-emerald-400/30 backdrop-blur-xl",
                            "shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/40",
                            "transition-all duration-300 hover:scale-105 active:scale-95"
                        )}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Connect
                    </Button>
                )}

                {/* Next Button (when connected) */}
                {isConnected && (
                    <Button
                        onClick={onNext}
                        className={cn(
                            "h-10 px-5 rounded-full font-medium text-sm tracking-wide",
                            "bg-amber-500/90 hover:bg-amber-400 text-white",
                            "border border-amber-400/30 backdrop-blur-xl",
                            "shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40",
                            "transition-all duration-300 hover:scale-105 active:scale-95"
                        )}
                    >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Next
                    </Button>
                )}

                {/* Media Controls Row */}
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/20 backdrop-blur-xl border border-white/[0.05]">
                    {/* Camera Toggle */}
                    <Button
                        onClick={toggleCamera}
                        size="icon"
                        variant="ghost"
                        className={isCameraEnabled ? glassButton : offButton}
                        disabled={isSearching}
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
                    >
                        {isMicEnabled ? (
                            <Mic className="w-4 h-4" />
                        ) : (
                            <MicOff className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                {/* Settings Row */}
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/20 backdrop-blur-xl border border-white/[0.05]">
                    {/* Layout Design Picker */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className={glassButton}
                                title="Change Layout"
                            >
                                <Palette className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            align="end" 
                            className="w-52 bg-black/90 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl"
                        >
                            <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider font-normal">
                                Layout
                            </DropdownMenuLabel>
                            {designs.map((d) => (
                                <DropdownMenuItem
                                    key={d.id}
                                    onClick={() => setSelectedDesign(d.id)}
                                    className={cn(
                                        'cursor-pointer rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors',
                                        selectedDesign === d.id && 'bg-white/10 text-white'
                                    )}
                                >
                                    {d.name}
                                </DropdownMenuItem>
                            ))}
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
                            align="end" 
                            className="w-52 max-h-80 overflow-y-auto bg-black/90 backdrop-blur-xl border-white/10 rounded-xl shadow-2xl scrollbar-thin scrollbar-thumb-white/10"
                        >
                            <DropdownMenuLabel className="text-white/50 text-xs uppercase tracking-wider font-normal">
                                Chat Theme
                            </DropdownMenuLabel>
                            {chatThemes.map((t) => (
                                <DropdownMenuItem
                                    key={t.id}
                                    onClick={() => setChatTheme(t.id)}
                                    className={cn(
                                        'cursor-pointer rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors',
                                        selectedChatTheme === t.id && 'bg-white/10 text-white'
                                    )}
                                >
                                    {t.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Stop/Exit Button */}
                    <Button
                        onClick={onStop}
                        size="icon"
                        variant="ghost"
                        className={dangerButton}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Connection Status Indicator */}
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full",
                    "bg-black/30 backdrop-blur-xl border border-white/[0.05]",
                    "transition-all duration-300"
                )}>
                    <div className={cn(
                        'w-1.5 h-1.5 rounded-full transition-colors duration-300',
                        isConnected && 'bg-emerald-400 shadow-sm shadow-emerald-400/50',
                        isSearching && 'bg-amber-400 animate-pulse shadow-sm shadow-amber-400/50',
                        connection.matchStatus === 'idle' && 'bg-white/30',
                        connection.matchStatus === 'disconnected' && 'bg-white/20'
                    )} />
                    <span className="text-[11px] text-white/60 font-medium tracking-wide">
                        {isConnected && 'Connected'}
                        {isSearching && 'Searching'}
                        {connection.matchStatus === 'idle' && 'Ready'}
                        {connection.matchStatus === 'disconnected' && 'Offline'}
                    </span>
                </div>
            </div>
        </div>
    );
};
