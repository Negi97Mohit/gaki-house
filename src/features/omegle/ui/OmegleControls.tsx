import React, { useState, useEffect, useRef } from 'react';
import { OmegleDesign } from '@/types/omegle';
import { useOmegleStore } from '@/stores/omegle.store';
import { getOmegleDesignNames } from '@/data/omegleDesigns';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    SkipForward,
    X,
    Palette,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
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
    } = useOmegleStore();

    const [isVisible, setIsVisible] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);
    const hideTimerRef = useRef<NodeJS.Timeout>();
    const { controls } = design.layout;
    const designs = getOmegleDesignNames();

    const isConnected = connection.matchStatus === 'connected';
    const isSearching = connection.matchStatus === 'searching';

    // Cleanup timer on unmount
    useEffect(() => {
        return () => clearHideTimer();
    }, []);

    // Trigger auto-hide ONLY after first start
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

        // Only scheduled hide if we have started AND auto-hide is enabled
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
        const base = 'absolute flex flex-col items-center gap-2 transition-all duration-300';

        // Force right side if no position specified or use logical defaults for vertical stack
        switch (controls.position) {
            case 'top-left':
                return `${base} top-3 left-3`;
            case 'top-right':
                return `${base} top-3 right-3`;
            case 'top-center':
                return `${base} top-3 right-3`;
            case 'bottom-left':
                return `${base} bottom-3 left-3`;
            case 'bottom-right':
                return `${base} bottom-3 right-3`;
            default:
                return `${base} top-3 right-3`;
        }
    };

    return (
        <div
            className={cn(
                getPositionClasses(),
                "p-4 -mr-4" // Add padding to increase hover zone, negative margin to compensate position
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
                "flex flex-col items-center gap-2 w-full transition-all duration-300",
                !isVisible && hasStarted && 'opacity-0 translate-x-8 pointer-events-none'
            )}>
                {/* Find Stranger Button (only when idle) */}
                {connection.matchStatus === 'idle' && (
                    <Button
                        onClick={handleFindStranger}
                        size="sm"
                        className="h-8 shadow bg-green-600 hover:bg-green-700 text-white w-full shadow-md"
                    >
                        Find Stranger
                    </Button>
                )}

                {/* Next Button (when connected) */}
                {isConnected && (
                    <Button
                        onClick={onNext}
                        size="sm"
                        variant="secondary"
                        className="h-8 shadow bg-orange-600 hover:bg-orange-700 text-white w-full shadow-md"
                    >
                        <SkipForward className="w-4 h-4 mr-1" />
                        Next
                    </Button>
                )}

                {/* Camera Toggle */}
                <Button
                    onClick={toggleCamera}
                    size="sm"
                    variant="ghost"
                    className={cn(
                        'h-8 w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm',
                        !isCameraEnabled && 'bg-red-600/80 hover:bg-red-700'
                    )}
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
                    size="sm"
                    variant="ghost"
                    className={cn(
                        'h-8 w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm',
                        !isMicEnabled && 'bg-red-600/80 hover:bg-red-700'
                    )}
                    disabled={isSearching}
                >
                    {isMicEnabled ? (
                        <Mic className="w-4 h-4" />
                    ) : (
                        <MicOff className="w-4 h-4" />
                    )}
                </Button>

                {/* Design Picker */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                        >
                            <Palette className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {designs.map((d) => (
                            <DropdownMenuItem
                                key={d.id}
                                onClick={() => setSelectedDesign(d.id)}
                                className={cn(
                                    'cursor-pointer',
                                    selectedDesign === d.id && 'bg-blue-600 text-white'
                                )}
                            >
                                {d.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Stop/Exit Button */}
                <Button
                    onClick={onStop}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-full bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-sm"
                >
                    <X className="w-4 h-4" />
                </Button>

                {/* Connection Status Indicator */}
                <div className="flex items-center justify-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full w-full">
                    <div
                        className={cn(
                            'w-2 h-2 rounded-full',
                            isConnected && 'bg-green-500 animate-pulse',
                            isSearching && 'bg-yellow-500 animate-pulse',
                            connection.matchStatus === 'idle' && 'bg-gray-500'
                        )}
                    />
                    <span className="text-xs text-white">
                        {isConnected && 'Live'}
                        {isSearching && '...'}
                        {connection.matchStatus === 'idle' && 'Idle'}
                        {connection.matchStatus === 'disconnected' && 'Off'}
                    </span>
                </div>
            </div>
        </div>
    );
};
