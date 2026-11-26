/**
 * Regression guard: verifies critical z-index stacking order invariants.
 * Certain peer or mutually-exclusive layers intentionally share values
 * (see comments in src/lib/zIndex.ts).
 */
import { describe, it, expect } from "vitest";
import { zIndex } from "../lib/zIndex";

describe("zIndex stacking order", () => {
  it("all values are positive integers", () => {
    for (const [key, value] of Object.entries(zIndex)) {
      expect(value, `zIndex.${key} should be > 0`).toBeGreaterThan(0);
      expect(Number.isInteger(value), `zIndex.${key} should be an integer`).toBe(true);
    }
  });

  it("scene content < video overlays < draggable active < caption", () => {
    expect(zIndex.base).toBeLessThan(zIndex.canvasOverlay);
    expect(zIndex.canvasOverlay).toBeLessThan(zIndex.videoBackground);
    expect(zIndex.videoBackground).toBeLessThan(zIndex.overlaysBelowVideo);
    expect(zIndex.overlaysBelowVideo).toBeLessThan(zIndex.videoPip);
    expect(zIndex.videoPip).toBeLessThanOrEqual(zIndex.draggableElement);
    expect(zIndex.draggableElement).toBeLessThan(zIndex.overlaysAboveVideo);
    expect(zIndex.overlaysAboveVideo).toBeLessThan(zIndex.draggableElementActive);
    expect(zIndex.draggableElementActive).toBeLessThan(zIndex.caption);
  });

  it("video/caption < fullscreenCanvas < controls < HUD triggers < panels < popovers", () => {
    expect(zIndex.caption).toBeLessThan(zIndex.fullscreenCanvas);
    expect(zIndex.fullscreenCanvas).toBeLessThan(zIndex.floatingControls);
    expect(zIndex.floatingControls).toBeLessThan(zIndex.floatingControlsDropdown);
    expect(zIndex.floatingControlsDropdown).toBeLessThan(zIndex.floatingPanelTrigger);
    expect(zIndex.floatingPanelTrigger).toBeLessThan(zIndex.floatingPanel);
    expect(zIndex.floatingPanel).toBeLessThan(zIndex.floatingPanelDropdown);
    expect(zIndex.floatingPanelDropdown).toBeLessThan(zIndex.transitionPopover);
    expect(zIndex.transitionPopover).toBeLessThan(zIndex.broadcastStats);
  });

  it("popovers/stats < dialogs < textToolbar < loader < modals", () => {
    expect(zIndex.broadcastStats).toBeLessThan(zIndex.excalidrawOverlay);
    expect(zIndex.excalidrawOverlay).toBeLessThan(zIndex.dialog);
    expect(zIndex.dialog).toBeLessThan(zIndex.sessionsPanel);
    expect(zIndex.sessionsPanel).toBeLessThan(zIndex.textToolbar);
    expect(zIndex.textToolbar).toBeLessThan(zIndex.loader);
    expect(zIndex.loader).toBeLessThan(zIndex.streamModal);
    expect(zIndex.streamModal).toBeLessThan(zIndex.streamModalInner);
    expect(zIndex.streamModalInner).toBeLessThan(zIndex.streamModalOverlay);
    expect(zIndex.fileVaultPreview).toBeGreaterThan(zIndex.loader);
  });
});
