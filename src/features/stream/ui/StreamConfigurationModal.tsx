import React, { useState } from "react";
import {
  Radio,
  Eye,
  EyeOff,
  Loader2,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  Globe,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { STREAMING_PLATFORMS } from "@/data/streamingPlatforms";
import { Switch } from "@/shared/ui/switch";
import { useStreamStore, StreamDestination } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";
import { v4 as uuidv4 } from "uuid";

interface StreamConfigurationModalProps {
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
}

const PlatformIcon: React.FC<{
  platformIconName: string;
  color?: string;
  size?: number;
}> = ({ platformIconName, color = "#fff", size = 24 }) => {
  const iconMap: Record<string, React.ReactNode> = {
    youtube: (
      <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    twitch: (
      <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    facebook: (
      <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    default: (
      <div
        className="rounded-full flex items-center justify-center text-white font-bold text-[8px]"
        style={{ backgroundColor: color, width: size, height: size }}
      >
        {platformIconName ? platformIconName.charAt(0).toUpperCase() : "?"}
      </div>
    ),
  };

  return <>{iconMap[platformIconName] || iconMap.default}</>;
};

export const StreamConfigurationModal: React.FC<
  StreamConfigurationModalProps
> = ({ onStartStream, onStopStream }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"list" | "add">("list");

  const [selectedPlatformId, setSelectedPlatformId] =
    useState<string>("custom");
  const [newUrl, setNewUrl] = useState("");
  const [newKey, setNewKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const {
    destinations,
    addDestination,
    removeDestination,
    updateDestination,
    isBroadcasting,
    isConnecting,
  } = useStreamStore(
    useShallow((state) => ({
      destinations: state.destinations,
      addDestination: state.addDestination,
      removeDestination: state.removeDestination,
      updateDestination: state.updateDestination,
      isBroadcasting: state.isBroadcasting,
      isConnecting: state.isConnecting,
    }))
  );

  const selectedPlatform = STREAMING_PLATFORMS.find(
    (p) => p.id === selectedPlatformId
  );

  const handleAddDestination = () => {
    if (!newKey && !newUrl) return;

    const dest: StreamDestination = {
      id: uuidv4(),
      platform: selectedPlatform ? selectedPlatform.name : "Custom",
      url: newUrl,
      key: newKey,
      enabled: true,
      status: "idle",
    };

    addDestination(dest);
    setNewUrl("");
    setNewKey("");
    setView("list");
  };

  const handlePlatformSelect = (id: string) => {
    setSelectedPlatformId(id);
    const plat = STREAMING_PLATFORMS.find((p) => p.id === id);
    if (plat && plat.rtmpUrl) {
      setNewUrl(plat.rtmpUrl);
    } else {
      setNewUrl("");
    }
  };

  const activeCount = destinations.filter((d) => d.enabled).length;

  const resetAndClose = () => {
    setView("list");
    setNewUrl("");
    setNewKey("");
    setSelectedPlatformId("custom");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetAndClose();
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-xl h-7 w-7 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all",
          isBroadcasting &&
            "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse"
        )}
        title="Stream Settings"
        onClick={() => setIsOpen(true)}
      >
        {isBroadcasting ? (
          <Wifi className="w-3 h-3" />
        ) : (
          <Radio className="w-3 h-3" />
        )}
      </Button>

      <DialogContent
        className={cn(
          "w-[360px] max-w-[90vw] p-0 gap-0",
          "bg-background dark:bg-zinc-950",
          "border border-border/40 dark:border-white/10",
          "rounded-2xl shadow-2xl",
          "overflow-hidden"
        )}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center",
                  isBroadcasting
                    ? "bg-red-500/10 ring-1 ring-red-500/20"
                    : "bg-foreground/5 dark:bg-white/5 ring-1 ring-border/10 dark:ring-white/5"
                )}
              >
                {isBroadcasting ? (
                  <div className="relative">
                    <Wifi className="w-4 h-4 text-red-500" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <Radio className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold tracking-tight">
                  {view === "add" ? "New Destination" : "Stream"}
                </DialogTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {view === "add"
                    ? "Configure your stream endpoint"
                    : isBroadcasting
                      ? "Currently broadcasting"
                      : `${destinations.length} destination${destinations.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            {isBroadcasting && (
              <span className="text-[9px] uppercase tracking-wider font-semibold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                Live
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="h-px bg-border/30 dark:bg-white/5" />

        {/* Content */}
        <div className="p-4">
          {view === "list" ? (
            <div className="space-y-3">
              {/* Destinations List */}
              {destinations.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-foreground/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Radio className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs text-muted-foreground/60 mb-1">
                    No destinations
                  </p>
                  <p className="text-[10px] text-muted-foreground/40">
                    Add a stream destination to get started
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[180px]">
                  <div className="space-y-2">
                    {destinations.map((dest) => {
                      const platformData = STREAMING_PLATFORMS.find(
                        (p) => p.name === dest.platform
                      ) || { color: "#666", icon: "default" };

                      return (
                        <div
                          key={dest.id}
                          className={cn(
                            "group flex items-center gap-3 p-3 rounded-xl",
                            "bg-foreground/[0.02] dark:bg-white/[0.02]",
                            "border border-transparent",
                            "hover:border-border/20 dark:hover:border-white/10",
                            "transition-all duration-200"
                          )}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${platformData.color}15` }}
                          >
                            <PlatformIcon
                              platformIconName={platformData.icon}
                              color={platformData.color}
                              size={14}
                            />
                          </div>

                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium truncate">
                                {dest.platform}
                              </span>
                              {dest.status === "live" && (
                                <span className="shrink-0 text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide">
                                  Live
                                </span>
                              )}
                              {dest.status === "error" && (
                                <span className="shrink-0 text-[8px] bg-red-500/15 text-red-500 px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide">
                                  Error
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5 font-mono max-w-full">
                              {dest.url || "No URL set"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Switch
                              checked={dest.enabled}
                              onCheckedChange={(checked) =>
                                updateDestination(dest.id, { enabled: checked })
                              }
                              className="scale-[0.7] data-[state=checked]:bg-emerald-500"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeDestination(dest.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {/* Add Destination Button */}
              <button
                onClick={() => setView("add")}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl",
                  "border border-dashed border-border/30 dark:border-white/10",
                  "hover:border-primary/30 hover:bg-primary/[0.02]",
                  "transition-all duration-200 group"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Add destination
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </button>

              {/* Go Live Button */}
              {destinations.length > 0 && (
                <div className="pt-2">
                  {!isBroadcasting ? (
                    <Button
                      className={cn(
                        "w-full h-11 rounded-xl font-medium text-xs",
                        "bg-foreground text-background dark:bg-white dark:text-black",
                        "hover:opacity-90 transition-opacity"
                      )}
                      onClick={() => {
                        const firstEnabled = destinations.find((d) => d.enabled);
                        if (firstEnabled) {
                          onStartStream?.(firstEnabled.url, firstEnabled.key);
                        }
                      }}
                      disabled={isConnecting || activeCount === 0}
                    >
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Wifi className="w-4 h-4 mr-2" />
                      )}
                      Go Live
                      {activeCount > 0 && (
                        <span className="ml-1.5 text-[10px] opacity-60">
                          ({activeCount})
                        </span>
                      )}
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        "w-full h-11 rounded-xl font-medium text-xs",
                        "bg-red-500 hover:bg-red-600 text-white"
                      )}
                      onClick={() => onStopStream?.()}
                    >
                      <WifiOff className="w-4 h-4 mr-2" />
                      End Broadcast
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Add View */
            <div className="space-y-4">
              {/* Platform Grid */}
              <div className="space-y-2">
                <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  Platform
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  <button
                    onClick={() => handlePlatformSelect("custom")}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
                      selectedPlatformId === "custom"
                        ? "bg-foreground/10 dark:bg-white/10 ring-1 ring-foreground/20 dark:ring-white/20"
                        : "hover:bg-foreground/5 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="w-7 h-7 rounded-md bg-foreground/10 dark:bg-white/10 flex items-center justify-center">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[8px] font-medium text-muted-foreground">
                      Custom
                    </span>
                  </button>
                  {STREAMING_PLATFORMS.filter((p) => !p.comingSoon)
                    .slice(0, 4)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handlePlatformSelect(p.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
                          selectedPlatformId === p.id
                            ? "bg-foreground/10 dark:bg-white/10 ring-1 ring-foreground/20 dark:ring-white/20"
                            : "hover:bg-foreground/5 dark:hover:bg-white/5"
                        )}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${p.color}20` }}
                        >
                          <PlatformIcon
                            platformIconName={p.icon}
                            color={p.color}
                            size={14}
                          />
                        </div>
                        <span className="text-[8px] font-medium text-muted-foreground truncate w-full text-center">
                          {p.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                    Stream URL
                  </p>
                  {selectedPlatform?.rtmpUrl && (
                    <span className="text-[9px] text-emerald-500 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      Auto-filled
                    </span>
                  )}
                </div>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="rtmp://..."
                  className={cn(
                    "h-10 text-xs rounded-lg font-mono",
                    "bg-foreground/[0.03] dark:bg-white/[0.03]",
                    "border-border/20 dark:border-white/10",
                    "focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:border-transparent",
                    "placeholder:text-muted-foreground/30"
                  )}
                />
              </div>

              {/* Key Input */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                  Stream Key
                </p>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="Enter your stream key"
                    className={cn(
                      "h-10 text-xs rounded-lg pr-10 font-mono",
                      "bg-foreground/[0.03] dark:bg-white/[0.03]",
                      "border-border/20 dark:border-white/10",
                      "focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:border-transparent",
                      "placeholder:text-muted-foreground/30"
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md hover:bg-foreground/5"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground/50" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground/50" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  className="flex-1 h-10 rounded-lg text-xs font-medium"
                  onClick={() => setView("list")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDestination}
                  disabled={!newKey && !newUrl}
                  className={cn(
                    "flex-1 h-10 rounded-lg text-xs font-medium",
                    "bg-foreground text-background dark:bg-white dark:text-black",
                    "hover:opacity-90 disabled:opacity-40"
                  )}
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
