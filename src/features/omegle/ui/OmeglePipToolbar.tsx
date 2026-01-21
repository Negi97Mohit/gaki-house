import React, { useState } from 'react';
import {
    FlipHorizontal,
    FlipVertical,
    ZoomIn,
    ZoomOut,
    Lock,
    Unlock,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';

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

    const toolbarButtonBase = cn(
        "h-7 w-7 rounded-full transition-all duration-200",
        "hover:bg-white/20 active:scale-90",
        "focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-0"
    );

    return (
        <div
            className={cn(
                'absolute top-3 left-3 flex items-center gap-0.5',
                'bg-black/50 backdrop-blur-xl rounded-full',
                'p-1 border border-white/[0.08]',
                'transition-all duration-300 ease-out z-50',
                'shadow-lg shadow-black/30',
                isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 -translate-y-1 pointer-events-none',
                'group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
            )}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {/* Flip Horizontal */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(toolbarButtonBase, "text-white/70 hover:text-white")}
                onClick={onFlipHorizontal}
                title="Flip Horizontal"
            >
                <FlipHorizontal className="h-3.5 w-3.5" />
            </Button>

            {/* Flip Vertical */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(toolbarButtonBase, "text-white/70 hover:text-white")}
                onClick={onFlipVertical}
                title="Flip Vertical"
            >
                <FlipVertical className="h-3.5 w-3.5" />
            </Button>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Zoom In */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(toolbarButtonBase, "text-white/70 hover:text-white")}
                onClick={onZoomIn}
                title="Zoom In"
            >
                <ZoomIn className="h-3.5 w-3.5" />
            </Button>

            {/* Zoom Out */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(toolbarButtonBase, "text-white/70 hover:text-white")}
                onClick={onZoomOut}
                title="Zoom Out"
            >
                <ZoomOut className="h-3.5 w-3.5" />
            </Button>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Lock/Unlock Position */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    toolbarButtonBase,
                    isLocked 
                        ? 'text-amber-400 bg-amber-500/20 hover:bg-amber-500/30' 
                        : 'text-white/70 hover:text-white'
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
            <div className={cn(
                "ml-1 px-2.5 py-1 rounded-full",
                "text-[10px] font-medium uppercase tracking-wider",
                "bg-white/[0.08] text-white/50"
            )}>
                {target === 'stranger' ? 'Them' : 'You'}
            </div>
        </div>
    );
};
