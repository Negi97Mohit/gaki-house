import React, { useState } from 'react';
import {
    FlipHorizontal,
    FlipVertical,
    ZoomIn,
    ZoomOut,
    Lock,
    Unlock,
} from 'lucide-react';
import { cn } from "@caption-cam/core/lib/utils";
import { Button } from "@caption-cam/ui/button";

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
        "active:scale-90",
        "focus-visible:ring-1 focus-visible:ring-offset-0"
    );

    return (
        <div
            className={cn(
                'absolute top-3 left-3 flex items-center gap-0.5',
                'backdrop-blur-xl rounded-full',
                'p-1',
                'transition-all duration-300 ease-out z-50',
                isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 -translate-y-1 pointer-events-none',
                'group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'
            )}
            style={{
                background: 'var(--omegle-controls-background)',
                border: 'var(--omegle-border-width) solid var(--omegle-controls-border)',
                boxShadow: 'var(--omegle-shadow)',
            }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {/* Flip Horizontal */}
            <Button
                variant="ghost"
                size="icon"
                className={toolbarButtonBase}
                style={{
                    color: 'var(--omegle-controls-icon)',
                    opacity: 0.7,
                }}
                onClick={onFlipHorizontal}
                title="Flip Horizontal"
            >
                <FlipHorizontal className="h-3.5 w-3.5" />
            </Button>

            {/* Flip Vertical */}
            <Button
                variant="ghost"
                size="icon"
                className={toolbarButtonBase}
                style={{
                    color: 'var(--omegle-controls-icon)',
                    opacity: 0.7,
                }}
                onClick={onFlipVertical}
                title="Flip Vertical"
            >
                <FlipVertical className="h-3.5 w-3.5" />
            </Button>

            {/* Divider */}
            <div 
                className="w-px h-4 mx-0.5"
                style={{ background: 'var(--omegle-controls-border)' }}
            />

            {/* Zoom In */}
            <Button
                variant="ghost"
                size="icon"
                className={toolbarButtonBase}
                style={{
                    color: 'var(--omegle-controls-icon)',
                    opacity: 0.7,
                }}
                onClick={onZoomIn}
                title="Zoom In"
            >
                <ZoomIn className="h-3.5 w-3.5" />
            </Button>

            {/* Zoom Out */}
            <Button
                variant="ghost"
                size="icon"
                className={toolbarButtonBase}
                style={{
                    color: 'var(--omegle-controls-icon)',
                    opacity: 0.7,
                }}
                onClick={onZoomOut}
                title="Zoom Out"
            >
                <ZoomOut className="h-3.5 w-3.5" />
            </Button>

            {/* Divider */}
            <div 
                className="w-px h-4 mx-0.5"
                style={{ background: 'var(--omegle-controls-border)' }}
            />

            {/* Lock/Unlock Position */}
            <Button
                variant="ghost"
                size="icon"
                className={toolbarButtonBase}
                style={{
                    color: isLocked ? 'var(--omegle-warning)' : 'var(--omegle-controls-icon)',
                    background: isLocked ? 'var(--omegle-warning)' : 'transparent',
                    opacity: isLocked ? 0.3 : 0.7,
                }}
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
            <div 
                className={cn(
                    "ml-1 px-2.5 py-1 rounded-full",
                    "text-[10px] font-medium uppercase tracking-wider"
                )}
                style={{
                    background: 'var(--omegle-secondary)',
                    color: 'var(--omegle-text-muted)',
                }}
            >
                {target === 'stranger' ? 'Them' : 'You'}
            </div>
        </div>
    );
};