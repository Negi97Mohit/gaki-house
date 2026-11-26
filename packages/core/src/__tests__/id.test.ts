import { describe, it, expect } from "vitest";
import { generateId, generateSimpleId } from "../lib/id";

describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(generateId()).toBeTruthy();
    expect(typeof generateId()).toBe("string");
  });

  it("includes the prefix", () => {
    expect(generateId("overlay")).toMatch(/^overlay-/);
  });

  it("produces unique values", () => {
    const ids = Array.from({ length: 100 }, () => generateId());
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });
});

describe("generateSimpleId", () => {
  it("returns a non-empty string", () => {
    expect(generateSimpleId()).toBeTruthy();
    expect(typeof generateSimpleId()).toBe("string");
  });

  it("produces unique values", () => {
    const ids = Array.from({ length: 100 }, () => generateSimpleId());
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });
});
