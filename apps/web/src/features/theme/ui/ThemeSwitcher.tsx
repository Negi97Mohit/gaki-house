import { useThemeStore, themes, ThemeName } from "../model/theme.store";
import { Moon, Sun, Check } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { ScrollArea } from "@gaki/ui/scroll-area";

export function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useThemeStore();

  return (
    <div className="space-y-5">
      {/* Mode Toggle - Elegant pill design */}
      <div className="p-3 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.02] border border-border/10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium">Appearance Mode</span>
            <p className="text-[9px] text-muted-foreground/50 mt-0.5">Switch between light and dark</p>
          </div>
          <button
            onClick={toggleMode}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all",
              "bg-foreground/[0.04] dark:bg-white/[0.06] hover:bg-foreground/[0.06] dark:hover:bg-white/[0.08]",
              "border border-border/20 dark:border-white/10"
            )}
          >
            <div className={cn(
              "w-4 h-4 rounded-lg flex items-center justify-center transition-colors",
              mode === "dark" ? "bg-primary/20" : "bg-amber-500/20"
            )}>
              {mode === "dark" ? (
                <Moon className="w-2.5 h-2.5 text-primary" />
              ) : (
                <Sun className="w-2.5 h-2.5 text-amber-500" />
              )}
            </div>
            <span>{mode === "dark" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>

      {/* Theme Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-medium">Color Themes</span>
          <span className="text-[9px] text-muted-foreground/50">
            {Object.keys(themes).length} themes
          </span>
        </div>
        
        <ScrollArea className="h-[280px]" style={{ scrollbarWidth: 'none' }}>
          <div className="grid grid-cols-2 gap-1.5 pr-1">
            {(Object.keys(themes) as ThemeName[]).map((key) => {
              const t = themes[key];
              const isActive = theme === key;
              const color = mode === "dark" ? t.colors.dark : t.colors.light;

              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={cn(
                    "group relative flex flex-col p-2 rounded-xl transition-all duration-200 text-left",
                    "border border-transparent",
                    isActive
                      ? "bg-primary/8 border-primary/25 shadow-[0_0_16px_-6px] shadow-primary/25"
                      : "hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03] hover:border-border/20"
                  )}
                >
                  {/* Color preview bar */}
                  <div className="w-full h-6 rounded-lg overflow-hidden mb-2 relative">
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${t.ambient.colors[0]}50, ${t.ambient.colors[1] || t.ambient.colors[0]}40, ${t.ambient.colors[2] || t.ambient.colors[0]}50)`,
                      }}
                    />
                    {/* Color dots */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {t.ambient.colors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full shadow-sm ring-1 ring-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <div className="flex items-center gap-1.5 w-full">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: isActive ? `0 0 8px ${color}60` : 'none',
                      }}
                    />
                    <span className={cn(
                      "text-[10px] font-medium truncate transition-colors",
                      isActive ? "text-primary" : "text-foreground/70"
                    )}>
                      {t.name}
                    </span>
                  </div>

                  {/* Check mark */}
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-md bg-primary/15 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </div>
                  )}

                  {/* Type badge */}
                  <div 
                    className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded-md text-[7px] uppercase tracking-wider font-semibold"
                    style={{
                      backgroundColor: `${color}15`,
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

      {/* Live Preview - Compact & elegant */}
      <div className="pt-3 border-t border-border/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground/60">Live Preview</span>
          <span className="text-[9px] text-primary/60 font-medium">{themes[theme].name}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-border/10 overflow-hidden relative">
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${themes[theme].ambient.colors[0]}25, ${themes[theme].ambient.colors[1] || themes[theme].ambient.colors[0]}15, ${themes[theme].ambient.colors[2] || themes[theme].ambient.colors[0]}25)`,
            }}
          />
          <div className="relative flex gap-1.5">
            <div className="flex-1 h-5 rounded-lg bg-primary" />
            <div className="flex-1 h-5 rounded-lg bg-secondary" />
            <div className="flex-1 h-5 rounded-lg bg-muted" />
            <div className="flex-1 h-5 rounded-lg bg-accent" />
          </div>
          <div className="relative mt-1.5 flex gap-1.5">
            {themes[theme].ambient.colors.slice(0, 4).map((c, i) => (
              <div 
                key={i}
                className="flex-1 h-3 rounded-md"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
