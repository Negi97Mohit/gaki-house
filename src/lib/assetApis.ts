// src/lib/assetApis.ts
import { AssetResult } from "@/components/AssetLibrary";
import { toast } from "sonner";

const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const PIXABAY_KEY = import.meta.env.VITE_PIXABAY_API_KEY;
const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY;

const PER_PAGE = 15; // Number of results per page for all APIs

interface ApiSearchResult {
  assets: AssetResult[];
  hasMore: boolean;
}

// --- Pexels API ---
async function searchPexels(
  query: string,
  page: number
): Promise<ApiSearchResult> {
  if (!PEXELS_KEY) return { assets: [], hasMore: false };
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=${PER_PAGE}&page=${page}`,
      {
        headers: { Authorization: PEXELS_KEY },
      }
    );
    if (!response.ok)
      throw new Error(`Pexels API error: ${response.statusText}`);
    const data = await response.json();

    const assets = data.photos.map(
      (photo: any): AssetResult => ({
        id: `pex-${photo.id}`,
        previewUrl: photo.src.medium, // Use medium for grid
        downloadUrl: photo.src.large2x,
        alt: photo.alt,
        fileName: `${photo.id}-${photo.photographer}.jpeg`,
        type: "image/jpeg",
      })
    );

    // Pexels indicates 'hasMore' if the number of photos returned equals per_page
    // and there's a 'next_page' link.
    const hasMore = assets.length === PER_PAGE && !!data.next_page;
    return { assets, hasMore };
  } catch (error) {
    console.error("Pexels Search Failed:", error);
    toast.error("Pexels search failed.");
    return { assets: [], hasMore: false };
  }
}

// --- Pixabay API ---
async function searchPixabay(
  query: string,
  page: number
): Promise<ApiSearchResult> {
  if (!PIXABAY_KEY) return { assets: [], hasMore: false };
  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${query}&per_page=${PER_PAGE}&page=${page}&image_type=photo`
    );
    if (!response.ok)
      throw new Error(`Pixabay API error: ${response.statusText}`);
    const data = await response.json();

    const assets = data.hits.map(
      (hit: any): AssetResult => ({
        id: `pix-${hit.id}`,
        previewUrl: hit.webformatURL, // Use webformatURL for grid
        downloadUrl: hit.largeImageURL,
        alt: hit.tags,
        fileName: `${hit.id}-pixabay.jpeg`,
        type: "image/jpeg",
      })
    );

    // Pixabay 'hasMore' if totalHits > page * per_page
    const hasMore = data.totalHits > page * PER_PAGE;
    return { assets, hasMore };
  } catch (error) {
    console.error("Pixabay Search Failed:", error);
    toast.error("Pixabay search failed.");
    return { assets: [], hasMore: false };
  }
}

// --- GIPHY API ---
export async function searchGifs(
  query: string,
  page: number
): Promise<ApiSearchResult> {
  if (!GIPHY_KEY) return { assets: [], hasMore: false };
  try {
    // GIPHY uses offset instead of page number
    const offset = (page - 1) * PER_PAGE;
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${query}&limit=${PER_PAGE}&offset=${offset}&rating=g`
    );
    if (!response.ok)
      throw new Error(`GIPHY API error: ${response.statusText}`);
    const data = await response.json();

    const assets = data.data.map(
      (gif: any): AssetResult => ({
        id: `gph-${gif.id}`,
        previewUrl: gif.images.fixed_width.url, // Use fixed_width for grid
        downloadUrl: gif.images.original.url,
        alt: gif.title,
        fileName: `${gif.id}.gif`,
        type: "image/gif",
      })
    );

    // GIPHY 'hasMore' based on pagination info
    const hasMore =
      data.pagination.total_count >
      data.pagination.offset + data.pagination.count;
    return { assets, hasMore };
  } catch (error) {
    console.error("GIPHY Search Failed:", error);
    toast.error("GIPHY search failed.");
    return { assets: [], hasMore: false };
  }
}

// --- Combined Image Search ---
export async function searchImages(
  query: string,
  page: number
): Promise<ApiSearchResult> {
  // Fetch both concurrently
  const [pexelsResult, pixabayResult] = await Promise.allSettled([
    searchPexels(query, page),
    searchPixabay(query, page),
  ]);

  const pexelsAssets =
    pexelsResult.status === "fulfilled" ? pexelsResult.value.assets : [];
  const pexelsHasMore =
    pexelsResult.status === "fulfilled" ? pexelsResult.value.hasMore : false;

  const pixabayAssets =
    pixabayResult.status === "fulfilled" ? pixabayResult.value.assets : [];
  const pixabayHasMore =
    pixabayResult.status === "fulfilled" ? pixabayResult.value.hasMore : false;

  // Interleave the results (simple approach, take half from each)
  const combinedAssets = [];
  const pexelsToAdd = pexelsAssets.slice(0, Math.ceil(PER_PAGE / 2));
  const pixabayToAdd = pixabayAssets.slice(0, Math.floor(PER_PAGE / 2));

  // Alternate adding
  for (let i = 0; i < Math.max(pexelsToAdd.length, pixabayToAdd.length); i++) {
    if (pexelsToAdd[i]) combinedAssets.push(pexelsToAdd[i]);
    if (pixabayToAdd[i]) combinedAssets.push(pixabayToAdd[i]);
  }

  // Consider 'hasMore' true if *either* source has more
  const hasMore = pexelsHasMore || pixabayHasMore;

  return { assets: combinedAssets, hasMore };
}
