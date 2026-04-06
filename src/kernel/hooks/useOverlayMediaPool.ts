import { useEffect, useRef, useState } from "react";
import { FileOverlayState } from "@/types/caption";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OverlayMediaItem {
  id: string;
  type: "image" | "video";
  source: HTMLImageElement | HTMLVideoElement;
  blobUrl: string;
  /** Position & size as percentages (0-100) of the 1920×1080 canvas */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface OverlayMediaPool {
  items: OverlayMediaItem[];
  isReady: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ASSET_URL_PREFIX = "http://localhost:3000/stream?path=";

function extractLocalPath(url: string): string | null {
  if (!url.startsWith(ASSET_URL_PREFIX)) return null;
  return decodeURIComponent(url.replace(ASSET_URL_PREFIX, ""));
}

function getMimeType(filePath: string, fileType: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  if (fileType === "video" || ["webm", "mp4", "mov", "mkv"].includes(ext)) {
    if (ext === "mp4") return "video/mp4";
    if (ext === "mov") return "video/quicktime";
    if (ext === "mkv") return "video/x-matroska";
    return "video/webm";
  }
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  return "application/octet-stream";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Eagerly loads all OBS-imported file overlays for a scene via IPC.
 * Returns an OverlayMediaPool whose `isReady` flips to true only when ALL
 * assets have finished loading.
 *
 * On scene switch, revokes previous blob URLs and clears video elements.
 */
export function useOverlayMediaPool(
  fileOverlays: FileOverlayState[],
  sceneId: string
): OverlayMediaPool {
  const [pool, setPool] = useState<OverlayMediaPool>({
    items: [],
    isReady: false,
  });
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup previous scene's resources
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Only handle OBS-imported overlays (those with localhost asset URLs)
    const overlaysToLoad = fileOverlays.filter(
      (o) => o.fileUrl && o.fileUrl.startsWith(ASSET_URL_PREFIX)
    );

    if (overlaysToLoad.length === 0) {
      setPool({ items: [], isReady: true });
      return;
    }

    const blobUrls: string[] = [];
    const videoElements: HTMLVideoElement[] = [];
    let cancelled = false;

    const loadAll = async () => {
      const items: OverlayMediaItem[] = [];

      for (const overlay of overlaysToLoad) {
        if (cancelled) return;

        const localPath = extractLocalPath(overlay.fileUrl);
        if (!localPath) continue;

        try {
          const buffer = await (window as any).electron.asset.readFile(
            localPath
          );
          if (!buffer || cancelled) continue;

          const mimeType = getMimeType(localPath, overlay.fileType);
          const blob = new Blob([buffer], { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);
          blobUrls.push(blobUrl);

          const isVideo =
            overlay.fileType === "video" || mimeType.startsWith("video/");

          if (isVideo) {
            const video = document.createElement("video");
            video.src = blobUrl;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            // Offscreen but still in DOM so the browser decodes frames
            video.style.position = 'fixed';
            video.style.top = '-9999px';
            video.style.left = '-9999px';
            video.style.width = '1px';
            video.style.height = '1px';
            video.style.opacity = '0';
            video.style.pointerEvents = 'none';
            video.style.zIndex = '-1';
            video.style.visibility = 'hidden';
            document.body.appendChild(video);
            videoElements.push(video);

            // Wait for metadata before reading dimensions
            await new Promise<void>((resolve) => {
              video.addEventListener("loadedmetadata", () => resolve(), {
                once: true,
              });
              video.addEventListener("error", () => resolve(), { once: true });
            });

            // Play gracefully — do not let rejection crash anything
            video.play().catch(() => {});

            const nativeW = video.videoWidth || 1920;
            const nativeH = video.videoHeight || 1080;

            // Recompute size using OBS scale × native dims
            const scale = overlay.layout.obsScale || { x: 1, y: 1 };
            const pixelW = scale.x * nativeW;
            const pixelH = scale.y * nativeH;

            items.push({
              id: overlay.id,
              type: "video",
              source: video,
              blobUrl,
              x: overlay.layout.position.x,
              y: overlay.layout.position.y,
              w: (pixelW / 1920) * 100,
              h: (pixelH / 1080) * 100,
            });
          } else {
            const img = new Image();
            img.src = blobUrl;

            await new Promise<void>((resolve) => {
              img.onload = () => resolve();
              img.onerror = () => resolve();
            });

            const nativeW = img.naturalWidth || 300;
            const nativeH = img.naturalHeight || 300;

            const scale = overlay.layout.obsScale || { x: 1, y: 1 };
            const pixelW = scale.x * nativeW;
            const pixelH = scale.y * nativeH;

            items.push({
              id: overlay.id,
              type: "image",
              source: img,
              blobUrl,
              x: overlay.layout.position.x,
              y: overlay.layout.position.y,
              w: (pixelW / 1920) * 100,
              h: (pixelH / 1080) * 100,
            });
          }
        } catch (err) {
          console.warn(
            `[OverlayMediaPool] Failed to load: ${localPath}`,
            err
          );
        }
      }

      if (!cancelled) {
        console.log(
          `[OverlayMediaPool] Scene ${sceneId} ready — ${items.length} overlays loaded`
        );
        setPool({ items, isReady: true });
      }
    };

    loadAll();

    // Cleanup: revoke blob URLs and destroy video elements
    const cleanup = () => {
      cancelled = true;
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
      videoElements.forEach((v) => {
        v.pause();
        v.src = "";
        v.load(); // forces release of the blob reference
        v.remove();
      });
      setPool({ items: [], isReady: false });
    };

    cleanupRef.current = cleanup;
    return cleanup;
  }, [fileOverlays, sceneId]);

  return pool;
}
