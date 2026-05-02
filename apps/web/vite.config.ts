import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Custom Vite plugin to handle the YouTube live proxy during local development
const youtubeLiveLocalPlugin = () => {
  return {
    name: "youtube-live-local-proxy",
    configureServer(server: any) {
      server.middlewares.use(
        "/api/youtube-live",
        async (req: any, res: any) => {
          try {
            const resolvedPath = path.resolve(
              __dirname,
              "./netlify/functions/youtube-live-proxy.ts",
            );
            const url = new URL(`http://localhost${req.url}`);
            const q = url.searchParams.get("q") || "live";
            const lang = url.searchParams.get("lang") || "en";
            const region = url.searchParams.get("region") || "US";

            const INNERTUBE_SEARCH_URL =
              "https://www.youtube.com/youtubei/v1/search";
            const body = JSON.stringify({
              context: {
                client: {
                  clientName: "WEB",
                  clientVersion: "2.20240101.00.00",
                  hl: lang,
                  gl: region,
                },
              },
              query: q,
              params: "EgJAAQ%3D%3D",
            });

            const response = await fetch(INNERTUBE_SEARCH_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
                Origin: "https://www.youtube.com",
              },
              body,
            });

            const data: any = await response.json();
            const results: any[] = [];
            const contents =
              data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
                ?.sectionListRenderer?.contents || [];
            for (const section of contents) {
              const items = section?.itemSectionRenderer?.contents || [];
              for (const item of items) {
                const r = item?.videoRenderer;
                if (!r) continue;

                const isLive =
                  r.badges?.some(
                    (b: any) =>
                      b?.metadataBadgeRenderer?.style ===
                        "BADGE_STYLE_TYPE_LIVE_NOW" ||
                      b?.metadataBadgeRenderer?.label
                        ?.toLowerCase()
                        ?.includes("live"),
                  ) ||
                  r.thumbnailOverlays?.some(
                    (o: any) =>
                      o?.thumbnailOverlayTimeStatusRenderer?.style === "LIVE",
                  );
                if (!isLive) continue;

                let viewers = 0;
                const viewText =
                  r.viewCountText?.simpleText ||
                  r.viewCountText?.runs?.map((x: any) => x.text).join("") ||
                  "";
                const plainMatch = viewText.replace(/,/g, "").match(/(\d+)/);
                if (plainMatch) viewers = parseInt(plainMatch[1], 10);
                const kMatch = viewText.match(/([\d.]+)\s*K/i);
                if (kMatch) viewers = Math.round(parseFloat(kMatch[1]) * 1000);

                const thumbs = r.thumbnail?.thumbnails || [];
                const thumbnail =
                  thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || "";
                const chThumbs =
                  r.channelThumbnailSupportedRenderers
                    ?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails ||
                  [];
                const channelThumbnail =
                  chThumbs[chThumbs.length - 1]?.url || chThumbs[0]?.url || "";
                const title =
                  r.title?.runs?.map((x: any) => x.text).join("") || "";
                const channelName =
                  r.ownerText?.runs?.[0]?.text ||
                  r.shortBylineText?.runs?.[0]?.text ||
                  "";
                const channelId =
                  r.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint
                    ?.browseId || "";

                if (r.videoId && title) {
                  results.push({
                    videoId: r.videoId,
                    title,
                    channelName,
                    channelId,
                    channelThumbnail,
                    thumbnail,
                    viewers,
                    isLive: true,
                  });
                }
              }
            }
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                streams: results,
                count: results.length,
                query: q,
              }),
            );
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        },
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), youtubeLiveLocalPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@gaki/core": path.resolve(__dirname, "../../packages/core/src"),
      "@gaki/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@gaki/engine": path.resolve(
        __dirname,
        "../../packages/engine/src",
      ),
      "@gaki/handoff-sdk": path.resolve(
        __dirname,
        "../../packages/handoff-sdk/src",
      ),
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@mediapipe")) return "mediapipe";
            if (id.includes("firebase") || id.includes("@supabase"))
              return "backend-core";
            if (id.includes("three") || id.includes("@react-three"))
              return "canvas-engine";
            if (
              id.includes("gsap") ||
              id.includes("framer-motion") ||
              id.includes("animejs")
            )
              return "animation-engine";
            if (id.includes("@radix-ui") || id.includes("lucide"))
              return "ui-components";
            if (id.includes("@excalidraw")) return "excalidraw-core";
            if (
              id.includes("react-router") ||
              id.includes("@tanstack/react-query") ||
              id.includes("zustand")
            )
              return "app-core";
            // By omitting a fallback return, we let Rollup naturally chunk the rest
          }
        },
      },
    },
  },
  server: {
    host: true,
    fs: {
      allow: ["../.."],
    },
    strictPort: true,
    port: 5173,
    proxy: {
      "/api/kick": {
        target: "https://kick.com/api/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kick/, ""),
      },
      "/api/dlive": {
        target: "https://graphigo.prd.dlive.tv",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dlive/, ""),
      },
    },
  },
});
