// src/components/AssetLibrary.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

export const AssetLibrary: React.FC<AssetLibraryProps> = ({
  onAssetSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [imageResults, setImageResults] = useState<AssetResult[]>([]);
  const [gifResults, setGifResults] = useState<AssetResult[]>([]);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [isGifsLoading, setIsGifsLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [imagePage, setImagePage] = useState(1);
  const [gifPage, setGifPage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [hasMoreGifs, setHasMoreGifs] = useState(true);

  const imageScrollRef = useRef<HTMLDivElement>(null);
  const gifScrollRef = useRef<HTMLDivElement>(null);

  // --- Updated Search Functions ---
  const searchImages = useCallback(
    async (loadMore = false) => {
      // Read necessary state directly inside
      if (isImagesLoading || (!loadMore && !searchTerm.trim())) return;
      if (loadMore && !hasMoreImages) return;

      setIsImagesLoading(true);
      const pageToFetch = loadMore ? imagePage + 1 : 1;

      try {
        const result: ApiSearchResult = await apiSearchImages(
          searchTerm,
          pageToFetch
        );
        if (loadMore) {
          setImageResults((prev) => [...prev, ...result.assets]);
        } else {
          setImageResults(result.assets);
        }
        setImagePage(pageToFetch);
        setHasMoreImages(result.hasMore);
      } catch (error) {
        console.error("Failed to search images:", error);
        toast.error("Failed to search images.");
        if (!loadMore) setImageResults([]);
      } finally {
        setIsImagesLoading(false);
      }
    },
    [isImagesLoading, imagePage, hasMoreImages, searchTerm]
  ); // Minimal dependencies

  const searchGifs = useCallback(
    async (loadMore = false) => {
      // Read necessary state directly inside
      if (isGifsLoading || (!loadMore && !searchTerm.trim())) return;
      if (loadMore && !hasMoreGifs) return;

      setIsGifsLoading(true);
      const pageToFetch = loadMore ? gifPage + 1 : 1;

      try {
        const result: ApiSearchResult = await apiSearchGifs(
          searchTerm,
          pageToFetch
        );
        if (loadMore) {
          setGifResults((prev) => [...prev, ...result.assets]);
        } else {
          setGifResults(result.assets);
        }
        setGifPage(pageToFetch);
        setHasMoreGifs(result.hasMore);
      } catch (error) {
        console.error("Failed to search GIFs:", error);
        toast.error("Failed to search GIFs.");
        if (!loadMore) setGifResults([]);
      } finally {
        setIsGifsLoading(false);
      }
    },
    [isGifsLoading, gifPage, hasMoreGifs, searchTerm]
  ); // Minimal dependencies

  // --- useEffect for Automatic Debounced Search (Initial Search) ---
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    if (!searchTerm.trim()) {
      setImageResults([]);
      setGifResults([]);
      setIsImagesLoading(false);
      setIsGifsLoading(false);
      setImagePage(1);
      setGifPage(1);
      setHasMoreImages(true);
      setHasMoreGifs(true);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setImageResults([]);
      setGifResults([]);
      setImagePage(1);
      setGifPage(1);
      setHasMoreImages(true);
      setHasMoreGifs(true);
      // We need to call the functions directly here
      // Use temporary variables from state inside the timeout
      const currentSearchTerm = searchTerm;
      const initialImagePage = 1;
      const initialGifPage = 1;

      (async () => {
        setIsImagesLoading(true);
        try {
          const imgResult = await apiSearchImages(
            currentSearchTerm,
            initialImagePage
          );
          setImageResults(imgResult.assets);
          setHasMoreImages(imgResult.hasMore);
          setImagePage(initialImagePage);
        } catch (e) {
          toast.error("Image search failed");
          setImageResults([]);
        } finally {
          setIsImagesLoading(false);
        }
      })();

      (async () => {
        setIsGifsLoading(true);
        try {
          const gifResult = await apiSearchGifs(
            currentSearchTerm,
            initialGifPage
          );
          setGifResults(gifResult.assets);
          setHasMoreGifs(gifResult.hasMore);
          setGifPage(initialGifPage);
        } catch (e) {
          toast.error("GIF search failed");
          setGifResults([]);
        } finally {
          setIsGifsLoading(false);
        }
      })();
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [searchTerm]); // Only depends on searchTerm

  // --- Scroll Handler ---
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>, type: "images" | "gifs") => {
      const target = event.currentTarget;
      const threshold = 150; // Increased threshold slightly

      const nearBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight <
        threshold;

      if (nearBottom) {
        if (type === "images" && !isImagesLoading && hasMoreImages) {
          console.log("Loading more images...");
          searchImages(true); // Call the memoized search function
        } else if (type === "gifs" && !isGifsLoading && hasMoreGifs) {
          console.log("Loading more gifs...");
          searchGifs(true); // Call the memoized search function
        }
      }
    },
    [
      isImagesLoading,
      hasMoreImages,
      searchImages,
      isGifsLoading,
      hasMoreGifs,
      searchGifs,
    ]
  ); // Include search functions here now

  const handleAssetClick = (asset: AssetResult) => {
    toast.info(`Adding ${asset.alt} to canvas...`);
    onAssetSelect(asset);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* 1. SEARCH INPUT */}
      <div className="relative flex items-center gap-2 p-3 border-b border-border">
        <Input
          placeholder="Search for free assets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-8"
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
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="shrink-0 w-full justify-start rounded-none border-b bg-transparent px-2">
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="gifs">GIFs</TabsTrigger>
        </TabsList>

        {/* Images Tab */}
        <TabsContent
          ref={imageScrollRef}
          onScroll={(e) => handleScroll(e, "images")}
          value="images"
          className="flex-1 overflow-y-auto p-3"
        >
          <div className="grid grid-cols-3 gap-2">
            {(imageResults || []).map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className="aspect-square bg-secondary rounded-md overflow-hidden hover:ring-2 ring-primary ring-offset-background ring-offset-2 transition-all group"
                title={`Add ${asset.alt}`}
              >
                <img
                  src={asset.previewUrl}
                  alt={asset.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </button>
            ))}
          </div>
          {isImagesLoading && imageResults.length > 0 && (
            <div className="w-full text-center p-4">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}
          {!isImagesLoading &&
            searchTerm.trim() &&
            !hasMoreImages &&
            imageResults?.length > 0 && (
              <div className="w-full text-center p-4 text-xs text-muted-foreground">
                End of results.
              </div>
            )}
          {isImagesLoading && imageResults.length === 0 && (
            <div className="w-full text-center p-4 text-muted-foreground">
              Loading Images...
            </div>
          )}
          {!isImagesLoading &&
            searchTerm.trim() &&
            imageResults?.length === 0 && (
              <div className="w-full text-center p-4 text-muted-foreground">
                No images found.
              </div>
            )}
        </TabsContent>

        {/* GIFs Tab */}
        <TabsContent
          ref={gifScrollRef}
          onScroll={(e) => handleScroll(e, "gifs")}
          value="gifs"
          className="flex-1 overflow-y-auto p-3"
        >
          <div className="grid grid-cols-3 gap-2">
            {(gifResults || []).map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleAssetClick(asset)}
                className="aspect-square bg-secondary rounded-md overflow-hidden hover:ring-2 ring-primary ring-offset-background ring-offset-2 transition-all group"
                title={`Add ${asset.alt}`}
              >
                <img
                  src={asset.previewUrl}
                  alt={asset.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </button>
            ))}
          </div>
          {isGifsLoading && gifResults.length > 0 && (
            <div className="w-full text-center p-4">
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}
          {!isGifsLoading &&
            searchTerm.trim() &&
            !hasMoreGifs &&
            gifResults?.length > 0 && (
              <div className="w-full text-center p-4 text-xs text-muted-foreground">
                End of results.
              </div>
            )}
          {isGifsLoading && gifResults.length === 0 && (
            <div className="w-full text-center p-4 text-muted-foreground">
              Loading GIFs...
            </div>
          )}
          {!isGifsLoading && searchTerm.trim() && gifResults?.length === 0 && (
            <div className="w-full text-center p-4 text-muted-foreground">
              No GIFs found.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
