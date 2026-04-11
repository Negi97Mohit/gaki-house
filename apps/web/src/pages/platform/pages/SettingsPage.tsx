import React, { useState, useEffect, useCallback } from "react";
import {
  User, Bell, Palette, Shield, Save, Loader2, Moon, Sun, Check,
  Mail, Trash2, AlertCircle, Sparkles, Radio, Users, MessageSquare,
  Zap, Send, AtSign, Eye, EyeOff, Search, ShieldCheck, Fingerprint,
  CircleUserRound, Camera, Type, FileText, ChevronRight, LayoutGrid, Monitor
} from "lucide-react";
import { cn } from "@caption-cam/core/lib/utils";
import { useAuth } from "../context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useThemeStore, themes, ThemeName, APP_FONTS, PLATFORM_LAYOUTS } from "@/features/theme";
import type { AppFont, PlatformLayout } from "@/features/theme";
import { DefaultAvatar, DEFAULT_AVATARS, getDefaultAvatar } from "../components/DefaultAvatar";

const PUBLIC_TABS = [
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

const AUTH_TABS = [
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Sparkles },
  { id: "privacy", label: "Privacy & Safety", icon: ShieldCheck },
] as const;

type TabId = "profile" | "notifications" | "appearance" | "privacy";

interface NotificationSettings {
  channelLive: boolean;
  newFollowers: boolean;
  subscriptions: boolean;
  chatMentions: boolean;
  raids: boolean;
  emailDigest: boolean;
  pushNotifications: boolean;
}

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
  const [activeTab, setActiveTab] = useState<TabId>("appearance");
  const TABS = user ? AUTH_TABS : PUBLIC_TABS;
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const { theme: currentTheme, mode, setTheme, setMode, fontFamily, setFontFamily, platformLayout, setPlatformLayout } = useThemeStore();

  const loadUserSettings = useCallback(async () => {
    if (!user) return;
    try {
      const settingsRef = doc(db, "user_settings", user.uid);
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        if (data.notifications) setNotifications((prev) => ({ ...prev, ...data.notifications }));
        if (data.privacy) setPrivacy((prev) => ({ ...prev, ...data.privacy }));
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setSelectedAvatar(profile.avatar_url || getDefaultAvatar(user?.uid || ""));
    }
  }, [profile]);

  useEffect(() => { loadUserSettings(); }, [loadUserSettings]);

  const checkUsernameUnique = useCallback(async (newUsername: string) => {
    if (!newUsername || newUsername.length < 3) {
      setUsernameError(newUsername.length > 0 && newUsername.length < 3 ? "Username must be at least 3 characters" : "");
      return;
    }
    if (!user) return;
    if (newUsername === profile?.username) { setUsernameError(""); return; }
    setCheckingUsername(true);
    try {
      const q = query(collection(db, "users"), where("username", "==", newUsername));
      const snapshot = await getDocs(q);
      const taken = snapshot.docs.some((d) => d.id !== user.uid);
      setUsernameError(taken ? "This username is already taken" : "");
    } catch (e) { console.error("Error checking username:", e); }
    finally { setCheckingUsername(false); }
  }, [user, profile?.username]);

  useEffect(() => {
    const timer = setTimeout(() => { if (username) checkUsernameUnique(username); }, 500);
    return () => clearTimeout(timer);
  }, [username, checkUsernameUnique]);

  const validTabIds = TABS.map(t => t.id);
  const effectiveTab = validTabIds.includes(activeTab) ? activeTab : "appearance";

  const handleSave = async () => {
    if (usernameError) { toast.error("Please fix username issues before saving"); return; }
    if (username.length < 3) { toast.error("Username must be at least 3 characters"); return; }
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { display_name: displayName, username, bio, avatar_url: selectedAvatar });
      toast.success("Profile saved!");
      await refreshProfile();
    } catch (error: any) { console.error("Error updating profile:", error); toast.error("Failed to save profile"); }
    finally { setSaving(false); }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "user_settings", user.uid), { notifications }, { merge: true });
      toast.success("Notification preferences saved!");
    } catch (error) { console.error("Error saving notification settings:", error); toast.error("Failed to save notification preferences"); }
  };

  const handleSavePrivacy = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "user_settings", user.uid), { privacy }, { merge: true });
      toast.success("Privacy settings saved!");
    } catch (error) { console.error("Error saving privacy settings:", error); toast.error("Failed to save privacy settings"); }
  };

  const avatarDisplayName = profile?.display_name || user?.email?.split("@")[0] || "User";

  const FEATURED_THEMES: ThemeName[] = [
    "default", "ocean", "forest", "sunset", "cyberpunk", "aurora",
    "midnight", "sakura", "volcanic", "arctic", "neon", "ethereal",
    "retro", "monochrome", "obsidian", "champagne", "emeraldNoir",
    "roseGold", "ultraviolet", "caramelLatte", "iceQueen", "midnightTokyo",
  ];

  return (
    <div className="flex h-full">
      {/* ─── Sidebar Navigation ─── */}
      <nav className="w-60 border-r border-border/20 shrink-0 hidden md:flex flex-col"
        style={{ background: "linear-gradient(180deg, hsl(var(--muted)/0.3) 0%, transparent 100%)" }}>
        <div className="p-5 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Settings</h2>
        </div>
        <div className="px-3 space-y-0.5 flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all text-left relative overflow-hidden",
                effectiveTab === tab.id
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                effectiveTab === tab.id
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
              )}>
                <tab.icon className="w-4 h-4" />
              </div>
              {tab.label}
              {effectiveTab === tab.id && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Mobile Tab Bar ─── */}
      <div className="md:hidden flex border-b border-border/20 px-1 overflow-x-auto shrink-0 absolute top-0 left-0 right-0 bg-background/80 backdrop-blur-xl z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2",
              effectiveTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Content Area ─── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-5xl">
          {/* ═══════ PROFILE ═══════ */}
          {effectiveTab === "profile" && user && (
            <div className="space-y-8">
              <SectionHeader
                icon={CircleUserRound}
                title="Profile"
                subtitle="Manage your public identity and personal information."
              />

              {/* Avatar Card */}
              <GlassCard>
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative group">
                    <img
                      src={selectedAvatar || getDefaultAvatar(user.uid)}
                      alt="Current avatar"
                      className="w-20 h-20 rounded-2xl object-cover bg-muted ring-2 ring-border/30 shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{avatarDisplayName}</p>
                    <p className="text-sm text-muted-foreground">Choose an avatar below</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                  {DEFAULT_AVATARS.map((url, i) => {
                    const isSelected = selectedAvatar === url;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedAvatar(url)}
                        className={cn(
                          "relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 hover:shadow-lg",
                          isSelected
                            ? "border-primary ring-2 ring-primary/30 scale-110 shadow-lg"
                            : "border-border/20 hover:border-primary/40"
                        )}
                      >
                        <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover bg-muted" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/25 flex items-center justify-center backdrop-blur-[1px]">
                            <Check className="w-4 h-4 text-primary drop-shadow-md" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Info Fields Card */}
              <GlassCard>
                <div className="space-y-5">
                  <ModernField icon={Type} label="Display Name">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-background/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    />
                  </ModernField>

                  <ModernField icon={AtSign} label="Username">
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        maxLength={30}
                        className={cn(
                          "w-full bg-background/50 border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 transition-all",
                          usernameError
                            ? "border-destructive focus:border-destructive focus:ring-destructive/10"
                            : "border-border/30 focus:border-primary/50 focus:ring-primary/10"
                        )}
                      />
                      {checkingUsername && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                      )}
                      {!checkingUsername && username.length >= 3 && !usernameError && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    {usernameError && (
                      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />{usernameError}
                      </p>
                    )}
                    {!usernameError && username.length >= 3 && !checkingUsername && (
                      <p className="text-xs text-emerald-500 mt-1.5 flex items-center gap-1.5">
                        <Check className="w-3 h-3" />Username is available
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1">Lowercase letters, numbers, and underscores. 3-30 characters.</p>
                  </ModernField>

                  <ModernField icon={Mail} label="Email">
                    <input
                      type="email"
                      value={user.email || ""}
                      readOnly
                      className="w-full bg-muted/30 border border-border/20 rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground/60 mt-1">Email cannot be changed here.</p>
                  </ModernField>

                  <ModernField icon={FileText} label="Bio">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      maxLength={300}
                      placeholder="Tell viewers about yourself..."
                      className="w-full bg-background/50 border border-border/30 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                    />
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground/60">{bio.length}/300</span>
                    </div>
                  </ModernField>
                </div>
              </GlassCard>

              <SaveButton onClick={handleSave} loading={saving} disabled={saving || !!usernameError || checkingUsername}>
                Save Profile
              </SaveButton>
            </div>
          )}

          {/* ═══════ NOTIFICATIONS ═══════ */}
          {effectiveTab === "notifications" && user && (
            <div className="space-y-8">
              <SectionHeader
                icon={Bell}
                title="Notifications"
                subtitle="Choose what you want to be notified about."
              />

              <SettingsGroup icon={Radio} title="Stream Notifications" description="Stay updated when channels go live">
                <ToggleRow
                  icon={Radio}
                  label="Channel goes live"
                  description="Get notified when a followed channel starts streaming"
                  checked={notifications.channelLive}
                  onChange={(v) => setNotifications((p) => ({ ...p, channelLive: v }))}
                />
                <ToggleRow
                  icon={Zap}
                  label="Raids"
                  description="Get notified when someone raids your channel"
                  checked={notifications.raids}
                  onChange={(v) => setNotifications((p) => ({ ...p, raids: v }))}
                />
              </SettingsGroup>

              <SettingsGroup icon={Users} title="Social Notifications" description="People interactions and engagement">
                <ToggleRow
                  icon={Users}
                  label="New followers"
                  description="Get notified when someone follows you"
                  checked={notifications.newFollowers}
                  onChange={(v) => setNotifications((p) => ({ ...p, newFollowers: v }))}
                />
                <ToggleRow
                  icon={Sparkles}
                  label="Subscriptions"
                  description="Get notified about new subscribers"
                  checked={notifications.subscriptions}
                  onChange={(v) => setNotifications((p) => ({ ...p, subscriptions: v }))}
                />
                <ToggleRow
                  icon={MessageSquare}
                  label="Chat mentions"
                  description="Get notified when someone mentions you in chat"
                  checked={notifications.chatMentions}
                  onChange={(v) => setNotifications((p) => ({ ...p, chatMentions: v }))}
                />
              </SettingsGroup>

              <SettingsGroup icon={Send} title="Delivery" description="How you receive notifications">
                <ToggleRow
                  icon={Send}
                  label="Push notifications"
                  description="Receive browser push notifications"
                  checked={notifications.pushNotifications}
                  onChange={(v) => setNotifications((p) => ({ ...p, pushNotifications: v }))}
                />
                <ToggleRow
                  icon={Mail}
                  label="Email digest"
                  description="Receive a weekly summary of activity"
                  checked={notifications.emailDigest}
                  onChange={(v) => setNotifications((p) => ({ ...p, emailDigest: v }))}
                />
              </SettingsGroup>

              <SaveButton onClick={handleSaveNotifications}>Save Preferences</SaveButton>
            </div>
          )}

          {/* ═══════ APPEARANCE ═══════ */}
          {effectiveTab === "appearance" && (
            <div className="space-y-8">
              <SectionHeader
                icon={Sparkles}
                title="Appearance"
                subtitle="Customize how the platform looks for you."
              />

              {/* Color Mode - Minimal toggle */}
              <GlassCard>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      {mode === "dark" ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Color Mode</h3>
                      <p className="text-xs text-muted-foreground">{mode === "dark" ? "Dark mode" : "Light mode"}</p>
                    </div>
                  </div>
                  <div className="flex bg-muted/50 rounded-xl p-1 gap-0.5">
                    {([
                      { id: "light" as const, icon: Sun },
                      { id: "dark" as const, icon: Moon },
                    ]).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={cn(
                          "flex items-center justify-center w-9 h-9 rounded-lg transition-all",
                          mode === m.id
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <m.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Theme Grid - Compact gradient pills */}
              <GlassCard>
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Palette className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Theme
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {FEATURED_THEMES.map((themeKey) => {
                    const config = themes[themeKey];
                    const isActive = currentTheme === themeKey;
                    const colors = config.ambient.colors.slice(0, 3);
                    return (
                      <button
                        key={themeKey}
                        onClick={() => setTheme(themeKey)}
                        className={cn(
                          "group relative flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all",
                          isActive
                            ? "border-primary ring-1 ring-primary/30 bg-primary/5"
                            : "border-border/10 hover:border-border/40 bg-transparent"
                        )}
                      >
                        {/* Gradient swatch */}
                        <div
                          className="w-full h-8 rounded-lg shadow-inner overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${colors.join(", ")})`,
                          }}
                        />
                        <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center leading-tight">
                          {config.name}
                        </span>
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-sm">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Font Family */}
              <GlassCard>
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Type className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Font Family
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {APP_FONTS.map((font) => {
                    const isActive = fontFamily === font;
                    const displayName = font === "geist-sans" ? "Geist Sans" : font;
                    return (
                      <button
                        key={font}
                        onClick={() => setFontFamily(font)}
                        className={cn(
                          "relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left",
                          isActive
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border/10 hover:border-border/40"
                        )}
                      >
                        <span
                          className="text-lg font-semibold text-foreground leading-none"
                          style={{ fontFamily: font === "geist-sans" ? "geist-sans" : `"${font}", sans-serif` }}
                        >
                          Aa
                        </span>
                        <span className="text-[11px] font-medium text-muted-foreground truncate">
                          {displayName}
                        </span>
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Platform Layout */}
              <GlassCard>
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                  </div>
                  Platform Layout
                </h3>

                {/* Group by category */}
                {["Classic", "Streaming"].map((category) => {
                  const categoryLayouts = PLATFORM_LAYOUTS.filter((l) => l.category === category);
                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">{category}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
                        {categoryLayouts.map((layout) => {
                          const isActive = platformLayout === layout.id;
                          return (
                            <button
                              key={layout.id}
                              onClick={() => setPlatformLayout(layout.id)}
                              className={cn(
                                "group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                isActive
                                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                  : "border-border/10 hover:border-border/40"
                              )}
                            >
                              <LayoutPreview type={layout.id} isActive={isActive} />
                              <div className="text-center">
                                <span className="text-xs font-semibold text-foreground block">{layout.label}</span>
                                <span className="text-[10px] text-muted-foreground">{layout.description}</span>
                              </div>
                              {isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </GlassCard>
            </div>
          )}

          {/* ═══════ PRIVACY & SAFETY ═══════ */}
          {effectiveTab === "privacy" && user && (
            <div className="space-y-8">
              <SectionHeader
                icon={ShieldCheck}
                title="Privacy & Safety"
                subtitle="Control your privacy and safety settings."
              />

              <SettingsGroup icon={MessageSquare} title="Communication" description="Control who can contact you">
                <ToggleRow
                  icon={EyeOff}
                  label="Block whispers from strangers"
                  description="Only allow whispers from people you follow"
                  checked={privacy.blockWhispers}
                  onChange={(v) => setPrivacy((p) => ({ ...p, blockWhispers: v }))}
                />
                <ToggleRow
                  icon={Eye}
                  label="Hide activity status"
                  description="Don't show when you're online"
                  checked={privacy.hideActivity}
                  onChange={(v) => setPrivacy((p) => ({ ...p, hideActivity: v }))}
                />
              </SettingsGroup>

              <SettingsGroup icon={Shield} title="Content" description="Manage content preferences">
                <ToggleRow
                  icon={ShieldCheck}
                  label="Mature content filter"
                  description="Hide streams marked as mature"
                  checked={privacy.matureFilter}
                  onChange={(v) => setPrivacy((p) => ({ ...p, matureFilter: v }))}
                />
                <ToggleRow
                  icon={Eye}
                  label="Show watch history"
                  description="Keep a record of streams you've watched"
                  checked={privacy.showWatchHistory}
                  onChange={(v) => setPrivacy((p) => ({ ...p, showWatchHistory: v }))}
                />
              </SettingsGroup>

              <SettingsGroup icon={Search} title="Discovery" description="Control how others find you">
                <ToggleRow
                  icon={Search}
                  label="Allow profile discovery"
                  description="Let others find your profile through search"
                  checked={privacy.allowDiscovery}
                  onChange={(v) => setPrivacy((p) => ({ ...p, allowDiscovery: v }))}
                />
              </SettingsGroup>

              <SettingsGroup icon={Fingerprint} title="Security" description="Protect your account">
                <ToggleRow
                  icon={Fingerprint}
                  label="Two-factor authentication"
                  description="Add an extra layer of security to your account"
                  checked={privacy.twoFactorAuth}
                  onChange={(v) => {
                    setPrivacy((p) => ({ ...p, twoFactorAuth: v }));
                    if (v) toast.info("2FA setup would be triggered here");
                  }}
                />
              </SettingsGroup>

              {/* Danger Zone */}
              <div className="rounded-2xl border border-destructive/20 bg-destructive/[0.03] p-6">
                <h3 className="text-sm font-bold text-destructive mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                  </div>
                  Danger Zone
                </h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/15 bg-background/50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Delete Account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Permanently delete your account and all data.</p>
                  </div>
                  <button
                    onClick={() => toast.error("Account deletion requires confirmation via email.")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-destructive text-destructive-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-all hover:shadow-lg hover:shadow-destructive/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <SaveButton onClick={handleSavePrivacy}>Save Settings</SaveButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Reusable Components ─── */

const SectionHeader: React.FC<{ icon: React.ElementType; title: string; subtitle: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-4 pb-6 border-b border-border/15">
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm shrink-0 mt-0.5">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn(
    "rounded-2xl border border-border/15 bg-muted/[0.08] p-6 backdrop-blur-sm",
    className
  )}>
    {children}
  </div>
);

const SettingsGroup: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, description, children }) => (
  <GlassCard>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <div className="space-y-2">
      {children}
    </div>
  </GlassCard>
);

const ModernField: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      {label}
    </label>
    {children}
  </div>
);

const SaveButton: React.FC<{
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ onClick, loading, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="group flex items-center gap-2.5 px-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
  >
    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
    {loading ? "Saving..." : children}
  </button>
);

const ToggleRow: React.FC<{
  icon?: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ icon: Icon, label, description, checked, onChange }) => (
  <div className="group flex items-center justify-between py-3.5 px-4 rounded-xl hover:bg-muted/30 transition-all cursor-pointer"
    onClick={() => onChange(!checked)}>
    <div className="flex items-center gap-3.5 mr-6">
      {Icon && (
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
          checked ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
        )}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div>
        <p className="text-[14px] font-semibold text-foreground leading-tight">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
      aria-checked={checked}
      role="switch"
      className={cn(
        "w-12 h-7 rounded-full transition-all duration-300 relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        checked
          ? "bg-primary shadow-[0_0_12px_-2px_hsl(var(--primary)/0.4)]"
          : "bg-muted-foreground/20"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] w-[22px] h-[22px] rounded-full transition-all duration-300 shadow-sm",
          checked
            ? "translate-x-[22px] bg-primary-foreground shadow-md"
            : "translate-x-[3px] bg-foreground/60"
        )}
      />
    </button>
  </div>
);

const LayoutPreview: React.FC<{ type: PlatformLayout; isActive: boolean }> = ({ type, isActive }) => {
  const barColor = isActive ? "bg-primary/40" : "bg-muted-foreground/20";
  const blockColor = isActive ? "bg-primary/25" : "bg-muted-foreground/10";

  const layouts: Record<PlatformLayout, React.ReactNode> = {
    default: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-3 h-full rounded-sm", barColor)} />
        <div className="flex-1 flex flex-col gap-0.5">
          <div className={cn("h-5 rounded-sm", blockColor)} />
          <div className="flex-1 grid grid-cols-3 gap-0.5">
            <div className={cn("rounded-sm", blockColor)} />
            <div className={cn("rounded-sm", blockColor)} />
            <div className={cn("rounded-sm", blockColor)} />
          </div>
        </div>
      </div>
    ),
    compact: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-2 h-full rounded-sm", barColor)} />
        <div className="flex-1 grid grid-cols-4 gap-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cn("rounded-sm", blockColor)} />
          ))}
        </div>
      </div>
    ),
    cozy: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-3 h-full rounded-sm", barColor)} />
        <div className="flex-1 grid grid-cols-2 gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("rounded-sm", blockColor)} />
          ))}
        </div>
      </div>
    ),
    theater: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-1.5 h-full rounded-sm", barColor)} />
        <div className="flex-1 flex flex-col gap-0.5">
          <div className={cn("h-6 w-full rounded-sm", blockColor)} />
          <div className="flex-1 grid grid-cols-4 gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={cn("rounded-sm", blockColor)} />
            ))}
          </div>
        </div>
      </div>
    ),
    magazine: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-2 h-full rounded-sm", barColor)} />
        <div className="flex-1 flex gap-0.5">
          <div className={cn("w-1/2 rounded-sm", blockColor)} />
          <div className="w-1/2 flex flex-col gap-0.5">
            <div className={cn("flex-1 rounded-sm", blockColor)} />
            <div className={cn("flex-1 rounded-sm", blockColor)} />
            <div className={cn("flex-1 rounded-sm", blockColor)} />
          </div>
        </div>
      </div>
    ),
    cinematic: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-1.5 h-full rounded-sm", barColor)} />
        <div className="flex-1 flex flex-col gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("flex-1 rounded-sm", blockColor)} />
          ))}
        </div>
      </div>
    ),
    mosaic: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-2 h-full rounded-sm", barColor)} />
        <div className="flex-1 flex gap-0.5">
          <div className="flex-1 flex flex-col gap-0.5">
            <div className={cn("h-7 rounded-sm", blockColor)} />
            <div className={cn("flex-1 rounded-sm", blockColor)} />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className={cn("h-4 rounded-sm", blockColor)} />
            <div className={cn("flex-1 rounded-sm", blockColor)} />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <div className={cn("h-6 rounded-sm", blockColor)} />
            <div className={cn("flex-1 rounded-sm", blockColor)} />
          </div>
        </div>
      </div>
    ),
    feed: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-1.5 h-full rounded-sm", barColor)} />
        <div className="flex-1 flex justify-center">
          <div className="w-2/3 flex flex-col gap-0.5">
            <div className={cn("h-5 rounded-sm", blockColor)} />
            <div className={cn("h-5 rounded-sm", blockColor)} />
          </div>
        </div>
      </div>
    ),
    // ── Streaming-inspired layouts ──
    netflix: (
      <div className="w-full h-12 flex flex-col gap-0.5">
        <div className={cn("h-5 w-full rounded-sm", blockColor)} />
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn("flex-1 rounded-sm", blockColor)} style={{ height: "100%" }} />
          ))}
        </div>
      </div>
    ),
    youtube: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-2 h-full rounded-sm", barColor)} />
        <div className="flex-1 grid grid-cols-3 gap-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-px">
              <div className={cn("flex-[2] rounded-sm", blockColor)} />
              <div className={cn("flex-1 rounded-sm", isActive ? "bg-primary/15" : "bg-muted-foreground/5")} />
            </div>
          ))}
        </div>
      </div>
    ),
    hbo: (
      <div className="w-full h-12 flex flex-col gap-0.5">
        <div className={cn("h-6 w-full rounded-sm", blockColor)} />
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex-1 rounded-sm", blockColor)} />
          ))}
        </div>
      </div>
    ),
    appletv: (
      <div className="w-full h-12 flex flex-col gap-0.5">
        <div className={cn("h-4 w-full rounded-sm", blockColor)} />
        <div className="flex-1 grid grid-cols-3 gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("rounded-md", blockColor)} />
          ))}
        </div>
      </div>
    ),
    disneyplus: (
      <div className="w-full h-12 flex flex-col gap-0.5">
        <div className={cn("h-3 w-full rounded-full", blockColor)} />
        <div className="flex-1 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn("flex-1 rounded-lg", blockColor)} />
          ))}
        </div>
      </div>
    ),
    spotify: (
      <div className="w-full h-12 flex gap-0.5">
        <div className={cn("w-2 h-full rounded-sm", barColor)} />
        <div className="flex-1 grid grid-cols-4 gap-0.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={cn("rounded-md aspect-square", blockColor)} />
          ))}
        </div>
      </div>
    ),
  };

  return <div className="w-full">{layouts[type]}</div>;
};
