import React, { useEffect, useState } from "react";
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

import { CanvasPreset } from "@/types/canvasPreset";
import { CaptionStyle } from "@/types/caption";

export interface MobileStudioToolsDrawerProps {
    onCanvasPresetSelect?: (preset: CanvasPreset) => void;
    customCanvasPresets?: CanvasPreset[];
    onSaveCanvasPreset?: (name: string, layout?: any) => void;
    onDeleteCanvasPreset?: (id: string) => void;
    publicPresets?: CanvasPreset[];
    isLoadingPublic?: boolean;
    onShareCanvasPreset?: (preset: CanvasPreset | string, authorName?: string) => void;
    onUnshareCanvasPreset?: (preset: CanvasPreset | string) => void;
    style: CaptionStyle;
    onStyleChange: (style: CaptionStyle) => void;
    dynamicStyle: string;
    onDynamicStyleChange: (styleId: string) => void;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    activeTab?: "designs" | "captions" | "camera";
    visibleTabs?: Array<"designs" | "captions" | "camera">;
}

export const MobileStudioToolsDrawer: React.FC<MobileStudioToolsDrawerProps> = (props) => {
    const tabs = props.visibleTabs ?? ["designs", "captions"];
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);

    useEffect(() => {
        if (props.activeTab && tabs.includes(props.activeTab)) {
            setActiveTab(props.activeTab);
        }
    }, [props.activeTab, tabs]);

    return (
        <Drawer open={props.isOpen} onOpenChange={props.onOpenChange}>
            {props.trigger && <DrawerTrigger asChild>{props.trigger}</DrawerTrigger>}
            {!props.trigger && !props.isOpen && (
                <DrawerTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-black/40 backdrop-blur border-none text-white">
                        <Settings2 className="w-5 h-5" />
                    </Button>
                </DrawerTrigger>
            )}

            <DrawerContent className="h-auto max-h-[50vh] flex flex-col bg-background/80 backdrop-blur-xl border-t border-border/20 rounded-t-3xl">
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
                        onValueChange={(v) => setActiveTab(v as (typeof tabs)[number])}
                        className="w-full flex-1 flex flex-col min-h-0"
                    >
                        <TabsList className="w-full grid h-12 bg-muted/30 rounded-full mb-4 p-1 shrink-0" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
                            {tabs.includes("designs") && (
                                <TabsTrigger value="designs" className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                                    Designs
                                </TabsTrigger>
                            )}
                            {tabs.includes("captions") && (
                                <TabsTrigger value="captions" className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                                    Text & Captions
                                </TabsTrigger>
                            )}
                            {tabs.includes("camera") && (
                                <TabsTrigger value="camera" className="rounded-full text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                                    Settings
                                </TabsTrigger>
                            )}
                        </TabsList>

                        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'none' }}>
                            {tabs.includes("designs") && (
                                <TabsContent value="designs" className="outline-none m-0 data-[state=inactive]:hidden">
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
                            )}

                            {tabs.includes("captions") && (
                                <TabsContent value="captions" className="outline-none m-0 data-[state=inactive]:hidden">
                                    <TextPresetsPanel
                                        style={props.style}
                                        onStyleChange={props.onStyleChange}
                                        dynamicStyle={props.dynamicStyle}
                                        onDynamicStyleChange={props.onDynamicStyleChange}
                                        isHorizontal={true}
                                    />
                                </TabsContent>
                            )}

                            {tabs.includes("camera") && (
                                <TabsContent value="camera" className="outline-none m-0 data-[state=inactive]:hidden">
                                    <SettingsPanel />
                                </TabsContent>
                            )}
                        </div>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
