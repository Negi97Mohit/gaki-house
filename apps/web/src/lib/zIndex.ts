// src/lib/zIndex.ts
// IMPORTANT: All values must be unique positive integers.
// The zIndex.smoke.test.ts regression guard enforces this automatically.
export const zIndex = {
  base: 1,
  canvasOverlay: 10,
  videoBackground: 50,
  overlaysBelowVideo: 75,
  videoPip: 100,
  overlaysAboveVideo: 150,
  draggableElement: 160,       // was 100, conflicted with videoPip
  draggableElementHover: 170,  // was 150, conflicted with overlaysAboveVideo
  draggableElementActive: 200,
  caption: 999,
  fullscreenCanvas: 2000,
  floatingControls: 2010,
  floatingControlsDropdown: 2015,
  sceneTabs: 2016,             // was 2020, resolved cluster
  floatingLogo: 2017,          // was 2020, resolved cluster
  floatingPanelTrigger: 2018,  // was 2020, resolved cluster
  aiPopoverTrigger: 2019,      // was 2020, resolved cluster
  floatingPanel: 2025,
  floatingPanelDropdown: 2028, // was 2030, resolved cluster
  aiPopoverContent: 2030,
  assetPopover: 2032,          // was 2030, conflicted with aiPopoverContent
  transitionPopover: 2040,
  broadcastStats: 2050,
  excalidrawOverlay: 4000,
  dialog: 5000,
  sessionsPanel: 5050,
  textToolbar: 9990,
  loader: 9999,
  streamModal: 10000,
  streamModalInner: 10001,
  streamModalOverlay: 10002,
  fileVaultPreview: 10003,     // was 10000, conflicted with streamModal
};
