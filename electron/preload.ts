import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  isElectron: true,
  toggleFullscreen: () => ipcRenderer.send("toggle-fullscreen"),
});
