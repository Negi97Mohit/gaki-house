import { useThemeStore, themes, ThemeName } from "../model/theme.store";
import { Moon, Sun } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

export function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useThemeStore();

  return (
    <div className="w-full antialiased">
      {/* Appearance */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div className="min-w-0">
          <span className="text-[13px] font-medium text-white/90">
            Appearance
          </span>
          <p className="text-[11px] text-white/45 mt-0.5">
            Light or dark studio
          </p>
        </div>
        <div
          role="group"
          aria-label="Appearance mode"
          className="flex p-0.5 rounded-full border border-white/[0.09]"
        >
          {(["dark", "light"] as const).map((m) => (
            <button
              key={m}
              onClick={() => mode !== m && toggleMode()}
              aria-pressed={mode === m}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] capitalize transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40",
                mode === m
                  ? "bg-white/[0.1] text-white"
                  : "text-white/45 hover:text-white/80",
              )}
            >
              {m === "dark" ? (
                <Moon className="w-3 h-3" />
              ) : (
                <Sun className="w-3 h-3" />
              )}
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div className="pt-4">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[13px] font-medium text-white/90">
            Color theme
          </span>
          <span className="text-[11px] text-white/35">
            {Object.keys(themes).length} available
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {(Object.keys(themes) as ThemeName[]).map((key) => {
            const t = themes[key];
            const isActive = theme === key;
            const swatches = t.ambient.colors.slice(0, 4);

            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                data-active={isActive}
                aria-pressed={isActive}
                className="sp-tile text-left p-2.5 focus-visible:outline-none focus-visible:border-white/40"
              >
                <div className="flex h-6 w-full overflow-hidden rounded-md mb-2.5">
                  {swatches.map((c, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-[12px] truncate",
                      isActive ? "text-white" : "text-white/70",
                    )}
                  >
                    {t.name}
                  </span>
                  <span className="text-[10px] text-white/30 shrink-0">
                    {t.ambient.type}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
