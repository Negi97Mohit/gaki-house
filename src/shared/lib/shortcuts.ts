// Centralized keyboard shortcut definitions
// Format shortcut for display based on platform (Mac vs Windows/Linux)
const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const getModifierKey = () => isMac ? '⌘' : 'Ctrl';
export const getShiftKey = () => isMac ? '⇧' : 'Shift';

export const SHORTCUTS = {
  // System & View
  fullscreen: { key: 'F', display: 'F' },
  settings: { key: ',', modifier: true, display: `${getModifierKey()}+,` },
  
  // AI Assistant
  aiAssistant: { key: 'K', modifier: true, display: `${getModifierKey()}+K` },
  
  // Canvas & History
  undo: { key: 'Z', modifier: true, display: `${getModifierKey()}+Z` },
  redo: { key: 'Z', modifier: true, shift: true, display: `${getModifierKey()}+${getShiftKey()}+Z` },
  resetScene: { key: '0', modifier: true, display: `${getModifierKey()}+0` },
  delete: { key: 'Delete/Backspace', display: 'Del' },
  
  // Layer Control
  bringToFront: { key: ']', display: ']' },
  sendToBack: { key: '[', display: '[' },
  bringForward: { key: ']', modifier: true, display: `${getModifierKey()}+]` },
  sendBackward: { key: '[', modifier: true, display: `${getModifierKey()}+[` },
  
  // Media & Stream
  toggleMic: { key: 'M', modifier: true, display: `${getModifierKey()}+M` },
  toggleCamera: { key: 'E', modifier: true, display: `${getModifierKey()}+E` },
  toggleBroadcast: { key: 'B', modifier: true, display: `${getModifierKey()}+B` },
  smartSwitch: { key: 'S', display: 'S' },
  screenShare: { key: 'P', modifier: true, display: `${getModifierKey()}+P` },
  
  // Scenes & Layouts
  addScene: { key: 'N', modifier: true, display: `${getModifierKey()}+N` },
  toggleGridLayout: { key: 'G', display: 'G' },
  
  // Element Creation
  addText: { key: 'T', display: 'T' },
  openAssetLibrary: { key: 'L', display: 'L' },
  toggleDrawing: { key: 'D', display: 'D' },
} as const;

export type ShortcutKey = keyof typeof SHORTCUTS;

// Helper to format tooltip with shortcut
export const formatTooltip = (label: string, shortcutKey?: ShortcutKey): string => {
  if (!shortcutKey || !SHORTCUTS[shortcutKey]) return label;
  return `${label} (${SHORTCUTS[shortcutKey].display})`;
};
