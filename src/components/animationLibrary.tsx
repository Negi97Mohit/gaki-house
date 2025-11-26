// src/components/SmartTextAnimator.tsx
import React from "react";
import { AnimationPreset } from "@/types/animation";
import { cn } from "@/lib/utils";

interface SmartTextAnimatorProps {
  preset: AnimationPreset;
  className?: string;
  style?: React.CSSProperties;
}

export const SmartTextAnimator: React.FC<SmartTextAnimatorProps> = ({
  preset,
  className,
  style,
}) => {
  const { defaultContent, baseStyle, animationConfig } = preset;

  // Basic style mapping
  const containerStyle: React.CSSProperties = {
    ...style,
    fontFamily: baseStyle.fontFamily,
    color: baseStyle.color,
    textAlign: baseStyle.alignment,
    backgroundColor: baseStyle.backgroundColor || "transparent",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "2rem",
    height: "100%",
    width: "100%",
  };

  // Placeholder animation logic
  const getAnimationClass = () => {
    if (animationConfig.direction === "up") return "animate-slide-up-fade";
    return "animate-fade-in";
  };

  return (
    <div className={cn("overflow-hidden", className)} style={containerStyle}>
      {/* Render all content fields dynamically */}
      {Object.entries(defaultContent).map(([key, text], index) => {
        const isMain = key === "heading" || key === "title" || key === "value";

        return (
          <div
            key={key}
            className={cn(
              getAnimationClass(),
              isMain ? "font-bold tracking-tight" : "opacity-80 font-light"
            )}
            style={{
              fontSize: isMain
                ? `${baseStyle.fontSize}px`
                : `${baseStyle.fontSize * 0.5}px`,
              animationDelay: `${index * 0.1 + (animationConfig.delay || 0)}s`,
              animationDuration: `${animationConfig.duration}s`,
            }}
          >
            {text}
          </div>
        );
      })}

      {/* CSS for the preview (scoped) */}
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-fade {
          animation: slideUpFade ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
