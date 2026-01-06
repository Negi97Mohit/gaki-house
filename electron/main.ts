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

// 1. Fix Path for macOS/Linux
fixPath();

// 2. Configure FFmpeg
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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
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
}

// --- STREAMING SERVER ---

function startStreamingServer() {
  server = http.createServer();
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Frontend connected to streaming engine:", socket.id);
    let ffmpegCommand: ffmpeg.FfmpegCommand | null = null;

    // EVENT: START STREAM INITIALIZATION
    socket.on("start-stream", ({ rtmpUrl, key }) => {
      const fullUrl = key ? `${rtmpUrl}/${key}` : rtmpUrl;
      console.log("Initializing stream to:", fullUrl);

      if (!rtmpUrl || !key) {
        socket.emit("stream-status", "error: Missing RTMP URL or Key");
        return;
      }

      // Kill any existing process first
      if (ffmpegCommand) {
        try {
          ffmpegCommand.kill("SIGKILL");
        } catch (e) {
          /* ignore */
        }
      }

      ffmpegCommand = ffmpeg()
        .input("pipe:0")
        .inputFormat("webm") // Explicitly tell FFmpeg this is WebM stream
        .videoCodec("libx264")
        .audioCodec("aac")
        .outputOptions([
          "-preset veryfast",
          "-tune zerolatency",
          "-b:v 2500k",
          "-maxrate 2500k",
          "-bufsize 5000k",
          "-g 60",
          "-pix_fmt yuv420p",
          "-f flv",
        ])
        .output(fullUrl);

      // --- EVENT HANDLERS ---

      ffmpegCommand.on("start", (commandLine) => {
        console.log("FFmpeg spawned:", commandLine);
        // CRITICAL: Tell frontend we are ready for the FIRST CHUNK (Header)
        socket.emit("ffmpeg-ready");
        socket.emit("stream-status", "started");
      });

      ffmpegCommand.on("error", (err, stdout, stderr) => {
        // Ignore "SIGKILL" error which we cause intentionally on stop
        if (err.message.includes("SIGKILL")) return;

        console.error("FFmpeg Error:", err.message);
        if (stderr) console.error("FFmpeg Stderr:", stderr);
        socket.emit("stream-status", `error: ${err.message}`);
      });

      ffmpegCommand.on("end", () => {
        console.log("Stream ended successfully");
        socket.emit("stream-status", "stopped");
      });

      // Run
      ffmpegCommand.run();
    });

    // EVENT: BINARY DATA CHUNKS
    socket.on("binary-stream", (data) => {
      if (ffmpegCommand && (ffmpegCommand as any).ffmpegProc) {
        const proc = (ffmpegCommand as any).ffmpegProc;

        // Safety check: is the pipe open?
        if (proc.stdin && proc.stdin.writable && !proc.killed) {
          // SAFE WRITE: Catch 'write EOF' error to prevent main process crash
          try {
            const result = proc.stdin.write(data);
            if (!result) {
              // If buffer full, we could wait for drain, but for live stream we might drop or pause
              // console.log("FFmpeg buffer full");
            }
          } catch (err) {
            console.log("Write failed (stream likely closed):", err);
          }

          // Attach error listener once to prevent crash on future writes
          if (!proc.stdin.listeners("error").length) {
            proc.stdin.on("error", (err: any) => {
              console.log(
                "Stdin Error (safe to ignore if stopping):",
                err.code
              );
            });
          }
        }
      }
    });

    socket.on("stop-stream", () => {
      if (ffmpegCommand) {
        console.log("Stopping stream...");
        ffmpegCommand.kill("SIGKILL");
        ffmpegCommand = null;
        socket.emit("stream-status", "stopped");
      }
    });

    socket.on("disconnect", () => {
      if (ffmpegCommand) {
        ffmpegCommand.kill("SIGKILL");
      }
    });
  });

  server.listen(3000, () => {
    console.log("Streaming Engine running on port 3000");
  });
}

// --- APP LIFECYCLE ---

app.whenReady().then(() => {
  createWindow();
  startStreamingServer();

  // Screen Capture Permission Handler
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer
      .getSources({ types: ["screen"] })
      .then((sources) => {
        if (sources.length > 0) {
          callback({ video: sources[0], audio: "loopback" });
        } else {
          console.error("No screen sources found");
        }
      })
      .catch((err) => {
        console.error("Error getting screen sources:", err);
      });
  });

  ipcMain.on("toggle-fullscreen", () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

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

app.on("before-quit", () => {
  if (io) io.close();
  if (server) server.close();
});
