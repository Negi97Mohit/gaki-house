import React from "react";
import { useThemeStore, ThemeName } from "@/features/theme";

interface LoaderProps {
  visible: boolean;
}

const loaderColors: Record<ThemeName, { primary: string; secondary: string }> = {
  default: { primary: "#facc15", secondary: "#fbbf24" },
  ocean: { primary: "#38bdf8", secondary: "#0ea5e9" },
  forest: { primary: "#4ade80", secondary: "#22c55e" },
  sunset: { primary: "#fb923c", secondary: "#f97316" },
};

const Loader: React.FC<LoaderProps> = ({ visible }) => {
  const theme = useThemeStore((s) => s.theme);
  const colors = loaderColors[theme];

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center bg-background transition-all duration-500 ${
        visible ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      }`}
      style={{ zIndex: "var(--z-loader)" }}
    >
      <div className="relative">
        {/* Outer ring */}
        <svg
          width={100}
          height={100}
          viewBox="0 0 100 100"
          className="animate-spin"
          style={{ animationDuration: "2s" }}
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="3"
            opacity="0.2"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={colors.primary}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="80 180"
          />
        </svg>
        
        {/* Inner ring - opposite direction */}
        <svg
          width={60}
          height={60}
          viewBox="0 0 60 60"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin"
          style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
        >
          <circle
            cx="30"
            cy="30"
            r="22"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="40 100"
          />
        </svg>
        
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full animate-pulse"
          style={{ backgroundColor: colors.primary }}
        />
      </div>
      
      <span
        className="mt-8 text-sm font-medium tracking-widest uppercase opacity-70"
        style={{ color: colors.primary }}
      >
        Loading
      </span>
    </div>
  );
};

export default Loader;
