// src/components/FloatingAssetSearch.tsx
import React, { Suspense } from "react";
import { Button } from "@caption-cam/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@caption-cam/ui/popover";
import { Search, Loader2 } from "lucide-react";
import { AssetResult } from "./AssetLibrary";

const AssetLibrary = React.lazy(() => import("./AssetLibrary").then(module => ({ default: module.AssetLibrary })));

interface FloatingAssetSearchProps {
  onAssetSelect: (asset: AssetResult) => void;
  renderTrigger?: (onClick: () => void) => React.ReactNode;
}

export const FloatingAssetSearch: React.FC<FloatingAssetSearchProps> = ({
  onAssetSelect,
  renderTrigger,
}) => {
  const [open, setOpen] = React.useState(false);

  const defaultTrigger = (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full h-10 w-10 shadow-lg backdrop-blur-sm border-2 hover:scale-105 transition-transform duration-200"
      title="Search Assets"
    >
      <Search className="h-5 w-5" />
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {renderTrigger ? renderTrigger(() => setOpen(true)) : defaultTrigger}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 h-[400px] p-0"
        style={{ zIndex: "var(--z-asset-popover)" }}
        align="end"
      >
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
          <AssetLibrary onAssetSelect={onAssetSelect} />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
};
