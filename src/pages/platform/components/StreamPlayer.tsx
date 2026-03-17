import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { StreamChannel, PlatformType } from "../data/mockData";
import { cn } from "@/shared/lib/utils";

// Platforms that reliably support autoplay embedding (muted)
// Excluded: bilibili (requires login), niconico (requires login), dlive (loads full page, no embed player)
const EMBEDDABLE_PLATFORMS: PlatformType[] = [
  "twitch", "youtube", "kick", "trovo", "rumble"
];

// Platforms rendered via iframe (have their own native controls)
const IFRAME_PLATFORMS: PlatformType[] = [
  "kick", "trovo", "rumble"
];

export function isEmbeddablePlatform(platform?: PlatformType): boolean {
  return !!platform && EMBEDDABLE_PLATFORMS.includes(platform);
}

/** Returns true if the platform uses an iframe with its own native video controls */
export function isIframePlatform(platform?: PlatformType): boolean {
  return !!platform && IFRAME_PLATFORMS.includes(platform);
}

// ---- Twitch Iframe Embed Component ----
// Uses the official Twitch iframe player with all detected parent hosts for preview/published embeds.

function getTwitchParentParam(): string {
  const parents = new Set<string>(["localhost", "127.0.0.1"]);

  const addParent = (value?: string | null) => {
    if (!value) return;
    try {
      const hostname = value.includes("://") ? new URL(value).hostname : value.split(":")[0];
      if (hostname) parents.add(hostname);
    } catch {
      // Ignore malformed values
    }
  };

  addParent(window.location.hostname);
  addParent(document.referrer);

  const ancestorOrigins = window.location.ancestorOrigins;
  if (ancestorOrigins) {
    Array.from(ancestorOrigins).forEach(addParent);
  }

  return Array.from(parents)
    .map((parent) => `parent=${encodeURIComponent(parent)}`)
    .join("&");
}

interface TwitchEmbedProps {
  channel: string;
  autoplay?: boolean;
  muted?: boolean;
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = ({ channel, autoplay = true, muted = true }) => {
  const parentParam = getTwitchParentParam();
  const src = `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parentParam}&autoplay=${autoplay}&muted=${muted}`;

  return (
    <iframe
      key={src}
      src={src}
      title={`Twitch stream: ${channel}`}
      className="w-full h-full"
      allowFullScreen
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
      loading="eager"
      referrerPolicy="origin"
      style={{ border: "none" }}
    />
  );
};
interface StreamPlayerProps {
    channel: StreamChannel;
    className?: string;
    playing?: boolean;
    muted?: boolean;
    volume?: number;
    controls?: boolean;
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
    controls = true,
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

    // Handle Twitch via official iframe player
    if (channel.platform === "twitch") {
        const username = channel.username?.replace(/^tw-/, "")
            || channel.streamUrl?.split("/").filter(Boolean).pop()
            || "";

        if (!username) {
            return null;
        }

        return <TwitchEmbed channel={username} autoplay={playing} muted={muted} />;
    }

    // Handle YouTube via iframe 
    if (channel.platform === "youtube") {
        const videoId = channel.streamUrl?.match(/[?&]v=([^&]+)/)?.[1]
            || channel.id.replace("yt-live-", "").replace("yt-pop-", "");
        return (
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=${playing ? 1 : 0}&mute=${muted ? 1 : 0}&modestbranding=1&rel=0&controls=${controls ? 1 : 0}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                style={{ border: "none" }}
            />
        );
    }

    // DLive: removed — loads full page, no dedicated embed player, requires interaction

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

    // Bilibili & Niconico: removed — require login, don't reliably autoplay

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
