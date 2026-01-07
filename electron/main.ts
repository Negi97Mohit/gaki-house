import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
  desktopCapturer,
} from "electron";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fixPath from "fix-path";

// 1. Fix Path for macOS/Linux environment variables
fixPath();

// 2. Configure FFmpeg path
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath.replace("app.asar", "app.asar.unpacked"));
}

let mainWindow: BrowserWindow | null = null;
let io: SocketIOServer | null = null;
let server: http.Server | null = null;

// --- WINDOW MANAGEMENT ---

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#000000",
    icon: path.join(__dirname, "../../build/icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // Recommended security practice
      preload: path.join(__dirname, "preload.js"),
      // CRITICAL FIX: Prevents the stream from freezing when the window is in the background/minimized
      backgroundThrottling: false,
      webSecurity: false, // Often needed for local media resources in development
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  // Track window focus state for UI adjustments if needed
  mainWindow.on("focus", () => {
    mainWindow?.webContents.send("window-focus-changed", true);
  });

  mainWindow.on("blur", () => {
    mainWindow?.webContents.send("window-focus-changed", false);
  });
}

// --- STREAMING LOGIC ---

// Helper to manage the FFmpeg process
let ffmpegCommand: any = null;

// --- IPC HANDLERS ---

function setupIpcHandlers() {
  // Handler 1: Get Desktop Sources (Windows & Screens)
  ipcMain.handle("get-desktop-sources", async (event, options) => {
    try {
      const finalOptions = {
        types: ["window", "screen"],
        thumbnailSize: { width: 400, height: 400 }, // High-res thumbnails for the picker
        fetchWindowIcons: true,
        ...options,
      };

      const sources = await desktopCapturer.getSources(finalOptions);

      // Map to a serializable format
      return sources.map((source) => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        appIcon: source.appIcon ? source.appIcon.toDataURL() : null,
      }));
    } catch (error) {
      console.error("Error getting desktop sources:", error);
      return [];
    }
  });

  // Handler 2: Start Stream
  ipcMain.on("stream:start", (event, config) => {
    const { targets } = config;
    if (!targets || targets.length === 0) return;

    // Use the first target for now (multi-stream can be expanded here)
    const rtmpUrl = targets[0].url + "/" + targets[0].key;

    console.log("Starting FFmpeg stream to:", rtmpUrl);

    if (ffmpegCommand) {
      ffmpegCommand.kill("SIGKILL");
    }

    // Input via Stdin (binary data from renderer)
    ffmpegCommand = ffmpeg()
      .input("pipe:0")
      .inputFormat("webm") // Chrome sends webm chunks
      .videoCodec("libx264")
      .audioCodec("aac")
      // Low-latency flags
      .addOption("-preset", "ultrafast")
      .addOption("-tune", "zerolatency")
      .addOption("-g", "60") // Keyframe interval
      .addOption("-b:v", "4000k") // Bitrate
      .addOption("-bufsize", "8000k")
      .addOption("-maxrate", "4500k")
      .output(rtmpUrl)
      .on("start", () => {
        console.log("FFmpeg process started");
        event.reply("stream:status", { status: "started" });
        event.reply("ffmpeg:ready");
      })
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg Error:", err.message);
        console.error("FFmpeg Stderr:", stderr);
        event.reply("stream:status", { status: "error", error: err.message });
      })
      .on("end", () => {
        console.log("FFmpeg process ended");
        event.reply("stream:status", { status: "stopped" });
      });

    ffmpegCommand.run();
  });

  // Handler 3: Receive Video Data chunks
  ipcMain.on("stream:data", (event, buffer) => {
    if (ffmpegCommand && ffmpegCommand.ffmpegProc) {
      try {
        const stream = ffmpegCommand.ffmpegProc.stdin;
        if (stream.writable) {
          stream.write(Buffer.from(buffer));
        }
      } catch (e) {
        console.error("Error writing to FFmpeg stdin:", e);
      }
    }
  });

  // Handler 4: Stop Stream
  ipcMain.on("stream:stop", () => {
    if (ffmpegCommand) {
      ffmpegCommand.kill("SIGKILL");
      ffmpegCommand = null;
    }
    mainWindow?.webContents.send("stream:status", { status: "stopped" });
  });
}

// --- APP LIFECYCLE ---

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
