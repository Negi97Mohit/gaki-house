import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,

  // UI Controls
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),

  // Server Controls (Optional: useful for debugging or manual restarts)
  restartServer: () => ipcRenderer.send("restart-server"),

  // System Info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Stream Controls
  stream: {
    start: (config: { id: string; rtmpUrl: string; key: string; mimeType?: string }) => {
      console.log("[Preload] Starting stream:", config);
      ipcRenderer.send("stream:start", config);
    },
    sendData: (chunk: any) => ipcRenderer.send("stream:data", chunk),
    stop: (config?: { id?: string }) => ipcRenderer.send("stream:stop", config),
    onStatus: (callback: (data: any) => void) =>
      ipcRenderer.on("stream:status", (_, data) => {
        console.log("[Preload] Received status:", data);
        if (data) callback(data);
      }),
    onFfmpegReady: (callback: (data: { id: string }) => void) =>
      ipcRenderer.on("stream:ffmpeg-ready", (_, data) => callback(data)),
  },

  // Desktop Capturer
  getDesktopSources: (options: any) =>
    ipcRenderer.invoke("get-desktop-sources", options),
});
