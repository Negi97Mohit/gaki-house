import React from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Loader2, Smartphone, CheckCircle2 } from "lucide-react";

interface RemoteConnectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  peerId: string | null;
  isConnected: boolean;
}

export const RemoteConnectModal = ({
  isOpen,
  onOpenChange,
  peerId,
  isConnected,
}: RemoteConnectModalProps) => {
  // DETECT ELECTRON: If in Electron, we can't use window.location.host (it might be a file path)
  // You should replace 'https://app.captioncam.com' with your actual production URL
  const isElectron = navigator.userAgent.toLowerCase().includes("electron");
  const baseUrl = isElectron
    ? "https://caption-cam.vercel.app" // REPLACE with your hosted web app URL
    : `${window.location.protocol}//${window.location.host}`;

  const connectionUrl = peerId ? `${baseUrl}/remote-cam?target=${peerId}` : "";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle>Connect Remote Camera</DialogTitle>
          <DialogDescription>
            Scan this QR code with your phone to use it as a camera and
            microphone. Make sure your phone has internet access.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          {isConnected ? (
            <div className="flex flex-col items-center text-green-500 space-y-2">
              <CheckCircle2 className="w-16 h-16" />
              <p className="font-medium text-lg">Connected!</p>
              <p className="text-sm text-muted-foreground text-center">
                Your phone camera is now active. You can close this window.
              </p>
            </div>
          ) : peerId ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <QRCodeSVG value={connectionUrl} size={200} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded select-all">
                  {connectionUrl}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="w-4 h-4" />
                  <span>Waiting for connection...</span>
                </div>
                <p className="text-xs text-yellow-500 text-center px-4">
                  Note: Don't forget to switch on the Camera Here after
                  connecting.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Initializing connection...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
