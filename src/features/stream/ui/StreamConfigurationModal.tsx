import React, { useState, useEffect } from "react";
import { Radio, Eye, EyeOff, Loader2, AlertCircle, Settings2, ChevronRight, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { STREAMING_PLATFORMS, PLATFORM_CATEGORIES, StreamingPlatform } from "@/data/streamingPlatforms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

interface StreamConfigurationModalProps {
  defaultStreamUrl?: string;
  defaultStreamKey?: string;
  onSave?: (url: string, key: string) => void;
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
  isBroadcasting?: boolean;
  isConnecting?: boolean;
  status?: string;
}

// Platform Icon Component with colored SVGs
const PlatformIcon: React.FC<{ platform: StreamingPlatform; size?: number }> = ({ platform, size = 24 }) => {
  const iconMap: Record<string, React.ReactNode> = {
    youtube: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    twitch: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    tiktok: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    instagram: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    kick: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <rect width="24" height="24" rx="4" fill={platform.color} />
        <path d="M7 5h3v4.5L13.5 5H17l-4 5 4 9h-3.5l-2.8-6.3L7 17h-.001V5z" fill="black" />
      </svg>
    ),
    rumble: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <circle cx="12" cy="12" r="12" fill={platform.color} />
        <path d="M8 7h5c2.5 0 4 1.5 4 4s-1.5 4-4 4h-2v4H8V7zm3 6h1.5c1 0 1.5-.5 1.5-1.5S13.5 10 12.5 10H11v3z" fill="white" />
      </svg>
    ),
    vimeo: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
      </svg>
    ),
    default: (
      <div
        className="rounded-full flex items-center justify-center text-white font-bold text-xs"
        style={{ backgroundColor: platform.color, width: size, height: size }}
      >
        {platform.name.charAt(0)}
      </div>
    ),
  };

  return <>{iconMap[platform.icon] || iconMap.default}</>;
};

// Platform Card Component
const PlatformCard: React.FC<{
  platform: StreamingPlatform;
  isConnected?: boolean;
  isConnecting?: boolean;
  onClick: () => void;
}> = ({ platform, isConnected, isConnecting, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={platform.comingSoon || isConnecting}
      className={cn(
        "group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200",
        "bg-background/50 hover:bg-background/80 border border-border/50 hover:border-border",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        isConnected && "ring-2 ring-green-500 bg-green-500/10",
        !platform.comingSoon && "hover:scale-105 hover:shadow-lg"
      )}
      style={{
        boxShadow: isConnected ? `0 0 20px ${platform.color}30` : undefined,
      }}
    >
      {/* Status indicator */}
      {isConnected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
      )}

      {/* Coming soon badge */}
      {platform.comingSoon && (
        <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
          Soon
        </span>
      )}

      {/* Icon */}
      <div className={cn(
        "transition-transform duration-200",
        !platform.comingSoon && "group-hover:scale-110"
      )}>
        <PlatformIcon platform={platform} size={32} />
      </div>

      {/* Name */}
      <span className="text-[10px] font-medium text-center text-foreground/80 leading-tight max-w-full truncate">
        {platform.name}
      </span>
    </button>
  );
};

