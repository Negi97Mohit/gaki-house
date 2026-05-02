import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Heart, Share2, Users, Maximize, Minimize, Volume2, VolumeX,
    MessageSquare, X, ChevronDown, ChevronUp, CheckCircle
} from "lucide-react";
import { formatViewerCount, PLATFORM_META } from "@/pages/platform/data/mockData";
import { useStreams } from "@/pages/platform/hooks/useStreams";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { StreamPlayer } from "@/pages/platform/components/StreamPlayer";
import { StreamChatEmbed } from "@/pages/platform/components/StreamChatEmbed";
import { cn } from "@gaki/core/lib/utils";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";

export const MobileStreamPage: React.FC = () => {
    const { username } = useParams();
    const { user, openAuthModal } = useAuth();
    const { data: allStreams = [] } = useStreams();
    const channel = allStreams.find((c) => c.username === username) || allStreams[0];

    const [isFollowing, setIsFollowing] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [volume] = useState(0.8);
    const [showChat, setShowChat] = useState(false);
    const [infoExpanded, setInfoExpanded] = useState(true);
    const playerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Follow check
    useEffect(() => {
        if (!user || !channel) return;
        const checkFollow = async () => {
            try {
                const q = query(
                    collection(db, "follows"),
                    where("follower_id", "==", user.uid),
                    where("following_id", "==", channel.id)
                );
                const snapshot = await getDocs(q);
                setIsFollowing(!snapshot.empty);
            } catch (e) {
                console.error("Error checking follow:", e);
            }
        };
        checkFollow();
    }, [user, channel?.id]);

    const toggleFollow = async () => {
        if (!user) { openAuthModal("login"); return; }
        if (!channel) return;
        const prev = isFollowing;
        setIsFollowing(!prev);
        try {
            if (prev) {
                const q = query(collection(db, "follows"), where("follower_id", "==", user.uid), where("following_id", "==", channel.id));
                const snap = await getDocs(q);
                snap.forEach(async (d) => await deleteDoc(d.ref));
                toast.success(`Unfollowed ${channel.displayName}`);
            } else {
                await addDoc(collection(db, "follows"), { follower_id: user.uid, following_id: channel.id, created_at: new Date().toISOString() });
                toast.success(`Following ${channel.displayName}`);
            }
        } catch {
            setIsFollowing(prev);
            toast.error("Failed to update follow");
        }
    };

    const toggleFullscreen = useCallback(() => {
        if (!playerRef.current) return;
        if (!document.fullscreenElement) {
            playerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    if (!channel) {
        return (
            <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground mb-2">Stream Not Found</h2>
                    <p className="text-muted-foreground text-sm mb-5">Channel offline or unavailable.</p>
                    <Link
                        to="/m/browse"
                        className="px-5 py-3 bg-primary text-primary-foreground rounded-full text-sm font-bold active:scale-95 transition-transform min-h-[44px] inline-flex items-center"
                    >
                        Browse
                    </Link>
                </div>
            </div>
        );
    }

    const platformInfo = channel.platform ? PLATFORM_META[channel.platform] : null;
    const PlatformIcon = channel.platform ? getPlatformIcon(channel.platform) : null;

    return (
        <div className="flex flex-col h-full bg-black" role="region" aria-label={`Watching ${channel.displayName}`}>
            {/* Video Player */}
            <div
                ref={playerRef}
                className={cn(
                    "relative w-full bg-black shrink-0",
                    isFullscreen ? "h-screen" : "aspect-video"
                )}
            >
                {channel.streamUrl ? (
                    <StreamPlayer
                        channel={channel}
                        playing={isPlaying}
                        muted={isMuted}
                        volume={volume}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />
                ) : (
                    <img src={channel.thumbnail} alt="" className="w-full h-full object-cover opacity-50" />
                )}

                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    <span className="px-2.5 py-1 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded-lg flex items-center gap-1" aria-label="Live stream">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
                        Live
                    </span>
                    <span className="px-2 py-1 bg-black/60 text-white text-[10px] font-medium rounded-lg flex items-center gap-1">
                        <Users className="w-3 h-3" aria-hidden="true" />
                        {formatViewerCount(channel.viewers)}
                    </span>
                </div>

                {/* Player controls — enlarged for touch */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-3 bg-gradient-to-t from-black/80 to-transparent z-10">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="mobile-icon-btn text-white"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="mobile-icon-btn text-white"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Stream info + actions */}
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="p-4">
                    {/* Streamer row */}
                    <div className="flex items-center gap-3">
                        <Link to={`/m/profile/${channel.username}`} aria-label={`View ${channel.displayName}'s profile`}>
                            <img src={channel.avatar} alt="" className="w-11 h-11 rounded-full bg-muted border border-border/20 object-cover" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-[14px] font-bold text-foreground truncate">{channel.displayName}</p>
                                {channel.isVerified && <CheckCircle className="w-4 h-4 text-primary shrink-0" aria-label="Verified" />}
                                {platformInfo && PlatformIcon && (
                                    <span
                                        className="px-1.5 py-0.5 text-[8px] font-bold rounded flex items-center gap-0.5 shrink-0"
                                        style={{ backgroundColor: platformInfo.color, color: platformInfo.textColor }}
                                    >
                                        <PlatformIcon className="w-2.5 h-2.5" style={{ color: platformInfo.textColor }} aria-hidden="true" />
                                        {platformInfo.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                {formatViewerCount(channel.followers || 0)} followers
                            </p>
                        </div>
                        <button
                            onClick={toggleFollow}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-[12px] font-bold transition-all active:scale-95 min-h-[44px]",
                                isFollowing
                                    ? "bg-muted text-foreground"
                                    : "bg-primary text-primary-foreground"
                            )}
                            aria-label={isFollowing ? `Unfollow ${channel.displayName}` : `Follow ${channel.displayName}`}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    </div>

                    {/* Title + tags */}
                    <button
                        onClick={() => setInfoExpanded(!infoExpanded)}
                        className="w-full text-left mt-3 min-h-[44px]"
                        aria-expanded={infoExpanded}
                        aria-label="Toggle stream details"
                    >
                        <p className={cn("text-[14px] font-semibold text-foreground", !infoExpanded && "line-clamp-1")}>
                            {channel.title}
                        </p>
                        {infoExpanded && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Link to={`/m/browse/${channel.categorySlug}`} className="text-primary text-[12px] font-medium">
                                    {channel.category}
                                </Link>
                                {channel.tags.map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-[10px] rounded-full font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground mx-auto mt-1.5 transition-transform", infoExpanded && "rotate-180")} aria-hidden="true" />
                    </button>

                    {/* Action buttons row */}
                    <div className="flex items-center gap-2.5 mt-3 pb-4 border-b border-border/10">
                        <button
                            onClick={toggleFollow}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 rounded-full text-[12px] font-medium text-muted-foreground active:scale-95 transition-all min-h-[44px]"
                            aria-label={isFollowing ? "Unlike" : "Like"}
                        >
                            <Heart className={cn("w-4 h-4", isFollowing && "fill-destructive text-destructive")} aria-hidden="true" />
                            {isFollowing ? "Liked" : "Like"}
                        </button>
                        <button
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 rounded-full text-[12px] font-medium text-muted-foreground active:scale-95 transition-all min-h-[44px]"
                            aria-label="Share stream"
                        >
                            <Share2 className="w-4 h-4" aria-hidden="true" />
                            Share
                        </button>
                        <button
                            onClick={() => setShowChat(true)}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 rounded-full text-[12px] font-medium text-muted-foreground active:scale-95 transition-all min-h-[44px]"
                            aria-label="Open chat"
                        >
                            <MessageSquare className="w-4 h-4" aria-hidden="true" />
                            Chat
                        </button>
                    </div>
                </div>

                {/* About */}
                {channel.bio && (
                    <div className="px-4 py-3">
                        <h3 className="text-[13px] font-semibold text-foreground mb-1.5">About</h3>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">{channel.bio}</p>
                    </div>
                )}
            </div>

            {/* Mobile Chat Overlay — slide up from bottom */}
            {showChat && (
                <div
                    className="fixed inset-0 z-[200] bg-background flex flex-col animate-sheet-up"
                    role="dialog"
                    aria-label="Stream chat"
                    aria-modal="true"
                >
                    <div className="mobile-sheet-handle" aria-hidden="true" />
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
                        <p className="text-sm font-bold text-foreground">Stream Chat</p>
                        <button
                            onClick={() => setShowChat(false)}
                            className="mobile-icon-btn"
                            aria-label="Close chat"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                    </div>
                    <StreamChatEmbed
                        platform={channel.platform || "twitch"}
                        channelId={channel.streamUrl?.match(/[?&]v=([^&]+)/)?.[1] || channel.id.replace(/^yt-(live|pop)-/, "")}
                        username={channel.username.replace("tw-", "").replace("kick-", "")}
                        className="flex-1"
                    />
                </div>
            )}
        </div>
    );
};
