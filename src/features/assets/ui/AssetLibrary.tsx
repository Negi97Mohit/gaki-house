import React, { useState, useEffect, useRef, useCallback } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { PopoverClose } from "@radix-ui/react-popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Search, Loader2, X } from "lucide-react";
import { notify } from "@/shared/lib/notify";
import {
  searchImages as apiSearchImages,
  searchGifs as apiSearchGifs,
  ApiSearchResult,
} from "@/lib/assetApis";

export interface AssetResult {
  id: string;
  previewUrl: string;
  downloadUrl: string;
  alt: string;
  fileName: string;
  type: "image/jpeg" | "image/png" | "image/gif";
}

interface AssetLibraryProps {
  onAssetSelect: (asset: AssetResult) => void;
}

const AssetGrid = ({
  assets,
  loadMore,
  hasMore,
  isLoading,
  onSelect,
  loadingLabel
}: {
  assets: AssetResult[];
  loadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onSelect: (asset: AssetResult) => void;
  loadingLabel: string;
}) => {
  return (
    <VirtuosoGrid
      style={{ height: "100%", width: "100%" }}
      totalCount={assets.length}
      endReached={loadMore}
      overscan={200}
      components={{
        List: React.forwardRef(({ style, children, ...props }, ref) => (
          <div
            ref={ref}
            {...props}
            style={style}
            className="grid grid-cols-3 gap-2 p-3"
          >
            {children}
          </div>
        )),
        Footer: () => (
          (isLoading || (assets.length === 0)) ? (
            <div className="w-full text-center p-4 col-span-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
              ) : (
                <div className="text-muted-foreground">{loadingLabel}</div>
              )}
            </div>
          ) : null
        )
      }}
      itemContent={(index) => {
        const asset = assets[index];
        return (
          <button
            onClick={() => onSelect(asset)}
            className="aspect-square bg-secondary rounded-md overflow-hidden hover:ring-2 ring-primary ring-offset-background ring-offset-2 transition-all group w-full h-full relative"
            title={`Add ${asset.alt}`}
          >
            <img
              src={asset.previewUrl}
              alt={asset.alt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              loading="lazy"
            />
          </button>
        );
      }}
    />
  );
};

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onAssetSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [imageResults, setImageResults] = useState<AssetResult[]>([]);
  const [gifResults, setGifResults] = useState<AssetResult[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isGifsLoading, setIsGifsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initialLoadDone = useRef(false);
  const [imagePage, setImagePage] = useState(1);
  const [gifPage, setGifPage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [hasMoreGifs, setHasMoreGifs] = useState(true);

  // --- Search Functions ---
  const searchImages = useCallback(
    async (term: string, page: number) => {
      if (isImagesLoading) return;
      setIsImagesLoading(true);

      try {
        const result: ApiSearchResult = await apiSearchImages(term, page);
        if (page > 1) {
          setImageResults((prev) => [...prev, ...result.assets]);
        } else {
          setImageResults(result.assets);
        }
        setImagePage(page);
        setHasMoreImages(result.hasMore);
      } catch (error) {
        console.error("Failed to search images:", error);
        notify.error("Failed to search images.");
        if (page === 1) setImageResults([]);
      } finally {
        setIsImagesLoading(false);
      }
    },
    [isImagesLoading]
  );

  const searchGifs = useCallback(
    async (term: string, page: number) => {
      if (isGifsLoading) return;
      setIsGifsLoading(true);

      try {
        const result: ApiSearchResult = await apiSearchGifs(term, page);
        if (page > 1) {
          setGifResults((prev) => [...prev, ...result.assets]);
        } else {
          setGifResults(result.assets);
        }
        setGifPage(page);
        setHasMoreGifs(result.hasMore);
      } catch (error) {
        console.error("Failed to search GIFs:", error);
        notify.error("Failed to search GIFs.");
        if (page === 1) setGifResults([]);
      } finally {
        setIsGifsLoading(false);
      }
    },
    [isGifsLoading]
  );

  // --- useEffect for Initial Data Load ---
  useEffect(() => {
    if (!initialLoadDone.current) {
      searchImages("", 1);
      searchGifs("", 1);
      initialLoadDone.current = true;
    }
  }, [searchImages, searchGifs]);

  // --- useEffect for Debounced Search ---
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        if (activeTab === "images") {
          searchImages(searchTerm, 1);
        } else if (activeTab === "gifs") {
          searchGifs(searchTerm, 1);
        }
      } else {
        searchImages("", 1);
        searchGifs("", 1);
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [searchTerm, activeTab, searchImages, searchGifs]);



  const handleAssetClick = (asset: AssetResult) => {
    notify.info(`Adding ${asset.alt} to canvas...`);
    onAssetSelect(asset);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* 1. SEARCH INPUT */}
      <div className="relative flex items-center gap-2 p-3 border-b border-border">
        <PopoverClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </PopoverClose>
        <Input
          placeholder="Search for free assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-8 h-9"
        />
        {(isImagesLoading || isGifsLoading) && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* 2. TABS & CONTENT */}
      <Tabs
        defaultValue="images"
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="shrink-0 w-full justify-start rounded-none border-b bg-transparent px-2">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="gifs">GIFs</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="flex-1 overflow-hidden h-full">
          <AssetGrid
            assets={imageResults}
            loadMore={() => hasMoreImages && !isImagesLoading && searchImages(searchTerm, imagePage + 1)}
            hasMore={hasMoreImages}
            isLoading={isImagesLoading}
            onSelect={handleAssetClick}
            loadingLabel={searchTerm ? "No images found." : "Loading popular images..."}
          />
        </TabsContent>

        <TabsContent value="gifs" className="flex-1 overflow-hidden h-full">
          <AssetGrid
            assets={gifResults}
            loadMore={() => hasMoreGifs && !isGifsLoading && searchGifs(searchTerm, gifPage + 1)}
            hasMore={hasMoreGifs}
            isLoading={isGifsLoading}
            onSelect={handleAssetClick}
            loadingLabel={searchTerm ? "No GIFs found." : "Loading trending GIFs..."}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