export const StreamConfigurationModal: React.FC<StreamConfigurationModalProps> = ({
  defaultStreamUrl = "",
  defaultStreamKey = "",
  onSave,
  onStartStream,
  onStopStream,
  isBroadcasting = false,
  isConnecting = false,
  status = "Idle",
}) => {
  const [streamUrl, setStreamUrl] = useState(defaultStreamUrl);
  const [streamKey, setStreamKey] = useState(defaultStreamKey);
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'platforms' | 'custom'>('platforms');
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (defaultStreamUrl) setStreamUrl(defaultStreamUrl);
    if (defaultStreamKey) setStreamKey(defaultStreamKey);
  }, [defaultStreamUrl, defaultStreamKey]);

  const handlePlatformClick = (platform: StreamingPlatform) => {
    // Always switch to custom RTMP tab to show the URL
    setActiveTab('custom');

    if (platform.rtmpUrl) {
      setStreamUrl(platform.rtmpUrl);
    } else {
      setStreamUrl('');
    }
  };

  const handleCustomStream = () => {
    if (isBroadcasting) {
      setIsOpen(false);
      onStopStream?.();
    } else {
      onStartStream?.(streamUrl, streamKey);
    }
  };

  useEffect(() => {
    if (status === "Connected" || status.startsWith("Starting")) {
      setIsOpen(false);
    }
  }, [status]);

  const majorPlatforms = STREAMING_PLATFORMS.filter(p => p.category === 'major');
  const gamingPlatforms = STREAMING_PLATFORMS.filter(p => p.category === 'gaming');
  const proPlatforms = STREAMING_PLATFORMS.filter(p => p.category === 'professional');
  const selfHosted = STREAMING_PLATFORMS.filter(p => p.category === 'selfhosted');

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open && isConnecting && onStopStream) {
          onStopStream();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-10 w-10 hover:bg-background/60",
            isBroadcasting && "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 animate-pulse",
            !isBroadcasting && isOpen && "bg-primary/20 text-primary"
          )}
          title="Stream Settings"
        >
          <Radio className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isBroadcasting ? "bg-red-500/20" : "bg-primary/10"
              )}>
                {isBroadcasting ? (
                  <Wifi className="w-5 h-5 text-red-500 animate-pulse" />
                ) : (
                  <Radio className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  Go Live
                  {isBroadcasting && (
                    <span className="text-red-500 text-[10px] uppercase border border-red-500 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                      Live
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {isBroadcasting
                    ? "You're currently broadcasting"
                    : "Connect to your streaming platforms"
                  }
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid grid-cols-2 h-9 bg-muted/50">
              <TabsTrigger value="platforms" className="text-xs">Platforms</TabsTrigger>
              <TabsTrigger value="custom" className="text-xs flex items-center gap-1.5">
                <Settings2 className="w-3 h-3" />
                Custom RTMP
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="m-0 px-6 py-4">
            <ScrollArea className="h-[320px] pr-3">
              <div className="space-y-5">
                {/* Popular */}
                <div>
                  <h4 className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-2">Popular</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {majorPlatforms.map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        isConnected={connectedPlatforms.includes(platform.id)}
                        onClick={() => handlePlatformClick(platform)}
                      />
                    ))}
                  </div>
                </div>

                {/* Gaming */}
                <div>
                  <h4 className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-2">Gaming</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {gamingPlatforms.map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        isConnected={connectedPlatforms.includes(platform.id)}
                        onClick={() => handlePlatformClick(platform)}
                      />
                    ))}
                  </div>
                </div>

                {/* Professional */}
                <div>
                  <h4 className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-2">Professional</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {proPlatforms.map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        isConnected={connectedPlatforms.includes(platform.id)}
                        onClick={() => handlePlatformClick(platform)}
                      />
                    ))}
                  </div>
                </div>

                {/* Self-Hosted */}
                <div>
                  <h4 className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-2">Self-Hosted</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {selfHosted.map((platform) => (
                      <PlatformCard
                        key={platform.id}
                        platform={platform}
                        isConnected={connectedPlatforms.includes(platform.id)}
                        onClick={() => handlePlatformClick(platform)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Custom RTMP Tab */}
          <TabsContent value="custom" className="m-0 px-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stream-url" className="text-xs font-medium">Stream URL</Label>
                <Input
                  id="stream-url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtmp://..."
                  className="h-9 text-sm bg-muted/30 border-border/50"
                  disabled={isBroadcasting || isConnecting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream-key" className="text-xs font-medium">Stream Key</Label>
                <div className="relative">
                  <Input
                    id="stream-key"
                    type={showKey ? "text" : "password"}
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    placeholder="live_..."
                    className="h-9 text-sm pr-10 bg-muted/30 border-border/50"
                    disabled={isBroadcasting || isConnecting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isBroadcasting || isConnecting}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {status && status !== "Idle" && (
                <div className={cn(
                  "text-xs flex items-center gap-2 p-3 rounded-lg",
                  status.startsWith("error") ? "bg-red-500/10 text-red-500" : "bg-muted/50 text-muted-foreground"
                )}>
                  {status.startsWith("error") && <AlertCircle className="w-4 h-4" />}
                  {status}
                </div>
              )}

              <Button
                onClick={handleCustomStream}
                variant={isBroadcasting ? "destructive" : "default"}
                disabled={isConnecting || (!streamUrl || !streamKey)}
                className="w-full h-10 font-medium"
              >
                {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isBroadcasting ? (
                  <>
                    <WifiOff className="mr-2 h-4 w-4" />
                    End Broadcast
                  </>
                ) : (
                  <>
                    <Wifi className="mr-2 h-4 w-4" />
                    Go Live
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-border/50 bg-muted/30">
          <p className="text-[10px] text-muted-foreground text-center">
            {activeTab === 'platforms'
              ? "Click a platform to connect • Coming soon badges indicate future support"
              : "Enter your RTMP credentials to start streaming"
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
