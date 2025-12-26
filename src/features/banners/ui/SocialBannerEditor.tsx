// src/components/SocialBannerEditor.tsx
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { User, Save } from "lucide-react";
import {
    SocialBannerData,
    DEFAULT_BANNER_DATA,
} from "@/types/socialBanner";
import { SocialProfileForm } from "@/features/banners/ui/social-banner/SocialProfileForm";
import { SocialLinkList } from "@/features/banners/ui/social-banner/SocialLinkList";

const LOCAL_STORAGE_KEY = "social-banner-user-data";

interface SocialBannerEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SocialBannerData) => void;
    initialData?: SocialBannerData;
}

export const SocialBannerEditor: React.FC<SocialBannerEditorProps> = ({
    isOpen,
    onClose,
    onSave,
    initialData,
}) => {
    const [data, setData] = useState<SocialBannerData>(
        initialData || DEFAULT_BANNER_DATA
    );

    // Load from localStorage on mount
    useEffect(() => {
        if (!initialData) {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                try {
                    setData(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse saved banner data:", e);
                }
            }
        }
    }, [initialData]);

    const handleSave = () => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        onSave(data);
        onClose();
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSave();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-border/50"
                style={{ zIndex: 9999 }}
            >
                <form onSubmit={handleFormSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <User className="w-5 h-5 text-primary" />
                            Edit Your Info
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
                        <div className="space-y-6 py-4">
                            <SocialProfileForm
                                name={data.name}
                                tagline={data.tagline}
                                avatarUrl={data.avatarUrl}
                                onChange={(field, value) => setData(prev => ({ ...prev, [field]: value }))}
                            />

                            <SocialLinkList
                                links={data.links}
                                onChange={(newLinks) => setData(prev => ({ ...prev, links: newLinks }))}
                            />
                        </div>
                    </ScrollArea>

                    <DialogFooter className="gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="gap-2">
                            <Save className="w-4 h-4" />
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
