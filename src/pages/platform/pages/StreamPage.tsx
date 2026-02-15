import React, { useState, useRef, useEffect, useCallback } from "react";
import { StreamPlayer } from "../components/StreamPlayer";
import { useParams, Link } from "react-router-dom";
import {
  Heart, Share2, Users, Send, MoreHorizontal, CheckCircle,
  Maximize, Minimize, Theater, Volume2, VolumeX, Settings, MessageSquare, X
} from "lucide-react";
import { formatViewerCount, PLATFORM_META } from "../data/mockData";
import { useStreams } from "../hooks/useStreams";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "../context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";

import { EmotePicker } from "../components/EmotePicker";
import { ChatBadge, BadgeType } from "../components/ChatBadge";

interface ChatMessage {
  id: string;
  user: string;
  color: string;
  message: string;
  badges?: BadgeType[];
}

const MOCK_CHAT: ChatMessage[] = [
  { id: "1", user: "NightOwl", color: "hsl(48 96% 53%)", message: "lets gooo 🔥", badges: ["sub"] },
  { id: "2", user: "PixelQueen", color: "#ff6bda", message: "that play was insane", badges: ["mod"] },
  { id: "3", user: "ShadowMC", color: "#5babff", message: "GG WP" },
  { id: "4", user: "DragonSlayer", color: "#ffb84d", message: "clutch!!", badges: ["vip"] },
  { id: "5", user: "CosmicDust", color: "#c084fc", message: "how does he do that every time", badges: ["sub"] },
  { id: "6", user: "NeonViper", color: "hsl(48 96% 53%)", message: "W stream" },
  { id: "7", user: "IcyBlaze", color: "#67e8f9", message: "KEKW", badges: ["sub"] },
  { id: "8", user: "ThunderBolt", color: "#fbbf24", message: "POG", badges: ["verified"] },
];

const QUALITY_OPTIONS = ["1080p60", "720p60", "480p", "360p", "160p (Audio Only)"];

export const StreamPage: React.FC = () => {
  const { username } = useParams();
  const { user, profile, openAuthModal } = useAuth();
  const { data: allStreams = [] } = useStreams();
  const channel = allStreams.find((c) => c.username === username) || allStreams[0];

  // Dynamic chat based on channel
  const [messages, setMessages] = useState(() => {
    return MOCK_CHAT.map(msg => ({
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      message: `${msg.message} (${channel.displayName} hype!)` // Simple variation
    }));
  });

  // Reset messages when channel changes
  useEffect(() => {
    setMessages(MOCK_CHAT.map(msg => ({
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      message: `${msg.message}`
    })));
  }, [channel.id]); // Only depend on channel.id to avoid unnecessary updates

  const [chatInput, setChatInput] = useState("");
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
    if (!user) {
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
  }, [user, channel.id]);

  const toggleFollow = async () => {
    if (!user) {
      openAuthModal("login");
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

  const handleSend = () => {
    if (!chatInput.trim()) return;
    if (!user) {
      openAuthModal("login");
      return;
    }
    const chatName = profile?.display_name || user.email?.split("@")[0] || "You";
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), user: chatName, color: "hsl(48 96% 53%)", message: chatInput.trim() },
    ]);
    setChatInput("");
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
            <img
              src={channel.thumbnail}
              alt={channel.title}
              className="w-full h-full object-cover opacity-50"
            />
          )}

          {/* Error/Offline State or Placeholder if no streamUrl */}
          {!channel.streamUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-white font-bold text-xl">Stream Offline</p>
            </div>
          )}

          {/* Live badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-10">
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold uppercase rounded">
              Live
            </span>
            <span className="px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatViewerCount(channel.viewers)}
            </span>
          </div>

          {/* Player Controls Overlay */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-3 transition-opacity duration-300 z-20",
              showControls || isFullscreen || !isPlaying ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Play/Pause for overlay click (optional, usually clicking video toggles play) */}

            {/* Volume bar (thin line) */}
            {/* <div className="w-full h-0.5 bg-white/20 rounded-full mb-3 cursor-pointer">
              <div className="h-full bg-primary rounded-full" style={{ width: "42%" }} />
            </div> */}

            <div className="flex items-center justify-between">
              {/* Left controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-primary transition-colors"
                >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause w-5 h-5"><rect width="4" height="16" x="6" y="4" /><rect width="4" height="16" x="14" y="4" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play w-5 h-5"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                  )}
                </button>

                <div className="flex items-center gap-2 group/volume">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:text-primary transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 accent-primary cursor-pointer bg-white/20 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* Quality selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowQuality(!showQuality)}
                    className="text-white hover:text-primary transition-colors p-1"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </button>
                  {showQuality && (
                    <div className="absolute bottom-full right-0 mb-2 bg-card border border-border/40 rounded-lg shadow-lg py-1 min-w-[140px] z-[100]">
                      {QUALITY_OPTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setSelectedQuality(q);
                            setShowQuality(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-sm transition-colors",
                            selectedQuality === q
                              ? "text-primary font-medium bg-primary/10"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Theater mode */}
                <button
                  onClick={() => setIsTheater(!isTheater)}
                  className="text-white hover:text-primary transition-colors p-1 hidden lg:block"
                  title="Theater Mode"
                >
                  <Theater className="w-4.5 h-4.5" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-primary transition-colors p-1"
                  title="Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="w-4.5 h-4.5" />
                  ) : (
                    <Maximize className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
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
                    <span
                      className="px-1.5 py-0.5 text-[10px] font-bold rounded flex items-center gap-1"
                      style={{ backgroundColor: meta.color, color: meta.textColor }}
                    >
                      <PIcon className="w-3 h-3" style={{ color: meta.textColor }} />
                      {meta.label}
                    </span>
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
        <ChatPanel
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSend={handleSend}
          chatEndRef={chatEndRef}
        />
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
          <ChatPanel
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={handleSend}
            chatEndRef={chatEndRef}
          />
        </div>
      )}
    </div>
  );
};

const ChatPanel: React.FC<{
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}> = ({ messages, chatInput, setChatInput, onSend, chatEndRef }) => (
  <>
    <div className="px-4 py-3 border-b border-border/30">
      <p className="text-sm font-semibold text-foreground">Stream Chat</p>
    </div>
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
      {messages.map((msg) => (
        <div key={msg.id} className="text-sm leading-relaxed flex items-start gap-1">
          {msg.badges?.map((badge) => (
            <ChatBadge key={badge} type={badge} className="mt-0.5" />
          ))}
          <span>
            <span className="font-semibold" style={{ color: msg.color }}>
              {msg.user}
            </span>
            <span className="text-foreground/80">: {msg.message}</span>
          </span>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
    <div className="p-3 border-t border-border/30">
      <div className="flex items-center gap-1">
        <EmotePicker onSelect={(emote) => setChatInput(chatInput + emote)} />
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Send a message..."
          className="flex-1 bg-background border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
        <button
          onClick={onSend}
          className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  </>
);
