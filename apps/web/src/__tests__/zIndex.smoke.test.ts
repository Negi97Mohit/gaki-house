/**
 * Regression guard: all z-index constants must be unique positive integers.
 * If two layers share a value, stacking conflicts occur in production.
 */
import { describe, it, expect } from "vitest";
import { zIndex } from "../lib/zIndex";

describe("zIndex constants", () => {
  const entries = Object.entries(zIndex) as [string, number][];

  it("all values are positive integers", () => {
    for (const [key, value] of entries) {
      expect(value, `zIndex.${key} should be a positive integer`).toBeGreaterThan(0);
      expect(Number.isInteger(value), `zIndex.${key} should be an integer`).toBe(true);
    }
  });

  it("all values are unique (no two layers share a z-index)", () => {
    const values = entries.map(([, v]) => v);
    const unique = new Set(values);
    // If sizes differ, find the duplicates and report them
    if (unique.size !== values.length) {
      const seen = new Set<number>();
      const dups: string[] = [];
      for (const [key, value] of entries) {
        if (seen.has(value)) dups.push(`${key}=${value}`);
        seen.add(value);
      }
      throw new Error(`Duplicate z-index values found: ${dups.join(", ")}`);
    }
    expect(unique.size).toBe(values.length);
  });
});
