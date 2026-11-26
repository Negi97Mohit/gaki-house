// src/lib/zIndex.ts
// Layers intentionally share values within the same visual tier:
// - videoPip & draggableElement (100): peer canvas items; draggable elements elevate to 150 on hover and 200 when active.
// - sceneTabs, floatingLogo, floatingPanelTrigger, aiPopoverTrigger (2020): peer HUD chrome above fullscreenCanvas/floatingControls, below floatingPanel (2025).
// - floatingPanelDropdown, aiPopoverContent, assetPopover (2030): mutually exclusive popovers/dropdowns above floatingPanel (2025).
// - streamModal & fileVaultPreview (10000): mutually exclusive top-level modals above loader (9999).
export const zIndex = {
  base: 1,
  canvasOverlay: 10,
  videoBackground: 50,
  videoPip: 100,
  overlaysBelowVideo: 75,
  overlaysAboveVideo: 150,
  draggableElement: 100,
  draggableElementHover: 150,
  draggableElementActive: 200,
  caption: 999,
  fullscreenCanvas: 2000,
  floatingControls: 2010,
  floatingControlsDropdown: 2015,
  sceneTabs: 2020,
  floatingLogo: 2020,
  excalidrawOverlay: 4000,
  floatingPanelTrigger: 2020,
  aiPopoverTrigger: 2020,
  floatingPanel: 2025,
  floatingPanelDropdown: 2030,
  aiPopoverContent: 2030,
  assetPopover: 2030,
  transitionPopover: 2040,
  dialog: 5000,
  sessionsPanel: 5050,
  textToolbar: 9990,
  loader: 9999,
  streamModal: 10000,
  streamModalInner: 10001,
  streamModalOverlay: 10002,
  fileVaultPreview: 10000,
  broadcastStats: 2050,
};
