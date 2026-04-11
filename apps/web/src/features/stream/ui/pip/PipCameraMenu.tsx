import React from "react";
import { Camera } from "lucide-react";
import { Button } from "@caption-cam/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
} from "@caption-cam/ui/dropdown-menu";

interface PipCameraMenuProps {
    videoDevices: MediaDeviceInfo[];
    selectedDeviceId?: string;
    onCameraDeviceChange: (deviceId: string) => void;
}

export const PipCameraMenu: React.FC<PipCameraMenuProps> = ({
    videoDevices,
    selectedDeviceId,
    onCameraDeviceChange,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-background/60"
                    title="Select Camera"
                >
                    <Camera className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="start"
                className="z-[var(--z-text-toolbar)] bg-background/95 backdrop-blur-xl border-border/40"
            >
                <DropdownMenuLabel className="text-xs">Camera Source</DropdownMenuLabel>
                {videoDevices.map((device, i) => (
                    <DropdownMenuCheckboxItem
                        key={device.deviceId}
                        checked={selectedDeviceId === device.deviceId}
                        onCheckedChange={() => onCameraDeviceChange(device.deviceId)}
                    >
                        {device.label || `Camera ${i + 1}`}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
