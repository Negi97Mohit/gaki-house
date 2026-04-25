import { Video, Radio, Settings, User, Compass, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "studio" | "discover" | "remote" | "destinations" | "settings";

interface BottomNavProps {
  activeDrawer: "discover" | "remote" | "destinations" | "settings" | null;
  onChange: (tab: Tab) => void;
  onProfileClick: () => void;
}

const tabs: { id: Tab; label: string; icon: typeof Video }[] = [
  { id: "studio", label: "Studio", icon: Video },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "remote", label: "Remote", icon: Gamepad2 },
  { id: "destinations", label: "Destinations", icon: Radio },
  { id: "settings", label: "Settings", icon: Settings },
];

const BottomNav = ({ activeDrawer, onChange, onProfileClick }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom pointer-events-none flex justify-center px-4 pb-4">
      <div className="pointer-events-auto bg-white/20 backdrop-blur-lg border border-white/40 rounded-full shadow-float flex items-center gap-1 px-2 py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = id === "studio" ? activeDrawer === null : activeDrawer === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-label={label}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90",
                isActive
                  ? "bg-white/70 text-neutral-900 shadow-soft"
                  : "text-neutral-800 hover:text-black"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </button>
          );
        })}

        <div className="h-6 w-px bg-white/40 mx-1" />

        <button
          onClick={onProfileClick}
          aria-label="Profile"
          className="h-10 w-10 rounded-full flex items-center justify-center bg-white/30 backdrop-blur-lg border border-white/40 text-neutral-900 shadow-soft transition-transform active:scale-90"
        >
          <User className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
