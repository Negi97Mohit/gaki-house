import React, { useState, useEffect } from "react";
import { Radio, Eye, EyeOff, Loader2, AlertCircle, Settings2, ChevronRight, Wifi, WifiOff, Plus, Trash2, Globe, MonitorPlay, Copy } from "lucide-react";
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
import { STREAMING_PLATFORMS, StreamingPlatform } from "@/data/streamingPlatforms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Switch } from "@/shared/ui/switch";
import { useStreamStore, StreamDestination } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";
import { v4 as uuidv4 } from 'uuid';

interface StreamConfigurationModalProps {
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
}

// Platform Icon Component with colored SVGs
const PlatformIcon: React.FC<{ platformIconName: string; color?: string; size?: number }> = ({ platformIconName, color = '#fff', size = 24 }) => {
  // Basic mapping or lookup from data if available. 
  // Since we don't have the full objects passed here easily without lookup, we'll try to match by name or string.
  // Ideally we pass the full platform object.

  // For now, let's reuse the SVG logic but simplified or copied if needed. 
  // Or better, we can assume the platformIconName is the key.

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
    // ... Add others if needed or fallback
    default: (
      <div
        className="rounded-full flex items-center justify-center text-white font-bold text-xs"
        style={{ backgroundColor: color, width: size, height: size }}
      >
        {platformIconName ? platformIconName.charAt(0).toUpperCase() : '?'}
      </div>
    ),
  };

  return <>{iconMap[platformIconName] || iconMap.default}</>;
};


