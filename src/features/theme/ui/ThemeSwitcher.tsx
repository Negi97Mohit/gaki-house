import { useThemeStore, themes, ThemeName } from "../model/theme.store";
import { Moon, Sun, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
        <span className="text-sm font-medium text-foreground mb-3 block">Color Theme</span>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(themes) as ThemeName[]).map((key) => {
            const t = themes[key];
            const isActive = theme === key;
            const color = mode === "dark" ? t.colors.dark : t.colors.light;

            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={cn(
                  "relative flex items-center gap-3 p-3 rounded-xl border transition-all",
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                {/* Color swatch */}
                <div
                  className="w-8 h-8 rounded-lg shadow-sm"
                  style={{ backgroundColor: color }}
                />
                
                {/* Label */}
                <span className="text-sm font-medium">{t.name}</span>

                {/* Check mark */}
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">Preview</span>
        <div className="mt-2 flex gap-2">
          <div className="flex-1 h-8 rounded-lg bg-primary" />
          <div className="flex-1 h-8 rounded-lg bg-secondary" />
          <div className="flex-1 h-8 rounded-lg bg-muted" />
          <div className="flex-1 h-8 rounded-lg bg-accent" />
        </div>
      </div>
    </div>
  );
}
