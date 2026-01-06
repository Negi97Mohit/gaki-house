import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,

  // UI Controls
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),

  // Server Controls (Optional: useful for debugging or manual restarts)
  restartServer: () => ipcRenderer.send("restart-server"),

  // System Info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
