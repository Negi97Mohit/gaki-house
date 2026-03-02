import React, { useState } from "react";
import * as RadixTabs from "@radix-ui/react-tabs";
import { Drawer } from "vaul";
import { Paintbrush, Type, Settings } from "lucide-react";
import { CanvasDesignsPanel } from "@/features/studio/ui/panels/CanvasDesignsPanel";
import { TextPresetsPanel } from "@/features/studio/ui/panels/TextPresetsPanel";
import { cn } from "@/shared/lib/utils";

interface MobileStudioToolsDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    layoutManager?: any;
}

export const MobileStudioToolsDrawer: React.FC<MobileStudioToolsDrawerProps> = ({
    isOpen,
    onOpenChange,
    layoutManager,
}) => {
    const [tab, setTab] = useState("designs");

    return (
        <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[100]" />
                <Drawer.Content
                    className="fixed bottom-0 left-0 right-0 z-[101] bg-background rounded-t-[20px] outline-none mobile-sheet max-h-[80vh] flex flex-col"
                    aria-label="Studio Tools"
                >
                    {/* Handle */}
                    <div className="mobile-sheet-handle" aria-hidden="true" />
                    <Drawer.Title className="sr-only">Studio Tools</Drawer.Title>

                    {/* Tab navigation */}
                    <RadixTabs.Root value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden min-h-0">
                        <RadixTabs.List
                            className="flex items-center gap-1 px-4 py-2 border-b border-border/10 shrink-0"
                            aria-label="Tool categories"
                        >
                            {([
                                { id: "designs", icon: Paintbrush, label: "Designs" },
                                { id: "captions", icon: Type, label: "Captions" },
                                { id: "settings", icon: Settings, label: "Settings" },
                            ]).map((t) => (
                                <RadixTabs.Trigger
                                    key={t.id}
                                    value={t.id}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-semibold transition-all active:scale-95 min-h-[40px]",
                                        tab === t.id
                                            ? "bg-foreground text-background"
                                            : "text-muted-foreground hover:bg-muted/40"
                                    )}
                                >
                                    <t.icon className="w-4 h-4" aria-hidden="true" />
                                    {t.label}
                                </RadixTabs.Trigger>
                            ))}
                        </RadixTabs.List>

                        <div className="flex-1 overflow-y-auto p-4 min-h-0">
                            <RadixTabs.Content value="designs" className="h-full">
                                {layoutManager && (
                                    <CanvasDesignsPanel
                                        onCanvasPresetSelect={layoutManager.handleCanvasPresetSelect}
                                        onSaveCanvasPreset={layoutManager.handleSaveCanvasPreset}
                                        onDeleteCanvasPreset={layoutManager.handleDeleteCanvasPreset}
                                        customCanvasPresets={layoutManager.customPresets || []}
                                        publicPresets={layoutManager.publicPresets || []}
                                        isLoadingPublic={layoutManager.isLoadingPublic || false}
                                        onShareCanvasPreset={layoutManager.shareCanvasPreset}
                                        onUnshareCanvasPreset={layoutManager.unshareCanvasPreset}
                                    />
                                )}
                            </RadixTabs.Content>
                            <RadixTabs.Content value="captions" className="h-full">
                                <TextPresetsPanel />
                            </RadixTabs.Content>
                            <RadixTabs.Content value="settings" className="h-full">
                                <p className="text-muted-foreground text-sm">Stream settings coming soon.</p>
                            </RadixTabs.Content>
                        </div>
                    </RadixTabs.Root>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
