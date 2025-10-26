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
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 shadow-lg backdrop-blur-sm border-2 hover:scale-105 transition-transform duration-200"
          title="Search Assets"
        >
          <Search className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 h-[400px] p-0 z-[2020]" align="end">
        <AssetLibrary onAssetSelect={onAssetSelect} />
      </PopoverContent>
    </Popover>
  );
};
