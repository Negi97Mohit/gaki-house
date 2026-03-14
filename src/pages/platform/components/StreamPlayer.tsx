import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { StreamChannel, PlatformType } from "../data/mockData";
import { cn } from "@/shared/lib/utils";

// Platforms that support actual video embedding
const EMBEDDABLE_PLATFORMS: PlatformType[] = [
  "twitch", "youtube", "kick", "dlive", "trovo", "rumble", "bilibili", "niconico"
];

// Platforms rendered via iframe (have their own native controls)
const IFRAME_PLATFORMS: PlatformType[] = [
  "kick", "dlive", "trovo", "rumble", "bilibili", "niconico"
];

export function isEmbeddablePlatform(platform?: PlatformType): boolean {
  return !!platform && EMBEDDABLE_PLATFORMS.includes(platform);
}

/** Returns true if the platform uses an iframe with its own native video controls */
export function isIframePlatform(platform?: PlatformType): boolean {
  return !!platform && IFRAME_PLATFORMS.includes(platform);
}

// ---- Twitch Interactive Embed Component ----
// Uses the official Twitch Embed JS SDK for reliable autoplay
declare global {
  interface Window {
    Twitch?: any;
  }
}

let twitchScriptLoaded = false;
let twitchScriptLoading = false;
const twitchScriptCallbacks: (() => void)[] = [];

function loadTwitchScript(callback: () => void) {
  if (twitchScriptLoaded && window.Twitch) {
    callback();
    return;
  }
  twitchScriptCallbacks.push(callback);
  if (twitchScriptLoading) return;
  twitchScriptLoading = true;

  const script = document.createElement("script");
  script.src = "https://embed.twitch.tv/embed/v1.js";
  script.onload = () => {
    twitchScriptLoaded = true;
    twitchScriptLoading = false;
    twitchScriptCallbacks.forEach((cb) => cb());
    twitchScriptCallbacks.length = 0;
  };
  document.body.appendChild(script);
}

interface TwitchEmbedProps {
  channel: string;
  autoplay?: boolean;
  muted?: boolean;
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = ({ channel, autoplay = true, muted = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const hostname = window.location.hostname;
    const parents = ["localhost", "127.0.0.1"];
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      parents.push(hostname);
    }

    loadTwitchScript(() => {
      if (!containerRef.current || !window.Twitch) return;

      // Clear previous embed
      containerRef.current.innerHTML = "";

      embedRef.current = new window.Twitch.Embed(containerRef.current, {
        width: "100%",
        height: "100%",
        channel: channel,
        parent: parents,
        autoplay: autoplay,
        muted: muted,
        layout: "video",
      });
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      embedRef.current = null;
    };
  }, [channel, autoplay, muted]);

  return <div ref={containerRef} className="w-full h-full" />;
};
interface StreamPlayerProps {
    channel: StreamChannel;
    className?: string;
    playing?: boolean;
    muted?: boolean;
    volume?: number;
    onPlay?: () => void;
    onPause?: () => void;
    onError?: (e: any) => void;
}

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
    channel,
    className,
    playing = true,
    muted = true,
    volume = 0.5,
    onPlay,
    onPause,
    onError,
}) => {
    const playerRef = useRef<any>(null);
    const [hasError, setHasError] = useState(false);

    // Reset error state when channel changes
    useEffect(() => {
        setHasError(false);
    }, [channel.id]);

    if (!channel.streamUrl && !channel.username) {
        return <div className="w-full h-full bg-black flex items-center justify-center text-white">No Stream URL</div>;
    }

    // Handle Kick via Iframe
    if (channel.platform === "kick") {
        const slug = channel.username;
        return (
            <div className={cn("w-full h-full", className)}>
                <iframe
                    src={`https://player.kick.com/${slug}?autoplay=true&muted=true`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                    style={{ border: "none" }}
                />
            </div>
        );
    }

    // Handle Twitch via official Twitch Interactive Embed JS SDK (autoplay guaranteed)
    if (channel.platform === "twitch") {
        const username = channel.username.replace("tw-", "");
        return <TwitchEmbed channel={username} autoplay={playing} muted={muted} />;
    }

    // Handle YouTube via iframe 
    if (channel.platform === "youtube") {
        const videoId = channel.streamUrl?.match(/[?&]v=([^&]+)/)?.[1]
            || channel.id.replace("yt-live-", "").replace("yt-pop-", "");
        return (
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${playing ? 1 : 0}&mute=${muted ? 1 : 0}&modestbranding=1&rel=0&controls=1`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                style={{ border: "none" }}
            />
        );
    }

    // Handle DLive via iframe (loads the channel page directly)
    if (channel.platform === "dlive") {
        const username = channel.username;
        return (
            <iframe
                src={`https://dlive.tv/${username}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Handle Trovo via iframe
    if (channel.platform === "trovo") {
        const username = channel.username;
        return (
            <iframe
                src={`https://player.trovo.live/embed/player?theatre=true&channel=${username}&autoplay=${playing}&muted=${muted}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Handle Rumble via iframe
    if (channel.platform === "rumble") {
        const embedId = channel.username; // Rumble embed ID
        return (
            <iframe
                src={`https://rumble.com/embed/${embedId}/?pub=4&autoplay=${playing ? 2 : 1}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Handle Bilibili via iframe
    if (channel.platform === "bilibili") {
        // ID is expected to be the BV ID (e.g. BV1xx411c7X7)
        return (
            <iframe
                src={`//player.bilibili.com/player.html?bvid=${channel.username}&page=1&autoplay=${playing ? 1 : 0}&muted=${muted ? 1 : 0}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Handle Niconico via iframe
    if (channel.platform === "niconico") {
        // ID is expected to be video ID (e.g. sm123456)
        return (
            <iframe
                src={`https://embed.nicovideo.jp/watch/${channel.username}?autoplay=${playing ? 1 : 0}&muted=${muted ? 1 : 0}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Non-embeddable platforms — return null (caller should not render)
    if (!isEmbeddablePlatform(channel.platform)) {
        return null;
    }

    // Fallback: other platforms via ReactPlayer
    const Player = ReactPlayer as any;
    
    const reactPlayerUrl = channel.streamUrl;

    return (
        <Player
            ref={playerRef}
            url={reactPlayerUrl}
            width="100%"
            height="100%"
            playing={playing}
            muted={muted}
            volume={volume}
            controls={true}
            onPlay={onPlay}
            onPause={onPause}
            onError={(e: any) => {
                console.error("StreamPlayer Error:", e);
                setHasError(true);
                if (onError) onError(e);
            }}
            style={{ position: "absolute", top: 0, left: 0 }}
        />
    );
};
