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
    start: (config: { rtmpUrl: string; key: string }) =>
      ipcRenderer.send("stream:start", config),
    sendData: (chunk: any) => ipcRenderer.send("stream:data", chunk),
    stop: () => ipcRenderer.send("stream:stop"),
    onStatus: (callback: (data: any) => void) =>
      ipcRenderer.on("stream:status", (_, data) => callback(data)),
    onFfmpegReady: (callback: () => void) =>
      ipcRenderer.on("stream:ffmpeg-ready", () => callback()),
  },
});
