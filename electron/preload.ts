// electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,

  // UI Controls
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),

  // Server Controls
  restartServer: () => ipcRenderer.send("restart-server"),

  // System Info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Stream Controls
  stream: {
    // UPDATED: Accepts an object with targets
    start: (config: any) => ipcRenderer.send("stream:start", config),
    sendData: (chunk: any) => ipcRenderer.send("stream:data", chunk),
    stop: () => ipcRenderer.send("stream:stop"),
    onStatus: (callback: (data: any) => void) =>
      ipcRenderer.on("stream:status", (_, data) => callback(data)),
    onFfmpegReady: (callback: () => void) =>
      ipcRenderer.on("stream:ffmpeg-ready", () => callback()),
  },

  // Desktop Capturer
  getDesktopSources: (options: any) =>
    ipcRenderer.invoke("get-desktop-sources", options),

  // Window Focus Tracking (NEW)
  onWindowFocusChanged: (callback: (isFocused: boolean) => void) => {
    const listener = (_: any, isFocused: boolean) => callback(isFocused);
    ipcRenderer.on("window-focus-changed", listener);
    return () => ipcRenderer.removeListener("window-focus-changed", listener);
  },
});
