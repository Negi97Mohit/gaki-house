import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Share2, Users, Send, MoreHorizontal, CheckCircle } from "lucide-react";
import { MOCK_CHANNELS, formatViewerCount } from "../data/mockData";

const MOCK_CHAT = [
  { id: "1", user: "NightOwl", color: "hsl(48 96% 53%)", message: "lets gooo 🔥" },
  { id: "2", user: "PixelQueen", color: "#ff6bda", message: "that play was insane" },
  { id: "3", user: "ShadowMC", color: "#5babff", message: "GG WP" },
  { id: "4", user: "DragonSlayer", color: "#ffb84d", message: "clutch!!" },
  { id: "5", user: "CosmicDust", color: "#c084fc", message: "how does he do that every time" },
  { id: "6", user: "NeonViper", color: "hsl(48 96% 53%)", message: "W stream" },
  { id: "7", user: "IcyBlaze", color: "#67e8f9", message: "KEKW" },
  { id: "8", user: "ThunderBolt", color: "#fbbf24", message: "POG" },
];

export const StreamPage: React.FC = () => {
  const { username } = useParams();
  const channel = MOCK_CHANNELS.find((c) => c.username === username) || MOCK_CHANNELS[0];
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(MOCK_CHAT);
  const [isFollowing, setIsFollowing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), user: "You", color: "hsl(48 96% 53%)", message: chatInput.trim() },
    ]);
    setChatInput("");
  };

  return (
    <div className="flex h-full">
      {/* Stream + Info */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <img
            src={channel.thumbnail}
            alt={channel.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-xs font-bold uppercase rounded">
              Live
            </span>
            <span className="px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatViewerCount(channel.viewers)}
            </span>
          </div>
        </div>

        {/* Stream Info */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-start gap-3">
            <img src={channel.avatar} alt="" className="w-12 h-12 rounded-full bg-muted" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground">{channel.displayName}</h1>
                {channel.isVerified && <CheckCircle className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-sm text-foreground font-medium mt-0.5">{channel.title}</p>
              <Link
                to={`/platform/browse/${channel.categorySlug}`}
                className="text-primary text-xs hover:underline mt-0.5 inline-block"
              >
                {channel.category}
              </Link>
              <div className="flex gap-1.5 mt-2">
                {channel.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground text-[11px] rounded font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${
                  isFollowing
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                <Heart className={`w-4 h-4 inline mr-1.5 ${isFollowing ? "fill-destructive text-destructive" : ""}`} />
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors">
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
        {channel.bio && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">About {channel.displayName}</h3>
            <p className="text-sm text-muted-foreground">{channel.bio}</p>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      <div className="w-[340px] border-l border-border/30 flex flex-col bg-card shrink-0 hidden lg:flex">
        <div className="px-4 py-3 border-b border-border/30">
          <p className="text-sm font-semibold text-foreground">Stream Chat</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin">
          {messages.map((msg) => (
            <div key={msg.id} className="text-sm leading-relaxed">
              <span className="font-semibold" style={{ color: msg.color }}>
                {msg.user}
              </span>
              <span className="text-foreground/80">: {msg.message}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t border-border/30">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Send a message..."
              className="flex-1 bg-background border border-border/40 rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={handleSend}
              className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
