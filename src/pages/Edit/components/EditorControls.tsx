import React from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";

interface EditorControlsProps {
    show: boolean;
    onClose: () => void;
    volume: number;
    setVolume: (val: number) => void;
}

export const EditorControls = React.memo(({
    show,
    onClose,
    volume,
    setVolume
}: EditorControlsProps) => {
    if (!show) return null;

    return (
        <div className="absolute top-4 right-4 w-80 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-right-5 duration-200" style={{ zIndex: 50 }}>
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <h3 className="text-sm font-medium">Editor Controls</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-6 w-6"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <Tabs defaultValue="effects" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b border-neutral-800 bg-transparent p-0">
                    <TabsTrigger
                        value="effects"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                        Effects
                    </TabsTrigger>
                    <TabsTrigger
                        value="color"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                        Color
                    </TabsTrigger>
                    <TabsTrigger
                        value="audio"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                        Audio
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="effects" className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-400">Blur</Label>
                        <Slider defaultValue={[0]} max={100} step={1} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-400">Brightness</Label>
                        <Slider defaultValue={[100]} max={200} step={1} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-400">Contrast</Label>
                        <Slider defaultValue={[100]} max={200} step={1} className="w-full" />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-neutral-400">Vignette</Label>
                        <Switch />
                    </div>
                </TabsContent>

                <TabsContent value="color" className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-400">Saturation</Label>
                        <Slider defaultValue={[100]} max={200} step={1} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-400">Temperature</Label>
                        <Slider defaultValue={[0]} min={-100} max={100} step={1} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-400">Tint</Label>
                        <Slider defaultValue={[0]} min={-100} max={100} step={1} className="w-full" />
                    </div>
                </TabsContent>

                <TabsContent value="audio" className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                        <Label className="text-xs text-neutral-400">Volume</Label>
                        <Slider
                            value={[volume]}
                            onValueChange={(v) => setVolume(v[0])}
                            max={100}
                            step={1}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-neutral-400">Fade In</Label>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-neutral-400">Fade Out</Label>
                        <Switch />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
});
