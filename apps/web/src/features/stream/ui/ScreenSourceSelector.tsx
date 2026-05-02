import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gaki/ui/tabs";
import { ScrollArea } from "@gaki/ui/scroll-area";
import { Monitor, AppWindow, X } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

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
            const interval = setInterval(loadSources, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, activeTab]);

    const loadSources = async () => {
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

    // Don't render anything when closed
    if (!isOpen) return null;

    // Bypass Radix Dialog entirely — use a plain portal to document.body
    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 99999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Backdrop overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(4px)",
                }}
                onClick={() => onOpenChange(false)}
            />

            {/* Dialog content */}
            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    width: "90%",
                    maxWidth: "56rem",
                    maxHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                    overflow: "hidden",
                }}
                className="bg-background/95 backdrop-blur-xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <Monitor className="w-5 h-5 text-primary" />
                        Share Content
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 pt-4 flex gap-2">
                        <button
                            onClick={() => setActiveTab("screen")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === "screen"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white/5 hover:bg-white/10"
                            )}
                        >
                            <Monitor className="w-4 h-4" /> Screens
                        </button>
                        <button
                            onClick={() => setActiveTab("window")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                activeTab === "window"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-white/5 hover:bg-white/10"
                            )}
                        >
                            <AppWindow className="w-4 h-4" /> Windows
                        </button>
                    </div>

                    {/* Source grid */}
                    <div className="flex-1 overflow-auto p-4">
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
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
