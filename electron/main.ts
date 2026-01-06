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

// --- STREAMING LOGIC (SHARED) ---

const createFfmpegCommand = (
  input: string | any,
  rtmpUrl: string,
  key: string,
  onStart: (cmd: string) => void,
  onError: (err: Error) => void,
  onEnd: () => void
) => {
  const fullUrl = key ? `${rtmpUrl}/${key}` : rtmpUrl;
  console.log("Initializing stream to:", fullUrl);

  const command = ffmpeg()
    .input(input)
    .inputFormat("webm") // Explicitly tell FFmpeg this is WebM stream
    .videoCodec("libx264")
    .audioCodec("aac")
    .outputOptions([
      "-preset veryfast", // CHANGED: ultrafast -> veryfast (better quality)
      "-tune zerolatency",
      "-b:v 4500k", // Increased bitrate for 1080p
      "-maxrate 4500k",
      "-bufsize 9000k",
      "-g 60",
      "-r 30", // Enforce 30fps
      "-vf scale=1920:-1", // Downscale/Upscale to 1080p width, auto height
      "-pix_fmt yuv420p",
      "-f flv",
    ])
    .output(fullUrl);

  command.on("start", (cmd) => {
    console.log("FFmpeg spawned:", cmd);
    onStart(cmd);
  });

  command.on("error", (err, stdout, stderr) => {
    // Ignore "SIGKILL" error which we cause intentionally on stop
    if (err.message.includes("SIGKILL")) return;
    console.error("FFmpeg Error:", err.message);
    if (stderr) console.error("FFmpeg Stderr:", stderr);
    onError(err);
  });

  command.on("end", () => {
    console.log("Stream ended successfully");
    onEnd();
  });

  return command;
};

// --- IPC STREAMING (NEW - FAST) ---

function setupIpcHandlers() {
  let ffmpegCommand: ffmpeg.FfmpegCommand | null = null;

  ipcMain.on("stream:start", (event, { rtmpUrl, key }) => {
    if (ffmpegCommand) {
      try {
        ffmpegCommand.kill("SIGKILL");
      } catch (e) { }
    }

    try {
      ffmpegCommand = createFfmpegCommand(
        "pipe:0",
        rtmpUrl,
        key,
        () => {
          event.sender.send("stream:status", { status: "started" });
          event.sender.send("stream:ffmpeg-ready"); // Signal ready for data
        },
        (err) => {
          event.sender.send("stream:status", {
            status: "error",
            error: err.message,
          });
        },
        () => {
          event.sender.send("stream:status", { status: "stopped" });
        }
      );
      ffmpegCommand.run();
    } catch (error: any) {
      event.sender.send("stream:status", {
        status: "error",
        error: error.message,
      });
    }
  });

  ipcMain.on("stream:data", (event, data) => {
    if (ffmpegCommand && (ffmpegCommand as any).ffmpegProc) {
      const proc = (ffmpegCommand as any).ffmpegProc;
      if (proc.stdin && proc.stdin.writable && !proc.killed) {
        try {
          proc.stdin.write(Buffer.from(data)); // Ensure Buffer
        } catch (err) {
          console.error("Write failed:", err);
        }

        // Error handler to prevent crashes
        if (!proc.stdin.listeners("error").length) {
          proc.stdin.on("error", (err: any) => {
            console.log("Stdin Error (ipc):", err.code);
          });
        }
      }
    }
  });

  ipcMain.on("stream:stop", (event) => {
    if (ffmpegCommand) {
      console.log("Stopping IPC stream...");
      ffmpegCommand.kill("SIGKILL");
      ffmpegCommand = null;
      event.sender.send("stream:status", { status: "stopped" });
    }
  });
}

// --- SOCKET STREAMING SERVER (LEGACY / WEB SUPPORT) ---

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

    socket.on("start-stream", ({ rtmpUrl, key }) => {
      if (!rtmpUrl || !key) {
        socket.emit("stream-status", "error: Missing RTMP URL or Key");
        return;
      }
      if (ffmpegCommand) {
        try {
          ffmpegCommand.kill("SIGKILL");
        } catch (e) { }
      }

      ffmpegCommand = createFfmpegCommand(
        "pipe:0",
        rtmpUrl,
        key,
        () => {
          socket.emit("ffmpeg-ready");
          socket.emit("stream-status", "started");
        },
        (err) => {
          socket.emit("stream-status", `error: ${err.message}`);
        },
        () => {
          socket.emit("stream-status", "stopped");
        }
      );
      ffmpegCommand.run();
    });

    socket.on("binary-stream", (data) => {
      if (ffmpegCommand && (ffmpegCommand as any).ffmpegProc) {
        const proc = (ffmpegCommand as any).ffmpegProc;
        if (proc.stdin && proc.stdin.writable && !proc.killed) {
          try {
            proc.stdin.write(data);
          } catch (err) {
            console.log("Write failed (stream likely closed):", err);
          }
          if (!proc.stdin.listeners("error").length) {
            proc.stdin.on("error", (err: any) => {
              console.log("Stdin Error (socket):", err.code);
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

// --- DESKTOP CAPTURER HANDLER ---
ipcMain.handle("get-desktop-sources", async (event, options) => {
  const sources = await desktopCapturer.getSources(options);
  // Serializable sources
  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
    appIcon: source.appIcon ? source.appIcon.toDataURL() : null,
  }));
});


// --- APP LIFECYCLE ---

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers(); // <--- Initialize IPC handlers
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
