import React, { useState, useRef, useEffect, useCallback } from "react";
import { StreamPlayer, isIframePlatform } from "../components/StreamPlayer";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Heart, Share2, Users, Send, MoreHorizontal, CheckCircle,
  Maximize, Minimize, Theater, Volume2, VolumeX, Settings, MessageSquare, X, PictureInPicture2
} from "lucide-react";
import { usePip } from "../context/PipContext";
import { formatViewerCount, PLATFORM_META } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "../context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { StreamChatEmbed } from "../components/StreamChatEmbed";
import { StreamComments } from "../components/StreamComments";

// Removed ChatMessage interface


// Removed MOCK_CHAT


const QUALITY_OPTIONS = ["1080p60", "720p60", "480p", "360p", "160p (Audio Only)"];

export const StreamPage: React.FC = () => {
  const { username } = useParams();
  const { user, profile, openAuthModal } = useAuth();
  const { data: allStreams = [] } = useStreams();
  const { openPip, closePip, pip } = usePip();
  const location = useLocation();
  // Fallback: If not found in API list, try to construct from username pattern (e.g. douyu-123)
  const channel = allStreams.find((c) => c.username === username) || (() => {
    if (!username) return allStreams[0];

    // Check for supported prefixes
    const supportedPrefixes: Record<string, any> = {
      "douyu-": "douyu",
      "huya-": "huya",
      "bilibili-": "bilibili",
      "kuaishou-": "kuaishou",
      "douyin-": "douyin",
      "yy-": "yy",
      "afreecatv-": "afreecatv",
      "navernow-": "navernow",
      "kakaotv-": "kakaotv",
      "niconico-": "niconico",
      "showroom-": "showroom",
      "mirrativ-": "mirrativ",
      "nimotv-": "nimotv",
      "bigo-": "bigo",
      "cubetv-": "cubetv",
      "rooter-": "rooter",
      "loco-": "loco",
      "chingari-": "chingari",
      "rumble-": "rumble", // Also support manual rumble
    };

    for (const [prefix, platform] of Object.entries(supportedPrefixes)) {
      if (username.startsWith(prefix)) {
        const id = username.slice(prefix.length);
        return {
          id: username,
          username: id,
          displayName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Stream`,
          avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${id}`,
          title: `Live on ${platform}`,
          category: "Just Chatting",
          categorySlug: "just-chatting",
          viewers: 0,
          thumbnail: "", // No thumbnail for manual
          isLive: true,
          tags: ["manual"],
          streamUrl: "", // URL construction handled in StreamPlayer based on platform
          platform: platform,
        } as any; // Cast to StreamChannel (approximate)
      }
    }
    return allStreams[0];
  })();

  // Removed mock chat logic


  const [isFollowing, setIsFollowing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null); // Ref for container

  // Player controls
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play
  const [isTheater, setIsTheater] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Muted for autoplay policy
  const [volume, setVolume] = useState(0.8); // react-player volume is 0-1
  const [showQuality, setShowQuality] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("1080p60");
  const [showControls, setShowControls] = useState(true);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

  // Firestore for valid check
  useEffect(() => {
    if (!user || !channel) {
      setIsFollowing(false);
      return;
    }
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
        console.error("Error checking follow status:", e);
      }
    };
    checkFollow();
  }, [user, channel?.id]);

  const toggleFollow = async () => {
    if (!user) {
      openAuthModal("login");
      return;
    }

    if (!channel) {
      return;
    }

    const startState = isFollowing;
    // Optimistic update
    setIsFollowing(!startState);

    try {
      if (startState) {
        // Unfollow
        const q = query(
          collection(db, "follows"),
          where("follower_id", "==", user.uid),
          where("following_id", "==", channel.id)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => {
          await deleteDoc(d.ref);
        });
        toast.success(`Unfollowed ${channel.displayName}`);
      } else {
        // Follow
        await addDoc(collection(db, "follows"), {
          follower_id: user.uid,
          following_id: channel.id,
          created_at: new Date().toISOString()
        });
        toast.success(`Following ${channel.displayName}`);
      }
    } catch (e) {
      console.error("Error toggling follow:", e);
      // Revert on error
      setIsFollowing(startState);
      toast.error("Failed to update follow status");
    }
  };

  // Removed handleSend


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

  // Close any existing PiP when we land on ANY stream page
  useEffect(() => {
    if (pip.isActive) {
      closePip();
    }
    // Only run when the username (route) changes, not on every pip state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Auto-activate PiP when navigating away from this stream page
  // We use a ref to track latest values so the cleanup doesn't re-run on every change
  const channelRef = useRef(channel);
  const isPlayingRef = useRef(isPlaying);
  const locationRef = useRef(location.pathname);
  useEffect(() => { channelRef.current = channel; }, [channel]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { locationRef.current = location.pathname; }, [location.pathname]);

  useEffect(() => {
    return () => {
      const ch = channelRef.current;
      const playing = isPlayingRef.current;
      // Only open PiP if we're navigating away and the stream was playing
      if (ch && playing) {
        // Don't open PiP if navigating to another stream (that page will play its own)
        // We can't know the next route in cleanup, so we open it and let the next
        // StreamPage's mount effect close it immediately if needed
        openPip(ch);
      }
    };
  }, [openPip]);

  const handlePlayerMouseMove = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (isMuted && newVolume > 0) setIsMuted(false);
    if (newVolume === 0) setIsMuted(true);
  };

  if (!channel) {
    return (
      <div className="flex items-center justify-center h-full text-foreground">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Stream Not Found</h2>
          <p className="text-muted-foreground">The requested channel could not be found or is offline.</p>
          <Link to="/platform/browse" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90">
            Browse Channels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full", isTheater && "flex-col")}>
      {/* Stream + Info */}
      <div className={cn("flex-1 flex flex-col overflow-y-auto", isTheater && "flex-none")}>
        {/* Video Player */}
        <div
          ref={playerRef}
          className={cn(
            "relative w-full bg-black flex items-center justify-center group select-none",
            isTheater ? "aspect-video max-h-[80vh]" : "aspect-video",
            isFullscreen && "max-h-none h-screen w-screen fixed top-0 left-0 z-50"
          )}
          onMouseMove={handlePlayerMouseMove}
          onMouseLeave={() => setShowControls(false)}
        >
          {(channel.streamUrl || channel.username) ? (
            <StreamPlayer
              channel={channel}
              playing={isPlaying}
              muted={isMuted}
              volume={volume}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <img
              src={channel.thumbnail}
              alt={channel.title}
              className="w-full h-full object-cover opacity-50"
            />
          )}

          {/* Error/Offline State or Placeholder if no playable source */}
          {(!channel.streamUrl && !channel.username) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white font-bold text-xl">Stream Offline</p>
            </div>
          )}

          {/* All overlays removed - native player controls only */}
        </div>

        {/* Stream Info */}
        <div className={cn("p-4 border-b border-border/30", isTheater && "hidden")}>
          <div className="flex items-start gap-3">
            <Link to={`/platform/profile/${channel.username}`}>
              <img src={channel.avatar} alt="" className="w-12 h-12 rounded-full bg-muted" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link to={`/platform/profile/${channel.username}`} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
                  {channel.displayName}
                </Link>
                {channel.isVerified && <CheckCircle className="w-4 h-4 text-primary" />}
                {channel.platform && (() => {
                  const meta = PLATFORM_META[channel.platform];
                  const PIcon = getPlatformIcon(channel.platform);
                  return (
                    <>
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded flex items-center gap-1"
                        style={{ backgroundColor: meta.color, color: meta.textColor }}
                      >
                        <PIcon className="w-3 h-3" style={{ color: meta.textColor }} />
                        {meta.label}
                      </span>
                      <span
                        className="px-2 py-0.5 text-[11px] font-bold rounded flex items-center gap-1"
                        style={{ backgroundColor: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}40` }}
                      >
                        <Users className="w-3 h-3" />
                        {formatViewerCount(channel.viewers)} watching
                      </span>
                    </>
                  );
                })()}
              </div>
              <p className="text-sm text-foreground font-medium mt-0.5">{channel.title}</p>
              <Link
                to={`/platform/browse/${channel.categorySlug}`}
                className="text-primary text-xs hover:underline mt-0.5 inline-block"
              >
                {channel.category}
              </Link>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {channel.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-[11px] rounded font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleFollow}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-bold transition-colors",
                  isFollowing
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                <Heart className={cn("w-4 h-4 inline mr-1.5", isFollowing && "fill-destructive text-destructive")} />
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                onClick={() => { if (channel) openPip(channel); }}
                className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
                title="Mini player"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          {channel.followers && (
            <p className="text-xs text-muted-foreground mt-3 ml-[60px]">
              {formatViewerCount(channel.followers)} followers
            </p>
          )}
        </div>

        {/* Comments */}
        {!isTheater && (
          <StreamComments channelName={channel.displayName} />
        )}

        {/* About */}
        {channel.bio && !isTheater && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">About {channel.displayName}</h3>
            <p className="text-sm text-muted-foreground">{channel.bio}</p>
          </div>
        )}
      </div>

      {/* Mobile Chat Toggle */}
      <button
        onClick={() => setShowMobileChat(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Chat Panel - Desktop */}
      <div className={cn(
        "w-[340px] border-l border-border/30 flex flex-col bg-card shrink-0 hidden lg:flex",
        isTheater && "flex-1"
      )}>
        {channel && (
          <StreamChatEmbed
            platform={channel.platform || "twitch"}
            channelId={channel.streamUrl?.match(/[?&]v=([^&]+)/)?.[1] || channel.id.replace(/^yt-(live|pop)-/, "")} // Extract video ID from URL
            username={channel.username.replace("tw-", "").replace("kick-", "")} // Simplified username extraction if needed
          />
        )}
      </div>

      {/* Chat Panel - Mobile Overlay */}
      {showMobileChat && (
        <div className="lg:hidden fixed inset-0 z-[200] bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <p className="text-sm font-semibold text-foreground">Stream Chat</p>
            <button onClick={() => setShowMobileChat(false)} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
          {channel && (
            <StreamChatEmbed
              platform={channel.platform || "twitch"}
              channelId={channel.streamUrl?.match(/[?&]v=([^&]+)/)?.[1] || channel.id.replace(/^yt-(live|pop)-/, "")}
              username={channel.username.replace("tw-", "").replace("kick-", "")}
              className="flex-1"
            />
          )}
        </div>
      )}
    </div>
  );
};

// Removed ChatPanel component definition

