import React, { useState } from 'react';
import {
    FlipHorizontal,
    FlipVertical,
    ZoomIn,
    ZoomOut,
    Lock,
    Unlock,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

interface PipToolbarProps {
    target: 'stranger' | 'local';
    onFlipHorizontal: () => void;
    onFlipVertical: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onToggleLock: () => void;
    isLocked: boolean;
}

export const OmeglePipToolbar: React.FC<PipToolbarProps> = ({
    target,
    onFlipHorizontal,
    onFlipVertical,
    onZoomIn,
    onZoomOut,
    onToggleLock,
    isLocked,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className={cn(
                'absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-lg p-1.5 transition-all duration-200 z-50',
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
                'group-hover:opacity-100 group-hover:pointer-events-auto'
            )}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {/* Flip Horizontal */}
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={onFlipHorizontal}
                title="Flip Horizontal"
            >
                <FlipHorizontal className="h-3.5 w-3.5" />
            </Button>

            {/* Flip Vertical */}
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={onFlipVertical}
                title="Flip Vertical"
            >
                <FlipVertical className="h-3.5 w-3.5" />
            </Button>

            <div className="w-px h-4 bg-white/20" />

            {/* Zoom In */}
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={onZoomIn}
                title="Zoom In"
            >
                <ZoomIn className="h-3.5 w-3.5" />
            </Button>

            {/* Zoom Out */}
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-white/20"
                onClick={onZoomOut}
                title="Zoom Out"
            >
                <ZoomOut className="h-3.5 w-3.5" />
            </Button>

            <div className="w-px h-4 bg-white/20" />

            {/* Lock/Unlock Position */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    'h-7 w-7 text-white hover:bg-white/20',
                    isLocked && 'bg-white/10'
                )}
                onClick={onToggleLock}
                title={isLocked ? 'Unlock Position' : 'Lock Position'}
            >
                {isLocked ? (
                    <Lock className="h-3.5 w-3.5" />
                ) : (
                    <Unlock className="h-3.5 w-3.5" />
                )}
            </Button>

            {/* Target Label */}
            <div className="ml-1 px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/70 font-medium uppercase tracking-wider">
                {target === 'stranger' ? 'Stranger' : 'You'}
            </div>
        </div>
    );
};
