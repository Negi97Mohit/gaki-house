// src/features/stream/ui/StreamConfigurationModal.tsx

import React, { useState, useEffect } from "react";
import {
  Radio,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Settings2,
  Wifi,
  WifiOff,
  Trash2,
  Link,
  Key,
  Plus,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  STREAMING_PLATFORMS,
  StreamingPlatform,
} from "@/data/streamingPlatforms";
import { Separator } from "@/shared/ui/separator";

// --- Types ---

export interface StreamTarget {
  id: string;
  platformId: string;
  name: string;
  url: string;
  key: string;
  // UI state to toggle showing the URL field for preset platforms
  showUrl?: boolean;
}

interface StreamConfigurationModalProps {
  onStartStream?: (targets: StreamTarget[]) => void;
  onStopStream?: () => void;
  isBroadcasting?: boolean;
  isConnecting?: boolean;
  status?: string;

  // Legacy
  defaultStreamUrl?: string;
  defaultStreamKey?: string;
}

// --- Icons ---

const PlatformIcon: React.FC<{
  platform: StreamingPlatform;
  size?: number;
}> = ({ platform, size = 24 }) => {
  const iconMap: Record<string, React.ReactNode> = {
    // ... (Keep existing SVGs or use this simplified mapping for brevity)
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
    kick: (
      <svg viewBox="0 0 24 24" fill={platform.color} width={size} height={size}>
        <path d="M3 0h18a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm4 5h3.5l5 6.5-5 6.5H7l3.5-5L7 5z" />
      </svg>
    ),
    default: (
      <div
        className="rounded-md flex items-center justify-center text-white font-bold text-[10px]"
        style={{ backgroundColor: platform.color, width: size, height: size }}
      >
        {platform.name.charAt(0)}
      </div>
    ),
  };

  return <>{iconMap[platform.icon] || iconMap.default}</>;
};

export const StreamConfigurationModal: React.FC<
  StreamConfigurationModalProps
