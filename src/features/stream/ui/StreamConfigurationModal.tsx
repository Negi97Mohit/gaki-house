import React, { useState } from "react";
import { Radio, Eye, EyeOff } from "lucide-react";
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
  isBroadcasting?: boolean;
}

export const StreamConfigurationModal: React.FC<
  StreamConfigurationModalProps
> = ({
  defaultStreamUrl = "rtmp://live.twitch.tv/app/",
  defaultStreamKey = "",
  onSave,
  isBroadcasting = false,
}) => {
  const [streamUrl, setStreamUrl] = useState(defaultStreamUrl);
  const [streamKey, setStreamKey] = useState(defaultStreamKey);
  const [showKey, setShowKey] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(streamUrl, streamKey);
    }
    setIsOpen(false);
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
              "bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600",
            !isBroadcasting && isOpen && "bg-primary/20 text-primary"
          )}
          title="Stream Settings"
        >
          <Radio className={cn("w-4 h-4", isBroadcasting && "animate-pulse")} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle>Stream Configuration</DialogTitle>
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
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} type="submit">
            {isBroadcasting ? "Update Stream" : "Ready to Stream"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
