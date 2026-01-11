import { ThemeSwitcher } from "@/features/theme";
import { Settings, Palette, Monitor, Volume2, Keyboard, Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";

type SettingsSection = "appearance" | "display" | "audio" | "shortcuts" | "about";

const sections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "display", label: "Display", icon: Monitor },
  { id: "audio", label: "Audio", icon: Volume2 },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "about", label: "About", icon: Info },
];

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Section Navigation - Compact */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-border/10" style={{ scrollbarWidth: 'none' }}>
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Icon className="w-3 h-3" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'none' }}>
        {activeSection === "appearance" && <ThemeSwitcher />}
        
        {activeSection === "display" && (
          <SettingsPlaceholder 
            icon={Monitor} 
            title="Display" 
            description="Coming soon"
          />
        )}
        
        {activeSection === "audio" && (
          <SettingsPlaceholder 
            icon={Volume2} 
            title="Audio" 
            description="Coming soon"
          />
        )}
        
        {activeSection === "shortcuts" && (
          <SettingsPlaceholder 
            icon={Keyboard} 
            title="Shortcuts" 
            description="Coming soon"
          />
        )}
        
        {activeSection === "about" && (
          <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">✨</span>
              <div>
                <h3 className="text-xs font-semibold">Streaming Studio</h3>
                <p className="text-[9px] text-muted-foreground/60">v1.0.0</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPlaceholder({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.03] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-muted-foreground/40" />
      </div>
      <h3 className="text-sm font-medium text-muted-foreground/70 mb-1">{title}</h3>
      <p className="text-[10px] text-muted-foreground/50 max-w-[200px]">{description}</p>
    </div>
  );
}
