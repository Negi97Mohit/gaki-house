import React, { useState } from "react";
import { Radio, Eye, EyeOff, Loader2, Wifi, WifiOff, Plus, Trash2, Globe, Check } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { STREAMING_PLATFORMS } from "@/data/streamingPlatforms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Switch } from "@/shared/ui/switch";
import { useStreamStore, StreamDestination } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";
import { v4 as uuidv4 } from 'uuid';

interface StreamConfigurationModalProps {
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
}

const PlatformIcon: React.FC<{ platformIconName: string; color?: string; size?: number }> = ({ platformIconName, color = '#fff', size = 24 }) => {
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

  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('custom');
  const [newUrl, setNewUrl] = useState('');
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);

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

  const selectedPlatform = STREAMING_PLATFORMS.find(p => p.id === selectedPlatformId);

  const handleAddDestination = () => {
    if (!newKey && !newUrl) return;

    const dest: StreamDestination = {
      id: uuidv4(),
      platform: selectedPlatform ? selectedPlatform.name : 'Custom',
      url: newUrl,
      key: newKey,
      enabled: true,
      status: 'idle'
    };

    addDestination(dest);
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
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-xl h-7 w-7 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all",
          isBroadcasting && "bg-red-500/10 text-red-500 hover:bg-red-500/20 animate-pulse"
        )}
        title="Stream Settings"
        onClick={() => setIsOpen(true)}
      >
        {isBroadcasting ? <Wifi className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
      </Button>

      <DialogContent className={cn(
        "sm:max-w-[480px] p-0 gap-0 overflow-hidden",
        "bg-background/80 dark:bg-background/60 backdrop-blur-2xl",
        "border-border/20 dark:border-white/10 rounded-2xl",
        "shadow-2xl shadow-black/10 dark:shadow-black/40"
      )}>
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

        {/* Header */}
        <DialogHeader className="relative px-5 pt-5 pb-4 border-b border-border/10 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center",
              isBroadcasting ? "bg-red-500/15" : "bg-primary/10"
            )}>
              {isBroadcasting ? (
                <Wifi className="w-4 h-4 text-red-500 animate-pulse" />
              ) : (
                <Radio className="w-4 h-4 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
                Multi-Stream
                {isBroadcasting && (
                  <span className="text-red-500 text-[8px] uppercase border border-red-500/50 px-1.5 py-0.5 rounded-md font-semibold animate-pulse">
                    Live
                  </span>
                )}
              </DialogTitle>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                Manage streaming destinations
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <div className="px-5 pt-4">
            <TabsList className="w-full grid grid-cols-2 h-8 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.04] p-0.5">
              <TabsTrigger 
                value="manage" 
                className="text-[10px] font-medium rounded-lg h-7 transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
              >
                Destinations ({destinations.length})
              </TabsTrigger>
              <TabsTrigger 
                value="add" 
                className="text-[10px] font-medium rounded-lg h-7 transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm flex items-center gap-1"
              >
                <Plus className="w-2.5 h-2.5" />
                Add New
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Manage Tab */}
          <TabsContent value="manage" className="m-0 p-5 space-y-4">
            {destinations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-foreground/[0.03] dark:bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                  <Radio className="w-5 h-5 text-muted-foreground/30" />
                </div>
                <p className="text-[11px] text-muted-foreground/60 mb-2">No destinations added</p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('add')} 
                  className="text-[10px] h-7 text-primary hover:text-primary"
                >
                  Add your first destination
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[240px] pr-1" style={{ scrollbarWidth: 'none' }}>
                <div className="space-y-2">
                  {destinations.map(dest => {
                    const platformData = STREAMING_PLATFORMS.find(p => p.name === dest.platform) || { color: '#888', icon: 'default' };
                    return (
                      <div 
                        key={dest.id} 
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all",
                          "bg-foreground/[0.02] dark:bg-white/[0.02]",
                          "border border-border/10 dark:border-white/5",
                          "hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-background/50 shrink-0">
                          <PlatformIcon platformIconName={platformData.icon} color={platformData.color} size={16} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-[11px] font-medium truncate">{dest.platform}</h4>
                            {dest.status === 'live' && (
                              <span className="text-[7px] bg-green-500/20 text-green-500 px-1 py-0.5 rounded font-semibold">LIVE</span>
                            )}
                            {dest.status === 'starting' && (
                              <span className="text-[7px] bg-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded font-semibold">STARTING</span>
                            )}
                            {dest.status === 'error' && (
                              <span className="text-[7px] bg-red-500/20 text-red-500 px-1 py-0.5 rounded font-semibold">ERROR</span>
                            )}
                          </div>
                          <p className="text-[9px] text-muted-foreground/50 truncate font-mono mt-0.5">
                            {dest.url}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {dest.status === 'idle' || dest.status === 'error' ? (
                            isBroadcasting ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-[9px] px-2 rounded-lg"
                                onClick={() => onStartStream?.(dest.url, dest.key)}
                                disabled={!dest.enabled}
                              >
                                Start
                              </Button>
                            ) : (
                              <Switch
                                checked={dest.enabled}
                                onCheckedChange={(checked) => updateDestination(dest.id, { enabled: checked })}
                                className="scale-75"
                              />
                            )
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-6 text-[9px] px-2 rounded-lg"
                              onClick={() => onStopStream?.()}
                            >
                              Stop
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-lg text-muted-foreground/50 hover:text-destructive"
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

            {/* Master Controls */}
            <div className="pt-3 border-t border-border/10 dark:border-white/5">
              {!isBroadcasting ? (
                <Button
                  className="w-full h-10 rounded-xl font-medium text-[11px]"
                  onClick={() => {
                    const firstEnabled = destinations.find(d => d.enabled);
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
                  Go Live to {activeCount} Destination{activeCount !== 1 ? 's' : ''}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full h-10 rounded-xl font-medium text-[11px]"
                  onClick={() => onStopStream?.()}
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  End All Broadcasts
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Add Tab */}
          <TabsContent value="add" className="m-0 p-5">
            <div className="space-y-4">
              {/* Platform Grid */}
              <div>
                <Label className="text-[10px] mb-2 block text-muted-foreground/70">Choose Platform</Label>
                <ScrollArea className="h-[100px] rounded-xl border border-border/10 dark:border-white/5 bg-foreground/[0.01] dark:bg-white/[0.01] p-2" style={{ scrollbarWidth: 'none' }}>
                  <div className="grid grid-cols-5 gap-1.5">
                    <button
                      onClick={() => handlePlatformSelect('custom')}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                        "border border-transparent",
                        selectedPlatformId === 'custom'
                          ? "bg-primary/10 border-primary/30 text-primary"
                          : "hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="w-6 h-6 rounded-lg bg-foreground/[0.05] dark:bg-white/[0.05] flex items-center justify-center">
                        <Globe className="w-3 h-3" />
                      </div>
                      <span className="text-[8px] font-medium">Custom</span>
                    </button>
                    {STREAMING_PLATFORMS.filter(p => !p.comingSoon).slice(0, 9).map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePlatformSelect(p.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all",
                          "border border-transparent",
                          selectedPlatformId === p.id
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                        )}
                      >
                        <div className="w-6 h-6 rounded-lg bg-foreground/[0.05] dark:bg-white/[0.05] flex items-center justify-center">
                          <PlatformIcon platformIconName={p.icon} color={p.color} size={12} />
                        </div>
                        <span className="text-[8px] font-medium truncate w-full text-center">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="stream-url" className="text-[10px] font-medium text-muted-foreground/70">Stream URL</Label>
                  <Input
                    id="stream-url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="rtmp://..."
                    className={cn(
                      "h-8 text-[11px] rounded-xl",
                      "bg-foreground/[0.02] dark:bg-white/[0.02]",
                      "border-border/10 dark:border-white/5",
                      "focus-visible:border-primary/20"
                    )}
                  />
                  {selectedPlatform?.rtmpUrl && (
                    <p className="text-[9px] text-muted-foreground/40 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5 text-green-500" />
                      Default server for {selectedPlatform.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="stream-key" className="text-[10px] font-medium text-muted-foreground/70">Stream Key</Label>
                  <div className="relative">
                    <Input
                      id="stream-key"
                      type={showKey ? "text" : "password"}
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      placeholder="live_..."
                      className={cn(
                        "h-8 text-[11px] pr-9 rounded-xl",
                        "bg-foreground/[0.02] dark:bg-white/[0.02]",
                        "border-border/10 dark:border-white/5",
                        "focus-visible:border-primary/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                    >
                      {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-full h-9 rounded-xl font-medium text-[11px] mt-2"
                  disabled={!newUrl || !newKey}
                  onClick={handleAddDestination}
                >
                  <Plus className="w-3 h-3 mr-1.5" />
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
