import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@caption-cam/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@caption-cam/ui/tabs";
import { ScrollArea } from "@caption-cam/ui/scroll-area";
import { Monitor, AppWindow, X } from "lucide-react";
import { cn } from "@caption-cam/core/lib/utils";

interface Source {
    id: string;
    name: string;
    thumbnail: string;
    appIcon?: string;
}

interface ScreenSourceSelectorProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (sourceId: string) => void;
}

declare global {
    interface Window {
        electron: any;
    }
}

export const ScreenSourceSelector: React.FC<ScreenSourceSelectorProps> = ({
    isOpen,
    onOpenChange,
    onSelect,
}) => {
    const [sources, setSources] = useState<Source[]>([]);
    const [activeTab, setActiveTab] = useState<"screen" | "window">("screen");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSources();
            // Poll for updates every 3 seconds while open
            const interval = setInterval(loadSources, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, activeTab]);

    const loadSources = async () => {
        // Prevent double loading if we wanted, but simple polling is fine for now
        // setLoading(true); // Don't show loading on refresh to avoid flicker
        try {
            const allSources = await window.electron.getDesktopSources({
                types: ["window", "screen"],
                thumbnailSize: { width: 300, height: 200 },
            });
            setSources(allSources as any);
        } catch (err) {
            console.error("Failed to get sources:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSources = sources.filter((s) =>
        activeTab === "screen" ? s.id.startsWith("screen") : s.id.startsWith("window")
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-white/10">
                <DialogHeader className="p-4 border-b border-white/10">
                    <DialogTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-primary" />
                        Share Content
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <div className="px-4 pt-4">
                        <TabsList className="w-full justify-start h-10 bg-white/5 p-1 rounded-lg">
                            <TabsTrigger value="screen" className="flex-1 gap-2">
                                <Monitor className="w-4 h-4" /> Screens
                            </TabsTrigger>
                            <TabsTrigger value="window" className="flex-1 gap-2">
                                <AppWindow className="w-4 h-4" /> Windows
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                            {filteredSources.map((source) => (
                                <button
                                    key={source.id}
                                    onClick={() => onSelect(source.id)}
                                    className={cn(
                                        "group relative flex flex-col items-start gap-2 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-primary/50 hover:scale-[1.02] transition-all duration-200 text-left"
                                    )}
                                >
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/50 shadow-inner">
                                        <img
                                            src={source.thumbnail}
                                            alt={source.name}
                                            className="w-full h-full object-contain"
                                        />
                                        {source.appIcon && (
                                            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-md bg-black/50 backdrop-blur p-0.5 shadow-sm">
                                                <img
                                                    src={source.appIcon}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <span className="text-sm font-medium leading-tight line-clamp-2 w-full text-foreground/90 group-hover:text-primary transition-colors">
                                            {source.name}
                                        </span>
                                    </div>
                                    {/* Select Overlay */}
                                    <div className="absolute inset-0 rounded-xl ring-2 ring-primary/0 group-hover:ring-primary/50 transition-all pointer-events-none" />
                                </button>
                            ))}

                            {filteredSources.length === 0 && (
                                <div className="col-span-full py-10 flex flex-col items-center justify-center text-muted-foreground">
                                    <Monitor className="w-10 h-10 mb-2 opacity-20" />
                                    <p>No sources found</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
