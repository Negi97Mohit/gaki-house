import React, { useState } from "react";
import { User, Bell, Palette, Shield, Save } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy & Safety", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [displayName, setDisplayName] = useState("Your Display Name");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar Tabs */}
      <nav className="w-56 border-r border-border/30 p-4 space-y-1 shrink-0 hidden md:block">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
              activeTab === tab.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-b border-border/30 px-2 overflow-x-auto shrink-0 absolute top-0 left-0 right-0 bg-background z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-2xl">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Manage your public profile information.</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                  Upload Avatar
                </button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB.</p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell viewers about yourself..."
                className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{bio.length}/300</p>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Notifications</h2>
              <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
            </div>
            {[
              { label: "Channel goes live", desc: "Get notified when a followed channel starts streaming", default: true },
              { label: "New followers", desc: "Get notified when someone follows you", default: true },
              { label: "Subscriptions", desc: "Get notified about new subscribers", default: true },
              { label: "Chat mentions", desc: "Get notified when someone mentions you in chat", default: false },
              { label: "Raids", desc: "Get notified when someone raids your channel", default: true },
            ].map((item) => (
              <ToggleRow key={item.label} label={item.label} description={item.desc} defaultChecked={item.default} />
            ))}
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how the platform looks for you.</p>
            </div>
            <ToggleRow label="Dark Mode" description="Use dark theme across the platform" defaultChecked={true} />
            <ToggleRow label="Compact Layout" description="Show more content with smaller cards" defaultChecked={false} />
            <ToggleRow label="Animated Thumbnails" description="Autoplay thumbnail previews on hover" defaultChecked={true} />
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Privacy & Safety</h2>
              <p className="text-sm text-muted-foreground">Control your privacy and safety settings.</p>
            </div>
            <ToggleRow label="Block whispers from strangers" description="Only allow whispers from people you follow" defaultChecked={false} />
            <ToggleRow label="Hide activity status" description="Don't show when you're online" defaultChecked={false} />
            <ToggleRow label="Mature content filter" description="Hide streams marked as mature" defaultChecked={true} />
          </div>
        )}
      </div>
    </div>
  );
};

const ToggleRow: React.FC<{ label: string; description: string; defaultChecked: boolean }> = ({
  label,
  description,
  defaultChecked,
}) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/20">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-10 h-6 rounded-full transition-colors relative",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full bg-primary-foreground transition-transform",
            checked ? "translate-x-5" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
};
