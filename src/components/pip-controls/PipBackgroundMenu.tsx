import React, { useRef } from "react";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { BACKGROUND_PRESETS, ASPECT_RATIOS } from "@/lib/backgrounds";

interface PipBackgroundMenuProps {
    showAspectRatio?: boolean;
    cameraAspectRatio: string;
    onCameraAspectRatioChange: (ratio: string) => void;
    customAspectRatio: string;
    onCustomAspectRatioChange: (ratio: string) => void;
    cameraBackground: "none" | "blur" | "image";
    onCameraBackgroundChange: (bgId: "none" | "blur" | "image") => void;
    onCustomBackgroundUpload: (file: File) => void;
}

export const PipBackgroundMenu: React.FC<PipBackgroundMenuProps> = ({
    showAspectRatio = true,
    cameraAspectRatio,
    onCameraAspectRatioChange,
    customAspectRatio,
    onCustomAspectRatioChange,
    cameraBackground,
    onCameraBackgroundChange,
    onCustomBackgroundUpload,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onCustomBackgroundUpload(file);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-background/60"
                        title="Background & Aspect"
                    >
                        <Image className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuContent
                        align="start"
                        className="z-[var(--z-text-toolbar)] w-56 max-h-[400px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40"
                        onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                        {showAspectRatio && (
                            <>
                                <DropdownMenuLabel className="text-xs font-semibold">
                                    Aspect Ratio
                                </DropdownMenuLabel>
                                {ASPECT_RATIOS.map((ratio) => (
                                    <DropdownMenuCheckboxItem
                                        key={ratio.id}
                                        checked={cameraAspectRatio === ratio.id}
                                        onClick={() => onCameraAspectRatioChange(ratio.id)}
                                        className="text-sm"
                                    >
                                        {ratio.name}
                                    </DropdownMenuCheckboxItem>
                                ))}
                                {cameraAspectRatio === "custom" && (
                                    <div className="p-2">
                                        <Input
                                            type="text"
                                            placeholder="e.g., 21:9"
                                            value={customAspectRatio}
                                            onChange={(e) => onCustomAspectRatioChange(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                )}
                                <DropdownMenuSeparator />
                            </>
                        )}

                        <DropdownMenuLabel className="text-xs font-semibold">
                            Background
                        </DropdownMenuLabel>
                        {BACKGROUND_PRESETS.map((bg) => (
                            <DropdownMenuCheckboxItem
                                key={bg.id}
                                checked={
                                    (bg.id === "none" && cameraBackground === "none") ||
                                    (bg.id === "blur" && cameraBackground === "blur") ||
                                    (bg.type === "image" && cameraBackground === "image")
                                }
                                onClick={() =>
                                    onCameraBackgroundChange(bg.id as "none" | "blur" | "image")
                                }
                                className="text-sm"
                            >
                                {bg.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                        <DropdownMenuItem
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm"
                        >
                            <Upload className="w-3.5 h-3.5 mr-2" />
                            Upload
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenuPortal>
            </DropdownMenu>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
                onChange={handleFileUpload}
            />
        </>
    );
};
