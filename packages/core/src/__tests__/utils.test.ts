import { describe, it, expect } from "vitest";
import { cn, throttle, debounce } from "../lib/utils";

describe("cn (class merging)", () => {
  it("merges class strings", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2");
  });

  it("resolves conflicting tailwind classes (last wins)", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("filters falsy values", () => {
    expect(cn("px-2", false, undefined, null, "py-2")).toBe("px-2 py-2");
  });

  it("handles conditional object syntax", () => {
    expect(cn({ "font-bold": true, "font-normal": false })).toBe("font-bold");
  });
});

describe("throttle", () => {
  it("calls the function immediately on first invocation", () => {
    let count = 0;
    const throttled = throttle(() => count++, 100);
    throttled();
    expect(count).toBe(1);
  });

  it("suppresses subsequent calls within the limit window", () => {
    let count = 0;
    const throttled = throttle(() => count++, 100);
    throttled();
    throttled();
    throttled();
    expect(count).toBe(1);
  });
});

describe("debounce", () => {
  it("delays the call until after the wait period", async () => {
    let count = 0;
    const debounced = debounce(() => count++, 50);
    debounced();
    debounced();
    debounced();
    // Should NOT have fired yet
    expect(count).toBe(0);
    await new Promise((r) => setTimeout(r, 100));
    expect(count).toBe(1);
  });
});
