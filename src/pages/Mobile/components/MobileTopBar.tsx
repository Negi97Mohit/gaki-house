import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, X } from "lucide-react";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { cn } from "@/shared/lib/utils";

export const MobileTopBar: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, openAuthModal } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/m/search?q=${encodeURIComponent(query.trim())}`);
            setSearchOpen(false);
            setQuery("");
        }
    };

    const avatarUrl = profile?.avatar_url || "https://api.dicebear.com/9.x/adventurer/svg?seed=me";

    return (
        <>
            <header className="mobile-top-bar sticky top-0 z-50 flex items-center justify-between px-4 h-11 bg-background/80 backdrop-blur-xl border-b border-border/10">
                {/* Logo */}
                <Link to="/m" className="flex items-center gap-2">
                    <img src="./icon.png" alt="GAKI" className="w-7 h-7 rounded-lg" />
                    <span className="text-foreground font-extrabold text-lg tracking-tight">
                        GAKI
                    </span>
                </Link>

                {/* Right actions */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-90"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all active:scale-90 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                    </button>
                    <button
                        onClick={() => user ? navigate("/m/profile/me") : openAuthModal("login")}
                        className="ml-1 active:scale-90 transition-transform"
                    >
                        <img
                            src={avatarUrl}
                            alt="You"
                            className="w-7 h-7 rounded-full bg-muted border-2 border-primary/30 object-cover"
                        />
                    </button>
                </div>
            </header>

            {/* Full-screen search overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20">
                        <button
                            onClick={() => { setSearchOpen(false); setQuery(""); }}
                            className="p-2 rounded-full text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <form onSubmit={handleSubmit} className="flex-1">
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search streams, categories..."
                                className="w-full bg-muted/50 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                            />
                        </form>
                    </div>
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                        {query.trim() ? `Press enter to search "${query}"` : "Start typing to search..."}
                    </div>
                </div>
            )}
        </>
    );
};
