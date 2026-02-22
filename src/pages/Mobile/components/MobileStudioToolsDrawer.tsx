import React, { useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/shared/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { X, Settings2 } from "lucide-react";

import { CanvasDesignsPanel } from "@/features/studio/ui/panels/CanvasDesignsPanel";
import { TextPresetsPanel } from "@/features/studio/ui/panels/TextPresetsPanel";
import { SettingsPanel } from "@/features/studio/ui/panels/SettingsPanel";
// import { DynamicStylesPanel } from "@/features/studio/ui/panels/DynamicStylesPanel"; -> included in TextPresetsPanel

import { CanvasPreset } from "@/types/canvasPreset";
import { CaptionStyle } from "@/types/caption";

export interface MobileStudioToolsDrawerProps {
    // Designs Props
    onCanvasPresetSelect?: (preset: CanvasPreset) => void;
    customCanvasPresets?: CanvasPreset[];
    onSaveCanvasPreset?: (name: string, layout?: any) => void;
    onDeleteCanvasPreset?: (id: string) => void;
    publicPresets?: CanvasPreset[];
    isLoadingPublic?: boolean;
    onShareCanvasPreset?: (preset: CanvasPreset | string, authorName?: string) => void;
    onUnshareCanvasPreset?: (preset: CanvasPreset | string) => void;

    // Text/Caption Props
    style: CaptionStyle;
    onStyleChange: (style: CaptionStyle) => void;
    dynamicStyle: string;
    onDynamicStyleChange: (styleId: string) => void;

    // Trigger Element
    trigger?: React.ReactNode;

    // Controlled State
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    activeTab?: "designs" | "captions" | "camera";
    onActiveTabChange?: (tab: "designs" | "captions" | "camera") => void;
}

export const MobileStudioToolsDrawer: React.FC<MobileStudioToolsDrawerProps> = (props) => {
    const [localActiveTab, setLocalActiveTab] = useState<"designs" | "captions" | "camera">("designs");

    const activeTab = props.activeTab ?? localActiveTab;
    const handleTabChange = (tab: string) => {
        const nextTab = tab as "designs" | "captions" | "camera";
        setLocalActiveTab(nextTab);
        props.onActiveTabChange?.(nextTab);
    };

    return (
        <Drawer open={props.isOpen} onOpenChange={props.onOpenChange}>
            {/* If trigger is provided, we still render it, otherwise headless if fully controlled */}
            {props.trigger && <DrawerTrigger asChild>{props.trigger}</DrawerTrigger>}
            {!props.trigger && !props.isOpen && (
                <DrawerTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-black/40 backdrop-blur border-none text-white">
                        <Settings2 className="w-5 h-5" />
                    </Button>
                </DrawerTrigger>
            )}

            <DrawerContent className="h-auto max-h-[82dvh] flex flex-col bg-background/80 backdrop-blur-xl border-t border-border/20 rounded-t-3xl">
                <DrawerHeader className="relative border-b border-border/10 pb-4">
                    <DrawerTitle className="text-center text-lg font-bold tracking-tight">Studio Tools</DrawerTitle>
                    <DrawerClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </DrawerClose>
                </DrawerHeader>

                <div className="flex-1 overflow-hidden flex flex-col p-4 w-full">
                    <Tabs
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="w-full flex-1 flex flex-col min-h-0"
                    >
                        {/* Tab Navigation */}
                        <TabsList className="w-full grid grid-cols-3 h-12 bg-muted/30 rounded-full mb-4 p-1 shrink-0">
                            <TabsTrigger value="designs" className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                                Designs
                            </TabsTrigger>
                            <TabsTrigger value="captions" className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                                Text & Captions
                            </TabsTrigger>
                            <TabsTrigger value="camera" className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Contents */}
                        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'none' }}>
                            <TabsContent value="designs" className="outline-none m-0 h-full data-[state=inactive]:hidden">
                                <CanvasDesignsPanel
                                    onCanvasPresetSelect={props.onCanvasPresetSelect}
                                    onSaveCanvasPreset={props.onSaveCanvasPreset}
                                    customCanvasPresets={props.customCanvasPresets}
                                    onDeleteCanvasPreset={props.onDeleteCanvasPreset}
                                    publicPresets={props.publicPresets}
                                    isLoadingPublic={props.isLoadingPublic}
                                    onShareCanvasPreset={props.onShareCanvasPreset}
                                    onUnshareCanvasPreset={props.onUnshareCanvasPreset}
                                    isHorizontal={true}
                                />
                            </TabsContent>

                            <TabsContent value="captions" className="outline-none m-0 h-full data-[state=inactive]:hidden">
                                <TextPresetsPanel
                                    style={props.style}
                                    onStyleChange={props.onStyleChange}
                                    dynamicStyle={props.dynamicStyle}
                                    onDynamicStyleChange={props.onDynamicStyleChange}
                                    isHorizontal={true}
                                />
                            </TabsContent>

                            <TabsContent value="camera" className="outline-none m-0 h-full data-[state=inactive]:hidden">
                                <SettingsPanel />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
