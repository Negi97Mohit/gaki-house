// src/features/canvas/workers/canvas.worker.ts
import { GLRenderer, RenderOptions } from "@/kernel/engine/GLRenderer";

let renderer: GLRenderer | null = null;

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "init":
      // Initialize renderer with the transferred OffscreenCanvas
      if (payload.canvas) {
        try {
          renderer = new GLRenderer(payload.canvas);
          console.log("Worker: GLRenderer initialized");
        } catch (err) {
          console.error("Worker: Failed to init GLRenderer", err);
        }
      }
      break;

    case "resize":
      if (renderer) {
        // OffscreenCanvas automatically resizes when the main thread canvas resizes,
        // but we trigger the GL viewport update here.
        renderer.resize();
      }
      break;

    case "render":
      if (renderer && payload.bitmap) {
        try {
          const { bitmap, options } = payload;

          // Render the frame using the options passed from main thread
          renderer.render(bitmap, options);

          // Important: Close the bitmap to release memory immediately
          // (ImageBitmaps are transferable but consume memory until closed)
          bitmap.close();
        } catch (err) {
          console.error("Worker: Render error", err);
        }
      }
      break;

    case "destroy":
      if (renderer) {
        renderer.destroy();
        renderer = null;
      }
      break;
  }
};
