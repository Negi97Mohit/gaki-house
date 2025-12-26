// src/components/SmartTextAnimator.tsx
import React, { useState, useEffect } from "react";
import { AnimationPreset } from "@/types/animation";
import { cn } from "@/shared/lib/utils";

interface SmartTextAnimatorProps {
  preset: AnimationPreset;
  className?: string;
  style?: React.CSSProperties;
  isPreview?: boolean;
  playing?: boolean;
}

export const SmartTextAnimator: React.FC<SmartTextAnimatorProps> = ({
  preset,
  className,
  style,
  isPreview = false,
  playing = true,
}) => {
  const { defaultContent, baseStyle, animationConfig } = preset;

  // --- DYNAMIC FONT LOADING ---
  useEffect(() => {
    if (!baseStyle.fontFamily) return;

    // Check if font is already loaded or is a standard font
    const fontName = baseStyle.fontFamily;
    const isStandard = [
      "Arial",
      "Verdana",
      "Helvetica",
      "Times New Roman",
    ].includes(fontName);

    if (!isStandard) {
      const linkId = `font-link-${fontName.replace(/\s+/g, "-")}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
          / /g,
          "+"
        )}:wght@300;400;700;900&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }
  }, [baseStyle.fontFamily]);
  // -----------------------------

  // --- LOOPING LOGIC ---
  const [key, setKey] = useState(0);
  const isLooping = animationConfig.loop ?? false;

  useEffect(() => {
    if (!isLooping || !playing) return;

    const loopDelay = (animationConfig.loopDelay || 0) * 1000;
    const duration = (animationConfig.duration || 1) * 1000;
    const totalCycleTime = duration + loopDelay + 100;

    const timer = setTimeout(() => {
      setKey((prev) => prev + 1);
    }, totalCycleTime);

    return () => clearTimeout(timer);
  }, [isLooping, animationConfig, key, playing]);

  useEffect(() => {
    if (playing) {
      setKey((prev) => prev + 1);
    }
  }, [playing]);
  // ---------------------

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
    textShadow: baseStyle.textShadow,
    backdropFilter: baseStyle.backgroundBlur
      ? `blur(${baseStyle.backgroundBlur}px)`
      : undefined,
  };
  const gradientStyle: React.CSSProperties = baseStyle.gradient
    ? {
        background: baseStyle.gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent",
      }
    : {};
  const getAnimationClass = () => {
    if (!playing) return "";
    if (animationConfig.direction === "up") return "animate-slide-up-fade";
    if (animationConfig.direction === "down") return "animate-slide-down-fade";
    if (animationConfig.direction === "left") return "animate-slide-left-fade";
    if (animationConfig.direction === "right")
      return "animate-slide-right-fade";
    return "animate-fade-in";
  };

  return (
    <div
      key={key}
      className={cn("overflow-hidden", className)}
      style={containerStyle}
    >
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
              animationDelay: playing
                ? `${index * 0.1 + (animationConfig.delay || 0)}s`
                : "0s",
              animationDuration: playing
                ? `${animationConfig.duration}s`
                : "0s",
              animationFillMode: "forwards",
              opacity: playing ? 0 : 1,
              transform: !playing ? "none" : undefined,
              ...gradientStyle,
            }}
          >
            {text}
          </div>
        );
      })}

      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDownFade { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeftFade { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideRightFade { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .animate-slide-up-fade { animation-name: slideUpFade; animation-timing-function: ease-out; }
        .animate-slide-down-fade { animation-name: slideDownFade; animation-timing-function: ease-out; }
        .animate-slide-left-fade { animation-name: slideLeftFade; animation-timing-function: ease-out; }
        .animate-slide-right-fade { animation-name: slideRightFade; animation-timing-function: ease-out; }
        .animate-fade-in { animation-name: fadeIn; animation-timing-function: ease-out; }
      `}</style>
    </div>
  );
};
