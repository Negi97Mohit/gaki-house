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
          size="sm"
          className="h-9 px-3 hover:bg-muted transition-colors"
          title="Search Assets"
        >
          <Search className="h-4 w-4 mr-2" />
          Assets
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 h-[400px] p-0"
        style={{ zIndex: "var(--z-asset-popover)" }}
        align="center"
      >
        <AssetLibrary onAssetSelect={onAssetSelect} />
      </PopoverContent>
    </Popover>
  );
};
