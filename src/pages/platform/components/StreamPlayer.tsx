import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { StreamChannel } from "../data/mockData";

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
    const playerRef = useRef<ReactPlayer>(null);
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
            <iframe
                src={`https://player.kick.com/${slug}?autoplay=${playing}&muted=${muted}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Handle Twitch via Iframe (More reliable than ReactPlayer for parent config)
    if (channel.platform === "twitch") {
        const username = channel.username.replace("tw-", ""); // Remove our prefix if present
        const hostname = window.location.hostname;
        // Construct parent params - Twitch requires the exact domain of the embedding site
        // We include localhost and 127.0.0.1 for dev
        const origin = window.location.origin;
        let parent = `parent=localhost&parent=127.0.0.1`;
        if (hostname !== "localhost" && hostname !== "127.0.0.1") {
            parent += `&parent=${hostname}`;
        }

        return (
            <iframe
                src={`https://player.twitch.tv/?channel=${username}&${parent}&autoplay=${playing}&muted=${muted}`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                style={{ border: "none" }}
            />
        );
    }

    // Handle YouTube via ReactPlayer (Standard)
    return (
        <ReactPlayer
            ref={playerRef}
            url={channel.streamUrl}
            width="100%"
            height="100%"
            playing={playing}
            muted={muted}
            volume={volume}
            controls={false}
            config={{
                youtube: {
                    playerVars: { showinfo: 1, controls: 0 }
                }
            }}
            onPlay={onPlay}
            onPause={onPause}
            onError={(e) => {
                console.error("StreamPlayer Error:", e);
                setHasError(true);
                if (onError) onError(e);
            }}
            style={{ position: "absolute", top: 0, left: 0 }}
        />
    );
};
