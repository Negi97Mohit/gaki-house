import React, { useState, useEffect, useRef } from 'react';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';
import { getOmegleDesignNames } from '@/data/omegleDesigns';
import { omegleThemes } from '@/data/omegleThemes';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    SkipForward,
    X,
    Layout,
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
            <div 
                className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl",
                    "backdrop-blur-2xl transition-all duration-500 ease-out",
                    !isVisible && hasStarted && 'opacity-0 translate-x-4 pointer-events-none'
                )}
                style={{
                    background: 'var(--omegle-controls-background)',
                    border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                    boxShadow: 'var(--omegle-shadow)',
                    borderRadius: 'var(--omegle-border-radius)',
                }}
            >
                {/* Find Stranger Button (only when idle) */}
                {connection.matchStatus === 'idle' && (
                    <Button
                        onClick={handleFindStranger}
                        className={cn(
                            "h-10 w-10 rounded-full font-medium",
                            "border backdrop-blur-xl",
                            "shadow-lg",
                            "transition-all duration-300 hover:scale-105 active:scale-95"
                        )}
                        style={{
                            background: 'var(--omegle-success)',
                            color: 'var(--omegle-primary-foreground)',
                            borderColor: 'var(--omegle-success)',
                        }}
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
                            "border backdrop-blur-xl",
                            "shadow-lg",
                            "transition-all duration-300 hover:scale-105 active:scale-95"
                        )}
                        style={{
                            background: 'var(--omegle-warning)',
                            color: 'var(--omegle-text-inverse)',
                            borderColor: 'var(--omegle-warning)',
                        }}
                        title="Next Stranger"
                    >
                        <SkipForward className="w-4 h-4" />
                    </Button>
                )}

                {/* Divider */}
                <div 
                    className="w-6 h-px"
                    style={{ background: 'var(--omegle-controls-border)' }}
                />

                {/* Camera Toggle */}
                <Button
                    onClick={toggleCamera}
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "h-10 w-10 rounded-full backdrop-blur-xl transition-all duration-300",
                        "hover:scale-105 active:scale-95"
                    )}
                    style={{
                        background: isCameraEnabled 
                            ? 'var(--omegle-controls-button)' 
                            : 'var(--omegle-error)',
                        color: isCameraEnabled 
                            ? 'var(--omegle-controls-icon)' 
                            : 'var(--omegle-primary-foreground)',
                        border: `var(--omegle-border-width) solid ${isCameraEnabled ? 'var(--omegle-controls-border)' : 'var(--omegle-error)'}`,
                    }}
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
                    className={cn(
                        "h-10 w-10 rounded-full backdrop-blur-xl transition-all duration-300",
                        "hover:scale-105 active:scale-95"
                    )}
                    style={{
                        background: isMicEnabled 
                            ? 'var(--omegle-controls-button)' 
                            : 'var(--omegle-error)',
                        color: isMicEnabled 
                            ? 'var(--omegle-controls-icon)' 
                            : 'var(--omegle-primary-foreground)',
                        border: `var(--omegle-border-width) solid ${isMicEnabled ? 'var(--omegle-controls-border)' : 'var(--omegle-error)'}`,
                    }}
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
                <div 
                    className="w-6 h-px"
                    style={{ background: 'var(--omegle-controls-border)' }}
                />

                {/* Global Theme Picker */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                "h-10 w-10 rounded-full backdrop-blur-xl transition-all duration-300",
                                "hover:scale-105 active:scale-95"
                            )}
                            style={{
                                background: 'var(--omegle-controls-button)',
                                color: 'var(--omegle-controls-icon)',
                                border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                            }}
                            title="Change Theme"
                        >
                            <Sun className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        side="left"
                        align="center"
                        className="w-56 rounded-xl shadow-2xl z-[200]"
                        style={{
                            background: 'var(--omegle-controls-background)',
                            border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                            backdropFilter: 'blur(24px)',
                        }}
                    >
                        <DropdownMenuLabel 
                            className="text-xs uppercase tracking-wider font-normal px-3 py-2"
                            style={{ color: 'var(--omegle-text-muted)' }}
                        >
                            Theme
                        </DropdownMenuLabel>
                        <ScrollArea className="h-64">
                            <div className="px-1">
                                {omegleThemes.map((t) => (
                                    <DropdownMenuItem
                                        key={t.id}
                                        onClick={() => setOmegleTheme(t.id)}
                                        className={cn(
                                            'cursor-pointer rounded-lg transition-colors px-3 py-2 mx-1'
                                        )}
                                        style={{
                                            color: selectedOmegleTheme === t.id 
                                                ? 'var(--omegle-text)' 
                                                : 'var(--omegle-text-muted)',
                                            background: selectedOmegleTheme === t.id 
                                                ? 'var(--omegle-secondary)' 
                                                : 'transparent',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-4 h-4 rounded-full"
                                                style={{ 
                                                    background: t.colors.primary,
                                                    border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                                                }}
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
                            className={cn(
                                "h-10 w-10 rounded-full backdrop-blur-xl transition-all duration-300",
                                "hover:scale-105 active:scale-95"
                            )}
                            style={{
                                background: 'var(--omegle-controls-button)',
                                color: 'var(--omegle-controls-icon)',
                                border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                            }}
                            title="Change Layout"
                        >
                            <Layout className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        side="left"
                        align="center"
                        className="w-56 rounded-xl shadow-2xl z-[200]"
                        style={{
                            background: 'var(--omegle-controls-background)',
                            border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                            backdropFilter: 'blur(24px)',
                        }}
                    >
                        <DropdownMenuLabel 
                            className="text-xs uppercase tracking-wider font-normal px-3 py-2"
                            style={{ color: 'var(--omegle-text-muted)' }}
                        >
                            Layout
                        </DropdownMenuLabel>
                        <ScrollArea className="h-64">
                            <div className="px-1">
                                {designs.map((d) => (
                                    <DropdownMenuItem
                                        key={d.id}
                                        onClick={() => setSelectedDesign(d.id)}
                                        className={cn(
                                            'cursor-pointer rounded-lg transition-colors px-3 py-2 mx-1'
                                        )}
                                        style={{
                                            color: selectedDesign === d.id 
                                                ? 'var(--omegle-text)' 
                                                : 'var(--omegle-text-muted)',
                                            background: selectedDesign === d.id 
                                                ? 'var(--omegle-secondary)' 
                                                : 'transparent',
                                        }}
                                    >
                                        {d.name}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Divider */}
                <div 
                    className="w-6 h-px"
                    style={{ background: 'var(--omegle-controls-border)' }}
                />

                {/* Stop/Exit Button */}
                <Button
                    onClick={onStop}
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "h-10 w-10 rounded-full backdrop-blur-xl transition-all duration-300",
                        "hover:scale-105 active:scale-95"
                    )}
                    style={{
                        background: 'var(--omegle-error)',
                        color: 'var(--omegle-primary-foreground)',
                        border: 'var(--omegle-border-width) solid var(--omegle-error)',
                        opacity: 0.8,
                    }}
                    title="Exit Omegle Mode"
                >
                    <X className="w-4 h-4" />
                </Button>

                {/* Connection Status Indicator */}
                <div 
                    className={cn(
                        "flex items-center justify-center w-full px-2 py-1.5 rounded-full",
                        "transition-all duration-300"
                    )}
                    style={{
                        background: 'var(--omegle-secondary)',
                        border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                    }}
                >
                    <div 
                        className={cn(
                            'w-1.5 h-1.5 rounded-full transition-colors duration-300 mr-1.5'
                        )}
                        style={{
                            background: isConnected 
                                ? 'var(--omegle-success)' 
                                : isSearching 
                                    ? 'var(--omegle-warning)' 
                                    : 'var(--omegle-text-muted)',
                            boxShadow: isConnected || isSearching 
                                ? `0 0 6px ${isConnected ? 'var(--omegle-success)' : 'var(--omegle-warning)'}` 
                                : 'none',
                        }}
                    />
                    <span 
                        className="text-[10px] font-medium tracking-wide"
                        style={{ color: 'var(--omegle-text-muted)' }}
                    >
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