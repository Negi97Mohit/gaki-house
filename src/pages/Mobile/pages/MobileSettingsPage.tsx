import React, { useState, useEffect, useCallback } from "react";
import { User, Bell, Palette, Shield, Save, Loader2, Moon, Sun, Check, ArrowLeft, ChevronRight, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { useThemeStore, themes, ThemeName } from "@/features/theme";
import { DEFAULT_AVATARS, getDefaultAvatar } from "@/pages/platform/components/DefaultAvatar";
import { useNavigate } from "react-router-dom";

type SectionId = "profile" | "notifications" | "appearance" | "privacy" | null;

const FEATURED_THEMES: ThemeName[] = [
    "default", "ocean", "forest", "sunset", "cyberpunk", "aurora",
    "midnight", "sakura", "volcanic", "arctic", "neon", "ethereal",
];

export const MobileSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, openAuthModal, refreshProfile } = useAuth();
    const [expandedSection, setExpandedSection] = useState<SectionId>(null);
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [checkingUsername, setCheckingUsername] = useState(false);

    const { theme: currentTheme, mode, setTheme, setMode } = useThemeStore();

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || "");
            setUsername(profile.username || "");
            setBio(profile.bio || "");
            setSelectedAvatar(profile.avatar_url || getDefaultAvatar(user?.uid || ""));
        }
    }, [profile]);

    const checkUsernameUnique = useCallback(async (newUsername: string) => {
        if (!newUsername || newUsername.length < 3) {
            setUsernameError(newUsername.length > 0 && newUsername.length < 3 ? "Min 3 characters" : "");
            return;
        }
        if (!user || newUsername === profile?.username) { setUsernameError(""); return; }
        setCheckingUsername(true);
        try {
            const q = query(collection(db, "users"), where("username", "==", newUsername));
            const snapshot = await getDocs(q);
            setUsernameError(snapshot.docs.some((d) => d.id !== user.uid) ? "Username taken" : "");
        } catch { /* ignore */ } finally { setCheckingUsername(false); }
    }, [user, profile?.username]);

    useEffect(() => {
        const timer = setTimeout(() => { if (username) checkUsernameUnique(username); }, 500);
        return () => clearTimeout(timer);
    }, [username, checkUsernameUnique]);

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                <User className="w-12 h-12 text-muted-foreground/40" />
                <h2 className="text-lg font-bold text-foreground">Settings</h2>
                <p className="text-muted-foreground text-sm">Sign in to manage your settings.</p>
                <button
                    onClick={() => openAuthModal("login")}
                    className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-full active:scale-95 transition-transform"
                >
                    Sign In
                </button>
            </div>
        );
    }

    const handleSave = async () => {
        if (usernameError) { toast.error("Fix username issues first"); return; }
        if (username.length < 3) { toast.error("Username too short"); return; }
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", user.uid), {
                display_name: displayName, username, bio, avatar_url: selectedAvatar,
            });
            toast.success("Saved!");
            await refreshProfile();
        } catch { toast.error("Save failed"); } finally { setSaving(false); }
    };

    const toggle = (id: SectionId) => setExpandedSection(expandedSection === id ? null : id);

    return (
        <div className="min-h-full pb-8">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border/10 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 text-muted-foreground active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-base font-bold text-foreground">Settings</h1>
            </div>

            {/* Settings sections as accordion */}
            <div className="px-4 pt-3 space-y-2">
                {/* Profile Section */}
                <SettingsSection
                    icon={User}
                    label="Profile"
                    expanded={expandedSection === "profile"}
                    onToggle={() => toggle("profile")}
                >
                    <div className="space-y-4">
                        {/* Avatar picker */}
                        <div>
                            <label className="block text-[12px] font-medium text-foreground mb-2">Avatar</label>
                            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                                {DEFAULT_AVATARS.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedAvatar(url)}
                                        className={cn(
                                            "w-12 h-12 rounded-full shrink-0 overflow-hidden border-2 transition-all active:scale-90",
                                            selectedAvatar === url ? "border-primary ring-2 ring-primary/30" : "border-border/30"
                                        )}
                                    >
                                        <img src={url} alt="" className="w-full h-full object-cover bg-muted" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <MobileInput label="Display Name" value={displayName} onChange={setDisplayName} />

                        <div>
                            <MobileInput
                                label="Username"
                                value={username}
                                onChange={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                                maxLength={30}
                                error={usernameError}
                            />
                            {checkingUsername && <p className="text-[10px] text-muted-foreground mt-1">Checking...</p>}
                            {!checkingUsername && username.length >= 3 && !usernameError && (
                                <p className="text-[10px] text-green-500 mt-1 flex items-center gap-0.5"><Check className="w-3 h-3" />Available</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[12px] font-medium text-foreground mb-1.5">Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={3}
                                maxLength={300}
                                placeholder="Tell us about yourself..."
                                className="w-full bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                            />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{bio.length}/300</p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !!usernameError || checkingUsername}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection
                    icon={Palette}
                    label="Appearance"
                    expanded={expandedSection === "appearance"}
                    onToggle={() => toggle("appearance")}
                >
                    <div className="space-y-4">
                        {/* Light / Dark toggle */}
                        <div>
                            <label className="block text-[12px] font-medium text-foreground mb-2">Color Mode</label>
                            <div className="flex gap-2">
                                {([
                                    { id: "light" as const, label: "Light", icon: Sun },
                                    { id: "dark" as const, label: "Dark", icon: Moon },
                                ]).map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all active:scale-95",
                                            mode === m.id
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-border/30 text-muted-foreground"
                                        )}
                                    >
                                        <m.icon className="w-4 h-4" />
                                        <span className="text-[12px] font-semibold">{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme grid */}
                        <div>
                            <label className="block text-[12px] font-medium text-foreground mb-2">Theme</label>
                            <div className="grid grid-cols-3 gap-2">
                                {FEATURED_THEMES.map((themeKey) => {
                                    const config = themes[themeKey];
                                    const isActive = currentTheme === themeKey;
                                    return (
                                        <button
                                            key={themeKey}
                                            onClick={() => setTheme(themeKey)}
                                            className={cn(
                                                "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all active:scale-95",
                                                isActive ? "border-primary bg-primary/5" : "border-border/20"
                                            )}
                                        >
                                            <div className="flex gap-0.5">
                                                {config.ambient.colors.slice(0, 3).map((color, i) => (
                                                    <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-medium text-foreground truncate w-full text-center">
                                                {config.name}
                                            </span>
                                            {isActive && <Check className="w-3 h-3 text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* Notifications Section */}
                <SettingsSection
                    icon={Bell}
                    label="Notifications"
                    expanded={expandedSection === "notifications"}
                    onToggle={() => toggle("notifications")}
                >
                    <div className="space-y-0.5">
                        <MobileToggle label="Channel goes live" checked={true} />
                        <MobileToggle label="New followers" checked={true} />
                        <MobileToggle label="Subscriptions" checked={true} />
                        <MobileToggle label="Chat mentions" checked={false} />
                        <MobileToggle label="Push notifications" checked={true} />
                        <MobileToggle label="Email digest" checked={false} />
                    </div>
                </SettingsSection>

                {/* Privacy Section */}
                <SettingsSection
                    icon={Shield}
                    label="Privacy & Safety"
                    expanded={expandedSection === "privacy"}
                    onToggle={() => toggle("privacy")}
                >
                    <div className="space-y-0.5">
                        <MobileToggle label="Block DMs from strangers" checked={false} />
                        <MobileToggle label="Hide activity status" checked={false} />
                        <MobileToggle label="Mature content filter" checked={true} />
                        <MobileToggle label="Show watch history" checked={true} />
                        <MobileToggle label="Profile discovery" checked={true} />
                    </div>
                    <div className="mt-4 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                        <p className="text-[12px] font-medium text-foreground">Delete Account</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Permanently delete your account.</p>
                        <button
                            onClick={() => toast.error("Confirmation email sent.")}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground text-[11px] font-medium rounded-lg active:scale-95 transition-transform"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete
                        </button>
                    </div>
                </SettingsSection>
            </div>
        </div>
    );
};

// ── Reusable sub-components ──

const SettingsSection: React.FC<{
    icon: React.FC<any>;
    label: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}> = ({ icon: Icon, label, expanded, onToggle, children }) => (
    <div className="rounded-2xl border border-border/15 overflow-hidden bg-card/30">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-4 py-3.5 active:bg-muted/30 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[14px] font-semibold text-foreground">{label}</span>
            </div>
            <ChevronRight className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-90")} />
        </button>
        {expanded && (
            <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {children}
            </div>
        )}
    </div>
);

const MobileInput: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    maxLength?: number;
    error?: string;
}> = ({ label, value, onChange, maxLength, error }) => (
    <div>
        <label className="block text-[12px] font-medium text-foreground mb-1.5">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={maxLength}
            className={cn(
                "w-full bg-muted/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 transition-all",
                error ? "ring-1 ring-destructive" : "focus:ring-primary/30"
            )}
        />
        {error && (
            <p className="text-[10px] text-destructive mt-0.5 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />{error}
            </p>
        )}
    </div>
);

const MobileToggle: React.FC<{ label: string; checked: boolean }> = ({ label, checked: initialChecked }) => {
    const [on, setOn] = useState(initialChecked);
    return (
        <div className="flex items-center justify-between py-3 border-b border-border/10">
            <span className="text-[13px] text-foreground">{label}</span>
            <button
                onClick={() => setOn(!on)}
                className={cn(
                    "w-10 h-6 rounded-full transition-colors relative",
                    on ? "bg-primary" : "bg-muted"
                )}
            >
                <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-primary-foreground transition-transform",
                    on ? "translate-x-5" : "translate-x-1"
                )} />
            </button>
        </div>
    );
};
