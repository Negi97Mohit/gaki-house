// src/components/FloatingAssetSearch.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search } from "lucide-react";
import { AssetLibrary, AssetResult } from "./AssetLibrary";

interface FloatingAssetSearchProps {
  onAssetSelect: (asset: AssetResult) => void;
}

export const FloatingAssetSearch: React.FC<FloatingAssetSearchProps> = ({
  onAssetSelect,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md hover:bg-muted hover:text-primary transition-colors"
          title="Search Assets"
        >
          <Search className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 h-[400px] p-0"
        style={{ zIndex: "var(--z-asset-popover)" }}
        align="end"
      >
        <AssetLibrary onAssetSelect={onAssetSelect} />
      </PopoverContent>
    </Popover>
  );
};
