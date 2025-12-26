// src/components/SnapGuideLine.tsx
import React from 'react';

export interface GuideLineProps {
    axis: 'x' | 'y';
    position: number; // Percentage
    containerSize: { width: number; height: number };
    type: 'center' | 'edge' | 'element';
}

export const SnapGuideLine: React.FC<GuideLineProps> = ({
    axis,
    position,
    containerSize,
    type,
}) => {
    const isVertical = axis === 'x';

    // Calculate pixel position
    const positionPx = isVertical
        ? (position / 100) * containerSize.width
        : (position / 100) * containerSize.height;

    // Clean dashed line like Canva
    const color = '#FF1493'; // Hot pink

    return (
        <div
            style={{
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: 9998,
                // Vertical line (x-axis snap)
                ...(isVertical
                    ? {
                        left: `${positionPx}px`,
                        top: 0,
                        width: '1px',
                        height: '100%',
                        borderLeft: `1px dashed ${color}`,
                    }
                    : {
                        // Horizontal line (y-axis snap)
                        top: `${positionPx}px`,
                        left: 0,
                        height: '1px',
                        width: '100%',
                        borderTop: `1px dashed ${color}`,
                    }),
                animation: 'snapAppear 0.15s ease-out',
            }}
        >
            <style>
                {`
                    @keyframes snapAppear {
                        0% {
                            opacity: 0;
                            transform: ${isVertical ? 'scaleX(0.5)' : 'scaleY(0.5)'};
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}
            </style>
        </div>
    );
};
