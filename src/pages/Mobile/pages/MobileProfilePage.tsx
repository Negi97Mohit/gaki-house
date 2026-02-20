import React from "react";
import { useParams, Link } from "react-router-dom";
import { Settings, Calendar, Users, Grid3X3, Play, Heart } from "lucide-react";
import { formatViewerCount } from "@/pages/platform/data/mockData";
import { useStreams } from "@/pages/platform/hooks/useStreams";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { cn } from "@/shared/lib/utils";

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
        <div className="min-h-full">
            {/* Profile header */}
            <div className="relative">
                {/* Banner */}
                <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/15" />

                {/* Avatar - overlapping banner */}
                <div className="px-4 -mt-12">
                    <div className="flex items-end gap-4">
                        <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-muted shrink-0">
                            <img
                                src={profile.avatar}
                                alt={profile.displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Info section */}
            <div className="px-4 pt-3 space-y-3">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-foreground leading-tight">{profile.displayName}</h1>
                        <p className="text-[13px] text-muted-foreground">@{profile.username}</p>
                    </div>
                    {isSelf ? (
                        <Link
                            to="/m/settings"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-muted text-foreground text-[12px] font-semibold rounded-full active:scale-95 transition-transform"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Edit
                        </Link>
                    ) : (
                        <button className="px-5 py-1.5 bg-primary text-primary-foreground text-[12px] font-bold rounded-full active:scale-95 transition-transform">
                            Follow
                        </button>
                    )}
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{profile.bio}</p>
                )}

                {/* Stats row — Instagram-style */}
                <div className="flex items-center gap-6 py-2.5 border-y border-border/15">
                    <div className="text-center">
                        <p className="text-base font-bold text-foreground">{formatViewerCount(profile.followers)}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Followers</p>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-foreground">{profile.following || 0}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Following</p>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-foreground">{pastStreams.length}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Streams</p>
                    </div>
                    <div className="text-center">
                        <p className="text-base font-bold text-foreground flex items-center gap-0.5 justify-center">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            2024
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">Joined</p>
                    </div>
                </div>

                {/* Tab bar — Instagram grid pattern */}
                <div className="flex items-center border-b border-border/15">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-b-2 border-foreground text-foreground">
                        <Grid3X3 className="w-4 h-4" />
                        <span className="text-[12px] font-semibold">Streams</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-b-2 border-transparent text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        <span className="text-[12px] font-semibold">Liked</span>
                    </button>
                </div>
            </div>

            {/* Stream grid — Instagram-style 3-column */}
            <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {pastStreams.map((stream) => (
                    <Link
                        key={stream.id}
                        to={`/m/stream/${stream.username}`}
                        className="relative aspect-square overflow-hidden active:opacity-80 transition-opacity"
                    >
                        <img
                            src={stream.thumbnail}
                            alt={stream.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {stream.isLive && (
                            <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1 py-0.5 bg-destructive rounded text-[7px] font-bold text-white uppercase">
                                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                Live
                            </div>
                        )}
                        <div className="absolute bottom-1 left-1 flex items-center gap-0.5 px-1 py-0.5 bg-black/60 rounded text-[8px] text-white">
                            <Play className="w-2 h-2 fill-white" />
                            {formatViewerCount(stream.viewers)}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
