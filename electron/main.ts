import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { RtmpServer } from "./rtmp-server"; // Make sure this path is correct

let mainWindow: BrowserWindow | null = null;
let rtmpService: RtmpServer | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load your app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  // --- RTMP SERVER HANDLERS ---

  ipcMain.on("start-server", () => {
    try {
      if (!rtmpService) {
        rtmpService = new RtmpServer();
        rtmpService.start();
      }
    } catch (error) {
      console.error("Failed to start RTMP server:", error);
    }
  });

  ipcMain.on("stop-server", () => {
    try {
      if (rtmpService) {
        // This checks if the stop method exists before calling it
        if (typeof rtmpService.stop === "function") {
          rtmpService.stop();
        }
        rtmpService = null;
      }
    } catch (error) {
      console.error("Failed to stop RTMP server:", error);
    }
  });

  // Handle App Quit
  app.on("before-quit", () => {
    if (rtmpService) {
      try {
        rtmpService.stop();
      } catch (e) {
        console.log("Error stopping server on quit", e);
      }
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
