import { useThemeStore, ThemeName } from "../model/theme.store";

const loaderColors: Record<ThemeName, { primary: string; secondary: string }> = {
  default: { primary: "#facc15", secondary: "#fbbf24" },
  ocean: { primary: "#38bdf8", secondary: "#0ea5e9" },
  forest: { primary: "#4ade80", secondary: "#22c55e" },
  sunset: { primary: "#fb923c", secondary: "#f97316" },
  cyberpunk: { primary: "#e879f9", secondary: "#f0abfc" },
  aurora: { primary: "#34d399", secondary: "#6ee7b7" },
  midnight: { primary: "#818cf8", secondary: "#6366f1" },
  sakura: { primary: "#f472b6", secondary: "#f9a8d4" },
  volcanic: { primary: "#ef4444", secondary: "#f87171" },
  arctic: { primary: "#67e8f9", secondary: "#a5f3fc" },
  neon: { primary: "#a3e635", secondary: "#bef264" },
  ethereal: { primary: "#c4b5fd", secondary: "#ddd6fe" },
  retro: { primary: "#fb7185", secondary: "#fda4af" },
  monochrome: { primary: "#a1a1aa", secondary: "#d4d4d8" },
  obsidian: { primary: "#e5e5e7", secondary: "#a1a1a3" },
  champagne: { primary: "#f7e7a3", secondary: "#c9a962" },
  emeraldNoir: { primary: "#2ecc71", secondary: "#0d4f3c" },
  roseGold: { primary: "#e8b4bc", secondary: "#b76e79" },
  ultraviolet: { primary: "#a78bfa", secondary: "#7c3aed" },
  caramelLatte: { primary: "#d4a574", secondary: "#8b5a2b" },
  iceQueen: { primary: "#38bdf8", secondary: "#e2e8f0" },
  midnightTokyo: { primary: "#ff6eb4", secondary: "#ff2d92" },
};

interface ThemedLoaderProps {
  size?: number;
  className?: string;
}

export function ThemedLoader({ size = 48, className = "" }: ThemedLoaderProps) {
  const theme = useThemeStore((s) => s.theme);
  const colors = loaderColors[theme];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="animate-spin"
        style={{ animationDuration: "1s" }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="4"
          opacity="0.3"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={colors.primary}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="80 50"
        />
      </svg>
    </div>
  );
}

// Full-screen loader overlay
export function ThemedLoaderOverlay() {
  const theme = useThemeStore((s) => s.theme);
  const colors = loaderColors[theme];

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-background z-[9999]"
      style={{ "--loader-color": colors.primary } as React.CSSProperties}
    >
      <div className="relative">
        {/* Outer ring */}
        <svg
          width={80}
          height={80}
          viewBox="0 0 80 80"
          className="animate-spin"
          style={{ animationDuration: "2s" }}
        >
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={colors.secondary}
            strokeWidth="3"
            opacity="0.2"
          />
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke={colors.primary}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="60 160"
          />
        </svg>
        
        {/* Inner ring - opposite direction */}
        <svg
          width={50}
          height={50}
          viewBox="0 0 50 50"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin"
          style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
        >
          <circle
            cx="25"
            cy="25"
            r="18"
            fill="none"
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="30 80"
          />
        </svg>
        
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: colors.primary }}
        />
      </div>
      
      <span
        className="mt-6 text-sm font-medium tracking-wide opacity-60"
        style={{ color: colors.primary }}
      >
        Loading...
      </span>
    </div>
  );
}