export const StreamConfigurationModal: React.FC<StreamConfigurationModalProps> = ({
  onStartStream,
  onStopStream,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'manage' | 'add'>('manage');

  // Add New Form State
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('custom');
  const [newUrl, setNewUrl] = useState('');
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Store
  const {
    destinations,
    addDestination,
    removeDestination,
    updateDestination,
    isBroadcasting,
    isConnecting
  } = useStreamStore(useShallow((state) => ({
    destinations: state.destinations,
    addDestination: state.addDestination,
    removeDestination: state.removeDestination,
    updateDestination: state.updateDestination,
    isBroadcasting: state.isBroadcasting,
    isConnecting: state.isConnecting
  })));

  // Derived
  const selectedPlatform = STREAMING_PLATFORMS.find(p => p.id === selectedPlatformId);
  const isCustom = selectedPlatformId === 'custom';

  // Handlers
  const handleAddDestination = () => {
    if (!newKey && !newUrl) return; // Basic validation

    // For platforms with preset URLs, use them if user didn't override (or if we hid the input)
    // Actually our UI logic below handles pre-fill.

    const dest: StreamDestination = {
      id: uuidv4(),
      platform: selectedPlatform ? selectedPlatform.name : 'Custom',
      url: newUrl,
      key: newKey,
      enabled: true,
      status: 'idle'
    };

    addDestination(dest);

    // Reset Form
    setNewUrl('');
    setNewKey('');
    setActiveTab('manage');
  };

  const handlePlatformSelect = (id: string) => {
    setSelectedPlatformId(id);
    const plat = STREAMING_PLATFORMS.find(p => p.id === id);
    if (plat && plat.rtmpUrl) {
      setNewUrl(plat.rtmpUrl);
    } else {
      setNewUrl('');
    }
  };

  const activeCount = destinations.filter(d => d.enabled).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          {isBroadcasting ? <Wifi className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden">
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
                  Multi-Stream
                  {isBroadcasting && (
                    <span className="text-red-500 text-[10px] uppercase border border-red-500 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                      Live
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Manage your streaming destinations
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="w-full grid grid-cols-2 h-9 bg-muted/50">
              <TabsTrigger value="manage" className="text-xs">
                Destinations ({destinations.length})
              </TabsTrigger>
              <TabsTrigger value="add" className="text-xs flex items-center gap-1.5">
                <Plus className="w-3 h-3" />
                Add New
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Manage Tab */}
          <TabsContent value="manage" className="m-0 px-6 py-4 space-y-4">
            {destinations.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="text-sm">No destinations added.</p>
                <Button variant="link" onClick={() => setActiveTab('add')} className="text-xs">
                  Add your first destination
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-3">
                  {destinations.map(dest => {
                    const platformData = STREAMING_PLATFORMS.find(p => p.name === dest.platform) || { color: '#888', icon: 'default' };
                    return (
                      <div key={dest.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-background/50 shrink-0">
                          <PlatformIcon platformIconName={platformData.icon} color={platformData.color} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium truncate">{dest.platform}</h4>
                            {dest.status === 'live' && (
                              <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">LIVE</span>
                            )}
                            {dest.status === 'starting' && (
                              <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded">STARTING</span>
                            )}
                            {dest.status === 'error' && (
                              <span className="text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded">ERROR</span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
                            {dest.url}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          {/* Individual Toggle / Start Button */}
                          {dest.status === 'idle' || dest.status === 'error' ? (
                            isBroadcasting ? (
                              // If we are broadly live, allow starting this individual stream
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => onStartStream?.(dest.url, dest.key)}
                                disabled={!dest.enabled}
                              >
                                Start
                              </Button>
                            ) : (
                              // Global toggle for "Next Batch"
                              <Switch
                                checked={dest.enabled}
                                onCheckedChange={(checked) => updateDestination(dest.id, { enabled: checked })}
                              />
                            )
                          ) : (
                            // It is live or starting
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 text-xs"
                              onClick={() => onStopStream?.()}
                            >
                              Stop
                            </Button>
                          )}

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeDestination(dest.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Master Controls */}
            <div className="pt-2 border-t border-border/50">
              {!isBroadcasting ? (
                <Button
                  className="w-full font-semibold"
                  size="lg"
                  onClick={() => {
                    // Start all enabled destinations - pick first or handle batch
                    const firstEnabled = destinations.find(d => d.enabled);
                    if (firstEnabled) {
                      onStartStream?.(firstEnabled.url, firstEnabled.key);
                    }
                  }}
                  disabled={isConnecting || activeCount === 0}
                >
                  {isConnecting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Wifi className="w-5 h-5 mr-2" />
                  )}
                  Go Live to {activeCount} Destination{activeCount !== 1 ? 's' : ''}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full font-semibold"
                  size="lg"
                  onClick={() => onStopStream?.()}
                >
                  <WifiOff className="w-5 h-5 mr-2" />
                  End All Broadcasts
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Add Tab */}
          <TabsContent value="add" className="m-0 px-6 py-4">
            <div className="space-y-4">
              {/* Platform Grid */}
              <div>
                <Label className="text-xs mb-2 block">Choose Platform</Label>
                <ScrollArea className="h-[120px] rounded-lg border border-border/50 bg-muted/20 p-2">
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handlePlatformSelect('custom')}
                      className={cn(
                        "flex flex-col items-center gap-2 p-2 rounded-lg border transition-all",
                        selectedPlatformId === 'custom'
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-transparent hover:bg-muted"
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium">Custom</span>
                    </button>
                    {STREAMING_PLATFORMS.filter(p => !p.comingSoon).map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePlatformSelect(p.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-2 rounded-lg border transition-all",
                          selectedPlatformId === p.id
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-background border-transparent hover:bg-muted"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <PlatformIcon platformIconName={p.icon} color={p.color} size={16} />
                        </div>
                        <span className="text-[10px] font-medium truncate w-full text-center">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="stream-url" className="text-xs font-medium">Stream URL</Label>
                  <Input
                    id="stream-url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="rtmp://..."
                    className="h-9 text-sm bg-muted/30"
                  />
                  {!isCustom && selectedPlatform?.rtmpUrl && (
                    <p className="text-[10px] text-muted-foreground">Default server for {selectedPlatform.name}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="stream-key" className="text-xs font-medium">Stream Key</Label>
                  <div className="relative">
                    <Input
                      id="stream-key"
                      type={showKey ? "text" : "password"}
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="live_..."
                      className="h-9 text-sm pr-10 bg-muted/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  variant="default"
                  className="w-full mt-2"
                  disabled={!newUrl || !newKey}
                  onClick={handleAddDestination}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Destination
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
