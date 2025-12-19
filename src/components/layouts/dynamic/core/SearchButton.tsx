import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { AssetLibrary, AssetResult } from "@/components/AssetLibrary";
import { cn } from "@/lib/utils";

interface SearchButtonProps {
    sectionId: string;
    onAssetSelect: (sectionId: string, asset: AssetResult) => void;
    className?: string;
}

export const SearchButton: React.FC<SearchButtonProps> = ({
    sectionId,
    onAssetSelect,
    className,
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    className={cn("h-8 w-8 bg-background/95 backdrop-blur", className)}
                    title="Search for image"
                >
                    <Search className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 h-[400px] p-0"
                style={{ zIndex: 9999 }}
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <AssetLibrary
                    onAssetSelect={(asset) => onAssetSelect(sectionId, asset)}
                />
            </PopoverContent>
        </Popover>
    );
};
