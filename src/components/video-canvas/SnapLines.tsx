import React, {
    useState,
    useImperativeHandle,
    forwardRef,
    memo,
} from "react";
import { GuideLine } from "@/hooks/useSnapGuides";
import { SnapGuideLine } from "@/components/SnapGuideLine";

export interface SnapLinesRef {
    setGuides: (guides: GuideLine[]) => void;
}

interface SnapLinesProps {
    containerSize: { width: number; height: number };
}

export const SnapLines = memo(
    forwardRef<SnapLinesRef, SnapLinesProps>((props, ref) => {
        const [guides, setGuides] = useState<GuideLine[]>([]);

        useImperativeHandle(ref, () => ({
            setGuides: (newGuides: GuideLine[]) => {
                setGuides(newGuides);
            },
        }));

        if (guides.length === 0) return null;

        return (
            <div className="absolute inset-0 pointer-events-none z-[9999]">
                {guides.map((guide, i) => (
                    <SnapGuideLine
                        key={i}
                        axis={guide.axis}
                        position={guide.position}
                        containerSize={props.containerSize}
                        type={guide.type}
                    />
                ))}
            </div>
        );
    })
);

SnapLines.displayName = "SnapLines";
