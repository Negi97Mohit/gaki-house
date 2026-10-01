import { useThemeStore, themes, ThemeName } from "../model/theme.store";
import { Moon, Sun, Check, Sparkles } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { ScrollArea } from "@gaki/ui/scroll-area";

export function ThemeSwitcher() {
  const { theme, mode, setTheme, toggleMode } = useThemeStore();

  return (
    <div className="space-y-3.5 w-full antialiased">
      {/* Mode Toggle - Elegant Card */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[12px] font-semibold text-white tracking-tight">Appearance Mode</span>
            <p className="text-[10px] text-zinc-400 font-normal mt-0.5">Switch between light and dark studio atmosphere</p>
          </div>
          <button
            onClick={toggleMode}
            className={cn(
              "relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-200",
              "bg-white/[0.04] hover:bg-white/[0.08] text-white",
              "border border-white/15 hover:border-primary/50 shadow-sm active:scale-95"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-lg flex items-center justify-center transition-colors",
              mode === "dark" ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-400"
            )}>
              {mode === "dark" ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="capitalize">{mode}</span>
          </button>
        </div>
      </div>

      {/* Theme Grid */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-semibold text-white tracking-tight">Color Themes</span>
          </div>
          <span className="text-[10px] font-mono font-medium text-zinc-400 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
            {Object.keys(themes).length} themes
          </span>
        </div>
        
        <ScrollArea className="h-[260px] slim-scrollbar" style={{ scrollbarWidth: 'none' }}>
          <div className="grid grid-cols-2 gap-2 pr-1">
            {(Object.keys(themes) as ThemeName[]).map((key) => {
              const t = themes[key];
              const isActive = theme === key;
              const color = mode === "dark" ? t.colors.dark : t.colors.light;

              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={cn(
                    "group relative flex flex-col p-2.5 rounded-xl transition-all duration-200 text-left border",
                    isActive
                      ? "border-primary bg-primary/[0.08] ring-1 ring-primary/40 shadow-md shadow-primary/20"
                      : "border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.05]"
                  )}
                >
                  {/* Color preview bar */}
                  <div className="w-full h-7 rounded-lg overflow-hidden mb-2 relative shadow-inner">
                    <div 
                      className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                      style={{
                        background: `linear-gradient(135deg, ${t.ambient.colors[0]}60, ${t.ambient.colors[1] || t.ambient.colors[0]}45, ${t.ambient.colors[2] || t.ambient.colors[0]}60)`,
                      }}
                    />
                    {/* Color dots */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                      {t.ambient.colors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full shadow-md ring-1 ring-black/40"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Label + Thin Underline when Active */}
                  <div className="relative flex items-center gap-1.5 w-full pb-0.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: isActive ? `0 0 10px ${color}` : 'none',
                      }}
                    />
                    <span className={cn(
                      "text-[11px] font-semibold tracking-tight truncate transition-colors",
                      isActive ? "text-primary" : "text-white"
                    )}>
                      {t.name}
                    </span>

                    {isActive && (
                      <span className="absolute -bottom-0.5 left-4 right-2 h-[1.5px] bg-primary rounded-full shadow-[0_0_6px_var(--primary)]" />
                    )}
                  </div>

                  {/* Check mark */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Type badge */}
                  <div 
                    className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold border border-white/10"
                    style={{
                      backgroundColor: `${color}25`,
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

      {/* Live Preview - Ambient Card */}
      <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-zinc-300">Theme Atmosphere</span>
          <span className="text-[11px] font-semibold text-primary">{themes[theme].name}</span>
        </div>
        <div className="p-3 rounded-xl border border-white/10 overflow-hidden relative shadow-inner">
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${themes[theme].ambient.colors[0]}35, ${themes[theme].ambient.colors[1] || themes[theme].ambient.colors[0]}25, ${themes[theme].ambient.colors[2] || themes[theme].ambient.colors[0]}35)`,
            }}
          />
          <div className="relative flex gap-2">
            <div className="flex-1 h-5 rounded-lg bg-primary shadow-sm" />
            <div className="flex-1 h-5 rounded-lg bg-secondary shadow-sm" />
            <div className="flex-1 h-5 rounded-lg bg-muted shadow-sm" />
            <div className="flex-1 h-5 rounded-lg bg-accent shadow-sm" />
          </div>
          <div className="relative mt-2 flex gap-1.5">
            {themes[theme].ambient.colors.slice(0, 4).map((c, i) => (
              <div 
                key={i}
                className="flex-1 h-3 rounded-md shadow-sm"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
