import { ThemeSwitcher } from "@/features/theme";
import { Palette } from "lucide-react";

export function SettingsPanel() {
  return (
    <div className="space-y-6">
      {/* Theme Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-mono font-bold tracking-wider text-primary">
          <Palette className="w-4 h-4" />
          <span>THEME</span>
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
