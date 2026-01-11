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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-1 pb-4 mb-4 border-b border-border/10">
        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Settings</h2>
          <p className="text-[10px] text-muted-foreground/60">Customize your experience</p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-1 pb-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.03]"
              )}
            >
              <Icon className="w-3 h-3" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {activeSection === "appearance" && <ThemeSwitcher />}
        
        {activeSection === "display" && (
          <SettingsPlaceholder 
            icon={Monitor} 
            title="Display Settings" 
            description="Resolution, frame rate, and canvas options coming soon"
          />
        )}
        
        {activeSection === "audio" && (
          <SettingsPlaceholder 
            icon={Volume2} 
            title="Audio Settings" 
            description="Microphone, speakers, and audio levels coming soon"
          />
        )}
        
        {activeSection === "shortcuts" && (
          <SettingsPlaceholder 
            icon={Keyboard} 
            title="Keyboard Shortcuts" 
            description="Customizable hotkeys coming soon"
          />
        )}
        
        {activeSection === "about" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.02] border border-border/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Streaming Studio</h3>
                  <p className="text-[10px] text-muted-foreground/60">Version 1.0.0</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                A professional streaming and content creation studio with dynamic layouts, 
                real-time effects, and AI-powered features.
              </p>
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
