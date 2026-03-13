import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ThemeName } from "@/features/theme";
import {
    ArrowLeft, Moon, Sun, Palette, User, Bell, Shield, HelpCircle,
    ChevronRight, LogOut, Camera, Trash2, Languages, Monitor
} from "lucide-react";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { useThemeStore } from "@/features/theme";
import { cn } from "@/shared/lib/utils";

const THEMES = [
    { id: "default", name: "Gold", color: "bg-amber-400" },
    { id: "ocean", name: "Ocean", color: "bg-sky-400" },
    { id: "forest", name: "Forest", color: "bg-green-500" },
    { id: "sunset", name: "Sunset", color: "bg-orange-400" },
    { id: "ultraviolet", name: "Violet", color: "bg-violet-500" },
    { id: "midnightTokyo", name: "Tokyo", color: "bg-pink-500" },
    { id: "obsidian", name: "Obsidian", color: "bg-zinc-700" },
    { id: "roseGold", name: "Rosé", color: "bg-rose-400" },
    { id: "iceQueen", name: "Ice", color: "bg-cyan-400" },
    { id: "hexGrid", name: "Matrix", color: "bg-emerald-500" },
    { id: "cosmicRing", name: "Cosmic", color: "bg-purple-500" },
    { id: "nebulaDust", name: "Nebula", color: "bg-fuchsia-500" },
];

interface SettingsGroupProps {
    title: string;
    children: React.ReactNode;
}

const SettingsGroup: React.FC<SettingsGroupProps> = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-5 mb-2">{title}</h2>
        <div className="mx-4 rounded-2xl bg-card/60 border border-border/10 overflow-hidden divide-y divide-border/10">
            {children}
        </div>
    </div>
);

interface SettingsItemProps {
    icon: React.ElementType;
    label: string;
    description?: string;
    onClick?: () => void;
    right?: React.ReactNode;
    destructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon: Icon, label, description, onClick, right, destructive }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-muted/40 transition-colors min-h-[52px]",
            destructive && "text-destructive"
        )}
        aria-label={label}
    >
        <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
            destructive ? "bg-destructive/10" : "bg-muted/60"
        )}>
            <Icon className={cn("w-4 h-4", destructive ? "text-destructive" : "text-muted-foreground")} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
            <p className={cn("text-[14px] font-medium", destructive ? "text-destructive" : "text-foreground")}>{label}</p>
            {description && <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {right || <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" aria-hidden="true" />}
    </button>
);

export const MobileSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, signOut, openAuthModal } = useAuth();
    const { theme: currentTheme, mode, setTheme, toggleMode } = useThemeStore();
    const isDark = mode === "dark";

    const avatarUrl = profile?.avatar_url || "https://api.dicebear.com/9.x/adventurer/svg?seed=me";

    return (
        <div className="min-h-full pb-8" role="region" aria-label="Settings">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-5">
                <button
                    onClick={() => navigate(-1)}
                    className="mobile-icon-btn"
                    aria-label="Go back"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="mobile-fluid-title">Settings</h1>
            </div>

            {/* Profile card */}
            <div className="mx-4 mb-6 p-4 rounded-2xl bg-card/60 border border-border/10 flex items-center gap-4">
                <div className="relative">
                    <img
                        src={avatarUrl}
                        alt="Your avatar"
                        className="w-16 h-16 rounded-full bg-muted object-cover border-2 border-border/20"
                    />
                    <button
                        className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-sm"
                        aria-label="Change avatar"
                    >
                        <Camera className="w-3.5 h-3.5 text-primary-foreground" aria-hidden="true" />
                    </button>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground truncate">
                        {profile?.display_name || "Your Profile"}
                    </p>
                    <p className="text-[12px] text-muted-foreground truncate">
                        @{profile?.username || "username"}
                    </p>
                    {!user && (
                        <button
                            onClick={() => openAuthModal("login")}
                            className="mt-2 px-4 py-2 bg-primary text-primary-foreground text-[12px] font-bold rounded-full active:scale-95 transition-transform min-h-[36px]"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>

            {/* Theme — iOS-style grouped */}
            <SettingsGroup title="Appearance">
                <div className="px-4 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center">
                            <Palette className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        </div>
                        <span className="text-[14px] font-medium text-foreground">Theme Color</span>
                    </div>
                    <div className="grid grid-cols-6 gap-3" role="radiogroup" aria-label="Theme color">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id as ThemeName)}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 min-h-[44px]",
                                )}
                                role="radio"
                                aria-checked={currentTheme === t.id}
                                aria-label={t.name}
                            >
                                <div className={cn(
                                    "w-9 h-9 rounded-full transition-all",
                                    t.color,
                                    currentTheme === t.id
                                        ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                                        : "opacity-70"
                                )} />
                                <span className="text-[9px] text-muted-foreground font-medium">{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <SettingsItem
                    icon={isDark ? Moon : Sun}
                    label={isDark ? "Dark Mode" : "Light Mode"}
                    description="Toggle dark/light appearance"
                    onClick={toggleMode}
                    right={
                        <div
                            className={cn(
                                "w-12 h-7 rounded-full flex items-center px-0.5 transition-colors",
                                isDark ? "bg-primary" : "bg-muted"
                            )}
                            role="switch"
                            aria-checked={isDark}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full bg-white shadow-sm transition-transform",
                                isDark && "translate-x-5"
                            )} />
                        </div>
                    }
                />
            </SettingsGroup>

            <SettingsGroup title="Account">
                <SettingsItem icon={User} label="Edit Profile" description="Name, bio, avatar" />
                <SettingsItem icon={Bell} label="Notifications" description="Push, email alerts" />
                <SettingsItem icon={Shield} label="Privacy & Security" description="Blocked users, data" />
                <SettingsItem icon={Languages} label="Language" description="English" />
            </SettingsGroup>

            <SettingsGroup title="Support">
                <SettingsItem icon={HelpCircle} label="Help Center" />
                <SettingsItem icon={Monitor} label="About GAKI" description="v2.0.0" />
            </SettingsGroup>

            {user && (
                <SettingsGroup title="Danger Zone">
                    <SettingsItem
                        icon={LogOut}
                        label="Sign Out"
                        onClick={signOut}
                        destructive
                    />
                    <SettingsItem
                        icon={Trash2}
                        label="Delete Account"
                        description="Permanently remove your data"
                        destructive
                    />
                </SettingsGroup>
            )}
        </div>
    );
};
