import React, { useState } from 'react';
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

    const [isVisible, setIsVisible] = useState(true); // Always visible
    const { controls } = design.layout;
    const designs = getOmegleDesignNames();

    const isConnected = connection.matchStatus === 'connected';
    const isSearching = connection.matchStatus === 'searching';

    const getPositionClasses = () => {
        const base = 'absolute flex items-center gap-2 transition-all duration-300';

        switch (controls.position) {
            case 'top-left':
                return `${base} top-3 left-3`;
            case 'top-right':
                return `${base} top-3 right-3`;
            case 'top-center':
                return `${base} top-3 left-1/2 -translate-x-1/2`;
            case 'bottom-left':
                return `${base} bottom-3 left-3`;
            case 'bottom-right':
                return `${base} bottom-3 right-3`;
            case 'bottom-center':
                return `${base} bottom-3 left-1/2 -translate-x-1/2`;
            default:
                return `${base} top-3 right-3`;
        }
    };

    return (
        <div
            className={cn(
                getPositionClasses(),
                !isVisible && controls.autoHide && 'opacity-0 pointer-events-none'
            )}
            style={{
                zIndex: 100,
                ...controls.style,
            }}
            onMouseEnter={() => controls.showOnHover && setIsVisible(true)}
            onMouseLeave={() => controls.autoHide && setIsVisible(false)}
        >
            {/* Find Stranger Button (only when idle) */}
            {connection.matchStatus === 'idle' && (
                <Button
                    onClick={onFindStranger}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
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
                    className="bg-orange-600 hover:bg-orange-700 text-white"
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
                    'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm',
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
                    'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm',
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
                        className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
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
                className="bg-red-600/80 hover:bg-red-700 text-white backdrop-blur-sm"
            >
                <X className="w-4 h-4" />
            </Button>

            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                <div
                    className={cn(
                        'w-2 h-2 rounded-full',
                        isConnected && 'bg-green-500 animate-pulse',
                        isSearching && 'bg-yellow-500 animate-pulse',
                        connection.matchStatus === 'idle' && 'bg-gray-500'
                    )}
                />
                <span className="text-xs text-white">
                    {isConnected && 'Connected'}
                    {isSearching && 'Searching...'}
                    {connection.matchStatus === 'idle' && 'Idle'}
                    {connection.matchStatus === 'disconnected' && 'Disconnected'}
                </span>
            </div>
        </div>
    );
};
