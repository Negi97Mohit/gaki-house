import { useThemeStore, ThemeName } from "../model/theme.store";

const loaderColors: Record<ThemeName, { primary: string; secondary: string }> = {
  default: { primary: "#facc15", secondary: "#fbbf24" },
  ocean: { primary: "#38bdf8", secondary: "#0ea5e9" },
  forest: { primary: "#4ade80", secondary: "#22c55e" },
  sunset: { primary: "#fb923c", secondary: "#f97316" },
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
