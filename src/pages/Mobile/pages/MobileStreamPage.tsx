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
import { cn } from "@/shared/lib/utils";
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
                    <p className="text-muted-foreground text-sm mb-4">Channel offline or unavailable.</p>
                    <Link to="/m/browse" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
                        Browse
                    </Link>
                </div>
            </div>
        );
    }

    const platformInfo = channel.platform ? PLATFORM_META[channel.platform] : null;
    const PlatformIcon = channel.platform ? getPlatformIcon(channel.platform) : null;

    return (
        <div className="flex flex-col h-full bg-black">
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
                    <img src={channel.thumbnail} alt={channel.title} className="w-full h-full object-cover opacity-50" />
                )}

                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                    <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold uppercase rounded">
                        Live
                    </span>
                    <span className="px-2 py-0.5 bg-black/60 text-white text-[10px] font-medium rounded flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {formatViewerCount(channel.viewers)}
                    </span>
                </div>

                {/* Player controls */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/80 to-transparent z-10">
                    <button onClick={() => setIsMuted(!isMuted)} className="p-1.5 text-white active:scale-90 transition-transform">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button onClick={toggleFullscreen} className="p-1.5 text-white active:scale-90 transition-transform">
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Stream info + actions */}
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="p-3.5">
                    {/* Streamer row */}
                    <div className="flex items-center gap-3">
                        <Link to={`/m/profile/${channel.username}`}>
                            <img src={channel.avatar} alt="" className="w-10 h-10 rounded-full bg-muted" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <p className="text-[14px] font-bold text-foreground truncate">{channel.displayName}</p>
                                {channel.isVerified && <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />}
                                {platformInfo && PlatformIcon && (
                                    <span
                                        className="px-1 py-0.5 text-[8px] font-bold rounded flex items-center gap-0.5 shrink-0"
                                        style={{ backgroundColor: platformInfo.color, color: platformInfo.textColor }}
                                    >
                                        <PlatformIcon className="w-2.5 h-2.5" style={{ color: platformInfo.textColor }} />
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
                                "px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95",
                                isFollowing
                                    ? "bg-muted text-foreground"
                                    : "bg-primary text-primary-foreground"
                            )}
                        >
                            {isFollowing ? "Following" : "Follow"}
                        </button>
                    </div>

                    {/* Title + tags */}
                    <button
                        onClick={() => setInfoExpanded(!infoExpanded)}
                        className="w-full text-left mt-3"
                    >
                        <p className={cn("text-[13px] font-semibold text-foreground", !infoExpanded && "line-clamp-1")}>
                            {channel.title}
                        </p>
                        {infoExpanded && (
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <Link to={`/m/browse/${channel.categorySlug}`} className="text-primary text-[11px] font-medium">
                                    {channel.category}
                                </Link>
                                {channel.tags.map((tag) => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[9px] rounded-full font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground mx-auto mt-1 transition-transform", infoExpanded && "rotate-180")} />
                    </button>

                    {/* Action buttons row */}
                    <div className="flex items-center gap-2 mt-3 pb-3 border-b border-border/20">
                        <button
                            onClick={toggleFollow}
                            className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 rounded-full text-[11px] font-medium text-muted-foreground active:scale-95 transition-all"
                        >
                            <Heart className={cn("w-3.5 h-3.5", isFollowing && "fill-destructive text-destructive")} />
                            {isFollowing ? "Liked" : "Like"}
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 rounded-full text-[11px] font-medium text-muted-foreground active:scale-95 transition-all">
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                        </button>
                        <button
                            onClick={() => setShowChat(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-muted/50 rounded-full text-[11px] font-medium text-muted-foreground active:scale-95 transition-all"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Chat
                        </button>
                    </div>
                </div>

                {/* About */}
                {channel.bio && (
                    <div className="px-3.5 py-3">
                        <h3 className="text-[12px] font-semibold text-foreground mb-1">About</h3>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">{channel.bio}</p>
                    </div>
                )}
            </div>

            {/* Mobile Chat Overlay */}
            {showChat && (
                <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                        <p className="text-sm font-bold text-foreground">Stream Chat</p>
                        <button onClick={() => setShowChat(false)} className="p-1.5 rounded-full hover:bg-muted active:scale-90 transition-all">
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
