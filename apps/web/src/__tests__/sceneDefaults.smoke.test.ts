/**
 * Smoke test for createDefaultScene.
 * Verifies that a fresh scene has the expected shape required by scene.store.ts
 * and CanvasView. No DOM / browser APIs needed.
 */
import { describe, it, expect } from "vitest";

// uuid is a runtime dependency; use a simple mock so tests don't depend on
// crypto.randomUUID being available in the node environment.
import { vi } from "vitest";
vi.mock("uuid", () => ({ v4: () => "test-uuid-1234" }));

import { createDefaultScene } from "../pages/Index/hooks/scene-manager/sceneDefaults";

describe("createDefaultScene", () => {
  it("returns an object with a string id and name", () => {
    const scene = createDefaultScene("Main Scene");
    expect(typeof scene.id).toBe("string");
    expect(scene.name).toBe("Main Scene");
  });

  it("initialises overlay arrays as empty", () => {
    const scene = createDefaultScene("Test");
    expect(scene.textOverlays).toEqual([]);
    expect(scene.browserOverlays).toEqual([]);
    expect(scene.fileOverlays).toEqual([]);
    expect(scene.activeOverlays).toEqual([]);
  });

  it("sets sensible audio/video defaults", () => {
    const scene = createDefaultScene("Test");
    expect(scene.isAudioOn).toBe(false);
    expect(scene.isVideoOn).toBe(false);
    expect(scene.captionsEnabled).toBe(true);
  });

  it("sets sensible layout defaults", () => {
    const scene = createDefaultScene("Test");
    expect(scene.layoutMode).toBe("solo");
    expect(scene.cameraShape).toBe("rectangle");
    expect(scene.splitRatio).toBe(0.5);
  });

  it("includes a captionStyle with required fields", () => {
    const scene = createDefaultScene("Test");
    expect(scene.captionStyle).toMatchObject({
      fontFamily: expect.any(String),
      fontSize: expect.any(Number),
      color: expect.any(String),
    });
  });
});
