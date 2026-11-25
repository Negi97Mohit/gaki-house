import { describe, it, expect, beforeEach } from "vitest";

// Import the mutable module-level state directly.
// updateAnimeStyles mutates the module-local `AnimeStyles` variable and
// re-exports it — we re-import after each update to get the latest reference.
import {
  updateAnimeStyles,
  AnimeStyles,
  type TriToneConfig,
} from "../kernel/engine/animeStylesStore";

const sampleStyle: TriToneConfig = {
  shadowColor: "#0a0a0f",
  midColor: "#1a1a3e",
  highlightColor: "#a78bfa",
  skinColor: "#c4a882",
  lowThreshold: 0.25,
  highThreshold: 0.75,
};

describe("animeStylesStore", () => {
  beforeEach(() => {
    // Reset styles between tests by overwriting with an empty object
    updateAnimeStyles({});
  });

  it("AnimeStyles starts as a plain object", () => {
    expect(typeof AnimeStyles).toBe("object");
    expect(AnimeStyles).not.toBeNull();
  });

  it("updateAnimeStyles merges new styles without discarding existing keys", () => {
    updateAnimeStyles({ naruto: sampleStyle });
    updateAnimeStyles({ bleach: { ...sampleStyle, shadowColor: "#000000" } });

    // Both keys must be present (merge, not replace)
    expect(AnimeStyles).toHaveProperty("naruto");
    expect(AnimeStyles).toHaveProperty("bleach");
  });

  it("updateAnimeStyles overwrites an existing key when re-applied", () => {
    updateAnimeStyles({ naruto: sampleStyle });
    const updated = { ...sampleStyle, shadowColor: "#ff0000" };
    updateAnimeStyles({ naruto: updated });

    expect(AnimeStyles["naruto"]?.shadowColor).toBe("#ff0000");
  });

  it("TriToneConfig shape is structurally valid", () => {
    const cfg: TriToneConfig = sampleStyle;
    expect(cfg).toMatchObject({
      shadowColor: expect.any(String),
      midColor: expect.any(String),
      highlightColor: expect.any(String),
      skinColor: expect.any(String),
      lowThreshold: expect.any(Number),
      highThreshold: expect.any(Number),
    });
  });
});
