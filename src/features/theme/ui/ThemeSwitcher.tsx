import { useThemeStore, themes, ThemeName } from "../model/theme.store";
import { Moon, Sun, Check, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";

export function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useThemeStore();

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Appearance</span>
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          {mode === "dark" ? (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-sm">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-sm">Light</span>
            </>
          )}
        </button>
      </div>

      {/* Theme Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Color Theme</span>
        </div>
        <ScrollArea className="h-[320px] pr-3">
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(themes) as ThemeName[]).map((key) => {
              const t = themes[key];
              const isActive = theme === key;
              const color = mode === "dark" ? t.colors.dark : t.colors.light;

              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={cn(
                    "group relative flex flex-col items-start gap-2 p-3 rounded-xl border transition-all text-left",
                    isActive
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  {/* Ambient preview strip */}
                  <div 
                    className="w-full h-8 rounded-lg overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, ${t.ambient.colors[0]}40, ${t.ambient.colors[1] || t.ambient.colors[0]}30, ${t.ambient.colors[2] || t.ambient.colors[0]}40)`,
                    }}
                  >
                    {/* Color dots */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                      {t.ambient.colors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Label & description */}
                  <div className="w-full">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ 
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}80`,
                        }}
                      />
                      <span className="text-xs font-medium truncate">{t.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                      {t.description}
                    </p>
                  </div>

                  {/* Check mark */}
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}

                  {/* Type badge */}
                  <div 
                    className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-medium"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                    }}
                  >
                    {t.ambient.type}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Live Preview */}
      <div className="pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">Live Preview</span>
        <div className="mt-2 p-3 rounded-xl border border-border overflow-hidden relative">
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${themes[theme].ambient.colors[0]}30, ${themes[theme].ambient.colors[1] || themes[theme].ambient.colors[0]}20, ${themes[theme].ambient.colors[2] || themes[theme].ambient.colors[0]}30)`,
            }}
          />
          <div className="relative flex gap-2">
            <div className="flex-1 h-6 rounded bg-primary" />
            <div className="flex-1 h-6 rounded bg-secondary" />
            <div className="flex-1 h-6 rounded bg-muted" />
            <div className="flex-1 h-6 rounded bg-accent" />
          </div>
          <div className="relative mt-2 flex gap-2">
            {themes[theme].ambient.colors.slice(0, 4).map((c, i) => (
              <div 
                key={i}
                className="flex-1 h-4 rounded"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
