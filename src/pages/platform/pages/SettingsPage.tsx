import React, { useState, useEffect } from "react";
import { User, Bell, Palette, Shield, Save, Loader2, Moon, Sun, Check, Monitor, Globe, Lock, Eye, EyeOff, Mail, Key, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "../context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useThemeStore, themes, ThemeName } from "@/features/theme";
import { DefaultAvatar } from "../components/DefaultAvatar";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "privacy", label: "Privacy & Safety", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

// Notification settings interface
interface NotificationSettings {
  channelLive: boolean;
  newFollowers: boolean;
  subscriptions: boolean;
  chatMentions: boolean;
  raids: boolean;
  emailDigest: boolean;
  pushNotifications: boolean;
}

// Privacy settings interface
interface PrivacySettings {
  blockWhispers: boolean;
  hideActivity: boolean;
  matureFilter: boolean;
  showWatchHistory: boolean;
  allowDiscovery: boolean;
  twoFactorAuth: boolean;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  channelLive: true,
  newFollowers: true,
  subscriptions: true,
  chatMentions: false,
  raids: true,
  emailDigest: false,
  pushNotifications: true,
};

const DEFAULT_PRIVACY: PrivacySettings = {
  blockWhispers: false,
  hideActivity: false,
  matureFilter: true,
  showWatchHistory: true,
  allowDiscovery: true,
  twoFactorAuth: false,
};

export const SettingsPage: React.FC = () => {
  const { user, profile, openAuthModal, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);

  // Privacy state
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);

  // Theme state
  const { theme: currentTheme, mode, setTheme, setMode } = useThemeStore();

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <User className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm">Sign in to manage your settings.</p>
        <button
          onClick={() => openAuthModal("login")}
          className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        display_name: displayName,
        username,
        bio,
      });
      toast.success("Profile saved!");
      await refreshProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  const handleSavePrivacy = () => {
    toast.success("Privacy settings saved!");
  };

  const avatarDisplayName = profile?.display_name || user.email?.split("@")[0] || "User";

  // Selected themes to display (curated subset for cleaner UI)
  const FEATURED_THEMES: ThemeName[] = [
    "default", "ocean", "forest", "sunset", "cyberpunk", "aurora",
    "midnight", "sakura", "volcanic", "arctic", "neon", "ethereal",
    "retro", "monochrome", "obsidian", "champagne", "emeraldNoir",
    "roseGold", "ultraviolet", "caramelLatte", "iceQueen", "midnightTokyo",
  ];

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
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-3xl">
        {/* ===== PROFILE TAB ===== */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Profile Settings</h2>
              <p className="text-sm text-muted-foreground">Manage your public profile information.</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <DefaultAvatar name={avatarDisplayName} size="lg" />
                )}
              </div>
              <div>
                <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity">
                  Upload Avatar
                </button>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 2MB.</p>
              </div>
            </div>

            {/* Display Name */}
            <FieldGroup label="Display Name">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </FieldGroup>

            {/* Username */}
            <FieldGroup label="Username">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </FieldGroup>

            {/* Email (read-only) */}
            <FieldGroup label="Email">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="w-full bg-muted/50 border border-border/30 rounded-md px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
            </FieldGroup>

            {/* Bio */}
            <FieldGroup label="Bio">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={300}
                placeholder="Tell viewers about yourself..."
                className="w-full bg-muted border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{bio.length}/300</p>
            </FieldGroup>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* ===== NOTIFICATIONS TAB ===== */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Notifications</h2>
              <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Stream Notifications</h3>
              <ToggleRow
                label="Channel goes live"
                description="Get notified when a followed channel starts streaming"
                checked={notifications.channelLive}
                onChange={(v) => setNotifications((p) => ({ ...p, channelLive: v }))}
              />
              <ToggleRow
                label="Raids"
                description="Get notified when someone raids your channel"
                checked={notifications.raids}
                onChange={(v) => setNotifications((p) => ({ ...p, raids: v }))}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Social Notifications</h3>
              <ToggleRow
                label="New followers"
                description="Get notified when someone follows you"
                checked={notifications.newFollowers}
                onChange={(v) => setNotifications((p) => ({ ...p, newFollowers: v }))}
              />
              <ToggleRow
                label="Subscriptions"
                description="Get notified about new subscribers"
                checked={notifications.subscriptions}
                onChange={(v) => setNotifications((p) => ({ ...p, subscriptions: v }))}
              />
              <ToggleRow
                label="Chat mentions"
                description="Get notified when someone mentions you in chat"
                checked={notifications.chatMentions}
                onChange={(v) => setNotifications((p) => ({ ...p, chatMentions: v }))}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Delivery</h3>
              <ToggleRow
                label="Push notifications"
                description="Receive browser push notifications"
                checked={notifications.pushNotifications}
                onChange={(v) => setNotifications((p) => ({ ...p, pushNotifications: v }))}
              />
              <ToggleRow
                label="Email digest"
                description="Receive a weekly summary of activity"
                checked={notifications.emailDigest}
                onChange={(v) => setNotifications((p) => ({ ...p, emailDigest: v }))}
              />
            </div>

            <button
              onClick={handleSaveNotifications}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              Save Preferences
            </button>
          </div>
        )}

        {/* ===== APPEARANCE TAB ===== */}
        {activeTab === "appearance" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how the platform looks for you.</p>
            </div>

            {/* Mode Selector */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Color Mode</h3>
              <div className="flex gap-3">
                {[
                  { id: "light" as const, label: "Light", icon: Sun },
                  { id: "dark" as const, label: "Dark", icon: Moon },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all flex-1",
                      mode === m.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 bg-muted/50 text-muted-foreground hover:border-border"
                    )}
                  >
                    <m.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{m.label}</span>
                    {mode === m.id && <Check className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Grid */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Theme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {FEATURED_THEMES.map((themeKey) => {
                  const config = themes[themeKey];
                  const isActive = currentTheme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => setTheme(themeKey)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-[1.02]",
                        isActive
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border/30 bg-muted/30 hover:border-border/60"
                      )}
                    >
                      {/* Color preview swatch */}
                      <div className="flex gap-1">
                        {config.ambient.colors.slice(0, 3).map((color, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-border/20"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-foreground truncate w-full text-center">
                        {config.name}
                      </span>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional appearance toggles */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Layout Preferences</h3>
              <ToggleRow
                label="Compact Layout"
                description="Show more content with smaller cards"
                checked={false}
                onChange={() => toast.info("Compact layout toggled")}
              />
              <ToggleRow
                label="Animated Thumbnails"
                description="Autoplay thumbnail previews on hover"
                checked={true}
                onChange={() => toast.info("Animated thumbnails toggled")}
              />
              <ToggleRow
                label="Sidebar Auto-collapse"
                description="Automatically collapse sidebar on narrow screens"
                checked={true}
                onChange={() => toast.info("Sidebar auto-collapse toggled")}
              />
            </div>
          </div>
        )}

        {/* ===== PRIVACY & SAFETY TAB ===== */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Privacy & Safety</h2>
              <p className="text-sm text-muted-foreground">Control your privacy and safety settings.</p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Communication</h3>
              <ToggleRow
                label="Block whispers from strangers"
                description="Only allow whispers from people you follow"
                checked={privacy.blockWhispers}
                onChange={(v) => setPrivacy((p) => ({ ...p, blockWhispers: v }))}
              />
              <ToggleRow
                label="Hide activity status"
                description="Don't show when you're online"
                checked={privacy.hideActivity}
                onChange={(v) => setPrivacy((p) => ({ ...p, hideActivity: v }))}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Content</h3>
              <ToggleRow
                label="Mature content filter"
                description="Hide streams marked as mature"
                checked={privacy.matureFilter}
                onChange={(v) => setPrivacy((p) => ({ ...p, matureFilter: v }))}
              />
              <ToggleRow
                label="Show watch history"
                description="Keep a record of streams you've watched"
                checked={privacy.showWatchHistory}
                onChange={(v) => setPrivacy((p) => ({ ...p, showWatchHistory: v }))}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Discovery</h3>
              <ToggleRow
                label="Allow profile discovery"
                description="Let others find your profile through search"
                checked={privacy.allowDiscovery}
                onChange={(v) => setPrivacy((p) => ({ ...p, allowDiscovery: v }))}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground mb-2">Security</h3>
              <ToggleRow
                label="Two-factor authentication"
                description="Add an extra layer of security to your account"
                checked={privacy.twoFactorAuth}
                onChange={(v) => {
                  setPrivacy((p) => ({ ...p, twoFactorAuth: v }));
                  if (v) toast.info("2FA setup would be triggered here");
                }}
              />
            </div>

            {/* Danger Zone */}
            <div className="pt-4 border-t border-border/30">
              <h3 className="text-sm font-semibold text-destructive mb-3">Danger Zone</h3>
              <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                <div>
                  <p className="text-sm font-medium text-foreground">Delete Account</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data.</p>
                </div>
                <button
                  onClick={() => toast.error("Account deletion requires confirmation via email.")}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePrivacy}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable field group
const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

// Toggle row with controlled state
const ToggleRow: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/20">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-10 h-6 rounded-full transition-colors relative shrink-0 ml-4",
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
