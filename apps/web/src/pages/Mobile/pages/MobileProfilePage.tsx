import React from "react";
import { useParams, Link } from "react-router-dom";
import { Settings, Calendar, Users, Grid3X3, Play, Heart } from "lucide-react";
import { formatViewerCount } from "@/pages/platform/data/mockData";
import { useStreams } from "@/pages/platform/hooks/useStreams";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { cn } from "@gaki/core/lib/utils";

export const MobileProfilePage: React.FC = () => {
    const { username } = useParams();
    const { user, profile: authProfile } = useAuth();
    const { data: allStreams = [] } = useStreams();

    const isSelf = username === "me" || (user && authProfile?.username === username);
    const channel = !isSelf ? allStreams.find((c) => c.username === username) : null;

    const profile = isSelf && authProfile
        ? {
            displayName: authProfile.display_name || "Your Profile",
            username: authProfile.username || "me",
            avatar: authProfile.avatar_url || "https://api.dicebear.com/9.x/adventurer/svg?seed=me",
            bio: authProfile.bio || "Welcome to your channel!",
            followers: 0,
            following: 0,
            streams: 0,
        }
        : channel
            ? {
                displayName: channel.displayName,
                username: channel.username,
                avatar: channel.avatar,
                bio: channel.bio || "",
                followers: channel.followers || 0,
                following: 0,
                streams: 0,
            }
            : {
                displayName: "Your Profile",
                username: "me",
                avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=me",
                bio: "Welcome to your channel!",
                followers: 0,
                following: 0,
                streams: 0,
            };

    const pastStreams = allStreams.slice(0, 9);

    return (
        <div className="min-h-full" role="region" aria-label={`${profile.displayName}'s profile`}>
            {/* Profile header */}
            <div className="relative">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-br from-primary/25 via-primary/10 to-accent/15" aria-hidden="true" />

                {/* Avatar - overlapping banner */}
                <div className="px-4 -mt-14">
                    <div className="flex items-end gap-4">
                        <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden bg-muted shrink-0 shadow-lg">
                            <img
                                src={profile.avatar}
                                alt={`${profile.displayName}'s avatar`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info section */}
            <div className="px-4 pt-4 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-foreground leading-tight">{profile.displayName}</h1>
                        <p className="text-[13px] text-muted-foreground mt-0.5">@{profile.username}</p>
                    </div>
                    {isSelf ? (
                        <Link
                            to="/m/settings"
                            className="flex items-center gap-2 px-4 py-2.5 bg-muted text-foreground text-[12px] font-semibold rounded-full active:scale-95 transition-transform min-h-[44px]"
                            aria-label="Edit profile settings"
                        >
                            <Settings className="w-4 h-4" aria-hidden="true" />
                            Edit
                        </Link>
                    ) : (
                        <button
                            className="px-6 py-2.5 bg-primary text-primary-foreground text-[13px] font-bold rounded-full active:scale-95 transition-transform min-h-[44px]"
                            aria-label={`Follow ${profile.displayName}`}
                        >
                            Follow
                        </button>
                    )}
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{profile.bio}</p>
                )}

                {/* Stats row — Instagram-style */}
                <div className="flex items-center gap-8 py-3 border-y border-border/10" role="list" aria-label="Profile stats">
                    <div className="text-center" role="listitem">
                        <p className="text-lg font-bold text-foreground">{formatViewerCount(profile.followers)}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Followers</p>
                    </div>
                    <div className="text-center" role="listitem">
                        <p className="text-lg font-bold text-foreground">{profile.following || 0}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Following</p>
                    </div>
                    <div className="text-center" role="listitem">
                        <p className="text-lg font-bold text-foreground">{pastStreams.length}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Streams</p>
                    </div>
                    <div className="text-center" role="listitem">
                        <p className="text-lg font-bold text-foreground flex items-center gap-1 justify-center">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                            2024
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">Joined</p>
                    </div>
                </div>

                {/* Tab bar — Instagram grid pattern */}
                <div className="flex items-center border-b border-border/10" role="tablist" aria-label="Profile content tabs">
                    <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 border-foreground text-foreground min-h-[44px]"
                        role="tab"
                        aria-selected={true}
                    >
                        <Grid3X3 className="w-4 h-4" aria-hidden="true" />
                        <span className="text-[12px] font-semibold">Streams</span>
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 border-transparent text-muted-foreground min-h-[44px]"
                        role="tab"
                        aria-selected={false}
                    >
                        <Heart className="w-4 h-4" aria-hidden="true" />
                        <span className="text-[12px] font-semibold">Liked</span>
                    </button>
                </div>
            </div>

            {/* Stream grid — Instagram-style 3-column */}
            <div className="grid grid-cols-3 gap-0.5 mt-0.5" role="list" aria-label="Past streams">
                {pastStreams.map((stream) => (
                    <Link
                        key={stream.id}
                        to={`/m/stream/${stream.username}`}
                        className="relative aspect-square overflow-hidden active:opacity-80 transition-opacity"
                        role="listitem"
                        aria-label={`${stream.title} — ${formatViewerCount(stream.viewers)} viewers`}
                    >
                        <img
                            src={stream.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {stream.isLive && (
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-destructive rounded text-[8px] font-bold text-white uppercase">
                                <span className="w-1 h-1 rounded-full bg-white animate-pulse" aria-hidden="true" />
                                Live
                            </div>
                        )}
                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/60 rounded text-[9px] text-white">
                            <Play className="w-2.5 h-2.5 fill-white" aria-hidden="true" />
                            {formatViewerCount(stream.viewers)}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
