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
  const [activeTab, setActiveTab] = useState("images"); // <-- ADDED
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [imagePage, setImagePage] = useState(1);
  const [gifPage, setGifPage] = useState(1);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [hasMoreGifs, setHasMoreGifs] = useState(true);

  const imageScrollRef = useRef<HTMLDivElement>(null);
  const gifScrollRef = useRef<HTMLDivElement>(null);

  // --- Updated Search Functions ---
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
        toast.error("Failed to search images.");
        if (page === 1) setImageResults([]);
      } finally {
        setIsImagesLoading(false);
      }
    },
    [isImagesLoading]
  ); // Minimal dependencies

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
        toast.error("Failed to search GIFs.");
        if (page === 1) setGifResults([]);
      } finally {
        setIsGifsLoading(false);
      }
    },
    [isGifsLoading]
  ); // Minimal dependencies

  // --- ADDED: useEffect for Initial Data Load ---
  useEffect(() => {
    // Fetch initial content for both tabs on component mount
    // This populates the library before the user searches.
    searchImages("", 1);
    searchGifs("", 1);
    // We only want this to run once, so we pass the stable useCallback functions.
  }, [searchImages, searchGifs]);

  // --- MODIFIED: useEffect for Automatic Debounced Search ---
  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      // --- MODIFICATION: Only search the active tab ---
      if (activeTab === "images") {
        searchImages(searchTerm, 1);
      } else if (activeTab === "gifs") {
        searchGifs(searchTerm, 1);
      }
    }, 500); // Wait 500ms before firing

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [searchTerm, activeTab, searchImages, searchGifs]); // Only depends on searchTerm

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
          searchImages(searchTerm, imagePage + 1);
        } else if (type === "gifs" && !isGifsLoading && hasMoreGifs) {
          console.log("Loading more gifs...");
          searchGifs(searchTerm, gifPage + 1);
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
      searchTerm, // Need current search term
      imagePage, // Need current page
      gifPage, // Need current page
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
        onValueChange={setActiveTab} // <-- ADDED: Track active tab
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
            !hasMoreImages && // Removed searchTerm.trim() check
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
            searchTerm.trim() && // Keep this check for "No images found"
            imageResults?.length === 0 && (
              <div className="w-full text-center p-4 text-muted-foreground">
                No images found.
              </div>
            )}
          {/* MODIFIED: Initial state message */}
          {isImagesLoading &&
            !searchTerm.trim() && // Show loading only if it's the initial load
            imageResults?.length === 0 && (
              <div className="w-full text-center p-4 text-muted-foreground">
                Loading popular images...
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
            !hasMoreGifs && // Removed searchTerm.trim() check
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
          {!isGifsLoading &&
            searchTerm.trim() && // Keep this check for "No GIFs found"
            gifResults?.length === 0 && (
              <div className="w-full text-center p-4 text-muted-foreground">
                No GIFs found.
              </div>
            )}
          {/* MODIFIED: Initial state message */}
          {isGifsLoading &&
            !searchTerm.trim() && // Show loading only if it's the initial load
            gifResults?.length === 0 && (
              <div className="w-full text-center p-4 text-muted-foreground">
                Loading trending GIFs...
              </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
