import { app, BrowserWindow, shell, session, ipcMain } from "electron";
import path from "path";
import { startRtmpServer } from "./rtmp-server";

// Ignore certificate errors for self-signed certs (Vite HTTPS)
app.commandLine.appendSwitch("ignore-certificate-errors");

let mainWindow: BrowserWindow | null = null;
let rtmpSession: any = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#00000000",
      symbolColor: "#ffffff",
    },
  });

  // Handle Permissions (Camera/Mic)
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const allowedPermissions = [
        "media",
        "mediaKeySystem",
        "accessibility",
        "notifications",
      ];
      if (allowedPermissions.includes(permission)) {
        callback(true);
      } else {
        callback(false);
      }
    }
  );

  // Load the App
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    mainWindow.loadURL("https://localhost:5173");
    mainWindow.webContents.openDevTools();
  }

  // Handle External Links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
};

// --- IPC Listeners ---
ipcMain.on("toggle-fullscreen", () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

// --- App Lifecycle ---
app.on("ready", () => {
  createWindow();

  // Start the internal RTMP Server
  try {
    console.log("Starting RTMP Server...");
    rtmpSession = startRtmpServer();
  } catch (err) {
    console.error("Failed to start RTMP server:", err);
  }
});

app.on("will-quit", () => {
  // Stop the server gracefully
  if (rtmpSession) {
    rtmpSession.stop();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
