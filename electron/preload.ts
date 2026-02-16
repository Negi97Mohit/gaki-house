import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,

  // UI Controls
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),
  restartServer: () => ipcRenderer.send("restart-server"),
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Stream Controls
  stream: {
    start: (config: any) => ipcRenderer.send("stream:start", config),
    sendData: (chunk: any) => ipcRenderer.send("stream:data", chunk),
    stop: (config: any) => ipcRenderer.send("stream:stop", config),
    onStatus: (callback: any) =>
      ipcRenderer.on("stream:status", (_, data) => callback(data)),
    onFfmpegReady: (callback: any) =>
      ipcRenderer.on("stream:ffmpeg-ready", (_, data) => callback(data)),
  },

  // Recorder Controls
  recorder: {
    start: () => ipcRenderer.invoke("recorder:start"),
    write: (chunk: ArrayBuffer) => ipcRenderer.invoke("recorder:write", chunk),
    // Updated to accept duration argument
    stop: (durationMs?: number) =>
      ipcRenderer.invoke("recorder:stop", durationMs),
  },

  // Storage Controls (for persistent settings)
  storage: {
    get: (key: string) => ipcRenderer.invoke("storage:get", key),
    set: (key: string, value: any) => ipcRenderer.invoke("storage:set", key, value),
    delete: (key: string) => ipcRenderer.invoke("storage:delete", key),
  },

  // Desktop Capturer
  getDesktopSources: (options: any) =>
    ipcRenderer.invoke("get-desktop-sources", options),

  // Auth Controls
  auth: {
    start: (url: string) => ipcRenderer.invoke("auth:start", url),
  },

  // Proxy Controls
  proxy: {
    request: (url: string, options: any) =>
      ipcRenderer.invoke("proxy:request", url, options),
  },

  // Kick Browser Fetcher
  kickFetch: (url: string) => ipcRenderer.invoke("kick-fetch-url", url),
});
