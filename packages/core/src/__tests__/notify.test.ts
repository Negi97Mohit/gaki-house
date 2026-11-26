/**
 * Smoke test for notify helpers.
 *
 * notify.* delegates to sonner's toast() which requires a DOM Toaster to be
 * mounted before it renders anything. Here we only assert the module loads and
 * the functions are callable without throwing — the actual toast rendering is
 * an integration concern tested in the browser.
 */
import { describe, it, expect, vi } from "vitest";

// Mock sonner so the functions don't blow up in a node environment
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }),
}));

import { notify } from "../lib/notify";

describe("notify helpers (smoke)", () => {
  it("notify.success does not throw", () => {
    expect(() => notify.success("Test success")).not.toThrow();
  });

  it("notify.success accepts an optional description", () => {
    expect(() => notify.success("Test", "Details here")).not.toThrow();
  });

  it("notify.error does not throw with a string description", () => {
    expect(() => notify.error("Test error", "Some detail")).not.toThrow();
  });

  it("notify.error does not throw with an Error object", () => {
    expect(() => notify.error("Test error", new Error("boom"))).not.toThrow();
  });

  it("notify.info does not throw", () => {
    expect(() => notify.info("Test info")).not.toThrow();
  });

  it("notify.warning does not throw", () => {
    expect(() => notify.warning("Test warning")).not.toThrow();
  });
});