> = ({
  onStartStream,
  onStopStream,
  isBroadcasting = false,
  isConnecting = false,
  status = "Idle",
  defaultStreamUrl,
  defaultStreamKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targets, setTargets] = useState<StreamTarget[]>([]);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  // Initialize defaults
  useEffect(() => {
    if (defaultStreamUrl && targets.length === 0) {
      setTargets([
        {
          id: "default",
          platformId: "custom",
          name: "Custom",
          url: defaultStreamUrl,
          key: defaultStreamKey || "",
          showUrl: true,
        },
      ]);
    }
  }, [defaultStreamUrl, defaultStreamKey]);

  // Handlers
  const handleAddPlatform = (platform: StreamingPlatform) => {
    const isCustom = platform.id === "custom";
    const newTarget: StreamTarget = {
      id: Math.random().toString(36).substr(2, 9),
      platformId: platform.id,
      name: platform.name,
      url: platform.rtmpUrl || "",
      key: "",
      showUrl: isCustom || !platform.rtmpUrl, // Auto-show URL input if no default exists
    };
    setTargets((prev) => [...prev, newTarget]);
  };

  const handleRemoveTarget = (id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTarget = (
    id: string,
    field: keyof StreamTarget,
    value: string | boolean
  ) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleGoLive = () => {
    if (isBroadcasting) {
      onStopStream?.();
      setIsOpen(false);
    } else {
      const validTargets = targets.filter((t) => t.url && t.key);
      if (validTargets.length === 0) return;
      onStartStream?.(validTargets);
      setIsOpen(false);
    }
  };

  // Helper to get platform visual data
  const getPlatformMeta = (id: string) => {
    if (id === "custom")
      return {
        id: "custom",
        name: "Custom",
        color: "#64748b",
        icon: "settings",
        category: "selfhosted",
      } as StreamingPlatform;
    return (
      STREAMING_PLATFORMS.find((p) => p.id === id) ||
      ({
        id,
        name: id,
        color: "#64748b",
        icon: "default",
        category: "selfhosted",
      } as StreamingPlatform)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-10 w-10 hover:bg-background/60",
            isBroadcasting &&
              "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 animate-pulse",
            !isBroadcasting && isOpen && "bg-primary/20 text-primary"
          )}
        >
          {isBroadcasting ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <Radio className="w-4 h-4" />
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden shadow-2xl">
        {/* Compact Header */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isBroadcasting ? "bg-red-500 animate-pulse" : "bg-primary"
              )}
            />
            <DialogTitle className="text-sm font-semibold">
              {isBroadcasting ? "Broadcast Active" : "Stream Setup"}
            </DialogTitle>
          </div>
          {status && status !== "Idle" && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                status.startsWith("error")
                  ? "bg-red-500/10 text-red-500"
                  : "bg-primary/10 text-primary"
              )}
            >
              {status}
            </span>
          )}
        </div>

        <ScrollArea className="max-h-[60vh] overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* 1. CONFIGURATION LIST */}
            <div className="space-y-3">
              {targets.map((target) => {
                const meta = getPlatformMeta(target.platformId);
                const isUrlVisible = target.showUrl;

                return (
                  <div
                    key={target.id}
                    className="group relative flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-card/50 hover:border-border hover:shadow-sm transition-all"
                  >
                    {/* Row Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlatformIcon platform={meta} size={18} />
                        <span className="text-xs font-semibold text-foreground/90">
                          {target.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {!isBroadcasting && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              updateTarget(target.id, "showUrl", !isUrlVisible)
                            }
                            title="Toggle URL Field"
                          >
                            <Link className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveTarget(target.id)}
                          disabled={isBroadcasting}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-2">
                      {isUrlVisible && (
                        <div className="relative">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <Link className="w-3 h-3" />
                          </div>
                          <Input
                            value={target.url}
                            onChange={(e) =>
                              updateTarget(target.id, "url", e.target.value)
                            }
                            placeholder="RTMP URL..."
                            className="h-7 text-[10px] pl-7 font-mono bg-background/50 border-border/40 focus-visible:ring-1"
                            disabled={isBroadcasting}
                          />
                        </div>
                      )}

                      <div className="relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Key className="w-3 h-3" />
                        </div>
                        <Input
                          type={showKey[target.id] ? "text" : "password"}
                          value={target.key}
                          onChange={(e) =>
                            updateTarget(target.id, "key", e.target.value)
                          }
                          placeholder="Stream Key"
                          className="h-7 text-[10px] pl-7 pr-7 font-mono bg-background/50 border-border/40 focus-visible:ring-1"
                          disabled={isBroadcasting}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowKey((prev) => ({
                              ...prev,
                              [target.id]: !prev[target.id],
                            }))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showKey[target.id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. ADD PLATFORM SELECTOR */}
            {!isBroadcasting && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Separator className="flex-1" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Add Destination
                  </span>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {/* Custom Button */}
                  <button
                    onClick={() =>
                      handleAddPlatform({
                        id: "custom",
                        name: "Custom",
                        color: "#64748b",
                      } as any)
                    }
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center group-hover:text-primary">
                      <Settings2 className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground">
                      Custom
                    </span>
                  </button>

                  {/* Top Platforms */}
                  {STREAMING_PLATFORMS.filter((p) => !p.comingSoon)
                    .slice(0, 9)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleAddPlatform(p)}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg border border-transparent hover:bg-muted/50 hover:border-border/50 transition-all group"
                      >
                        <PlatformIcon platform={p} size={28} />
                        <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground truncate w-full text-center">
                          {p.name.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border/50 bg-muted/20">
          <Button
            onClick={handleGoLive}
            variant={isBroadcasting ? "destructive" : "default"}
            disabled={isConnecting || (targets.length === 0 && !isBroadcasting)}
            className="w-full h-9 text-xs font-semibold shadow-sm"
          >
            {isConnecting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            {isBroadcasting ? (
              <>
                <WifiOff className="mr-2 h-3 w-3" /> Stop
              </>
            ) : (
              <>
                <Wifi className="mr-2 h-3 w-3" /> Go Live{" "}
                {targets.length > 0 && `(${targets.length})`}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
