import React from "react";
import { useThemeStore, themes } from "@/features/theme/model/theme.store";
import { FuturisticCanvas } from "./futuristic-canvas";

interface AmbientBackgroundProps {
  className?: string;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  className = "",
}) => {
  const { theme, mode } = useThemeStore();
  const { ambient } = themes[theme] ?? themes.eventHorizon;
  const dark = mode === "dark";

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden transition-colors duration-500 ${className}`}
      style={{ backgroundColor: dark ? "#0a0a0a" : "#f5f5f5" }}
    >
      <FuturisticCanvas
        type={ambient.type}
        colors={ambient.colors}
        intensity={ambient.intensity}
        speed={ambient.speed}
        dark={dark}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 45%, ${dark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.25)"} 100%)`,
        }}
      />
    </div>
  );
};
