import React, { useState, useEffect } from "react";
import { Radio, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";

interface StreamConfigurationModalProps {
  defaultStreamUrl?: string;
  defaultStreamKey?: string;
  onSave?: (url: string, key: string) => void;
  // New props for RTMP
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
  isBroadcasting?: boolean; // Now means "RTMP Streaming"
  isConnecting?: boolean;
  status?: string;
}

export const StreamConfigurationModal: React.FC<
  StreamConfigurationModalProps
> = ({
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

    // Update local state when defaults change (e.g. from hook persistence)
    useEffect(() => {
      if (defaultStreamUrl) setStreamUrl(defaultStreamUrl);
      if (defaultStreamKey) setStreamKey(defaultStreamKey);
    }, [defaultStreamUrl, defaultStreamKey]);

    const handleAction = () => {
      if (isBroadcasting) {
        if (onStopStream) onStopStream();
      } else {
        if (onStartStream) onStartStream(streamUrl, streamKey);
      }
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
            title="Stream Settings"
          >
            <Radio className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Stream Configuration
              {isBroadcasting && <span className="text-red-500 text-xs uppercase border border-red-500 px-2 py-0.5 rounded-full">Live</span>}
            </DialogTitle>
            <DialogDescription>
              Enter your RTMP details below to start broadcasting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stream-url">Stream URL</Label>
              <Input
                id="stream-url"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="rtmp://..."
                className="col-span-3"
                disabled={isBroadcasting || isConnecting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stream-key">Stream Key</Label>
              <div className="relative">
                <Input
                  id="stream-key"
                  type={showKey ? "text" : "password"}
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  placeholder="live_..."
                  className="pr-10"
                  disabled={isBroadcasting || isConnecting}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isBroadcasting || isConnecting}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            {status && status !== "Idle" && (
              <div className={cn("text-xs flex items-center gap-2 p-2 rounded",
                status.startsWith("error") ? "bg-red-500/10 text-red-500" : "bg-neutral-800 text-neutral-300"
              )}>
                {status.startsWith("error") && <AlertCircle className="w-4 h-4" />}
                {status}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isConnecting}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleAction}
              variant={isBroadcasting ? "destructive" : "default"}
              disabled={isConnecting}
            >
              {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isBroadcasting ? "End Broadcast" : "Go Live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
