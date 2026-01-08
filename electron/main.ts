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
    icon: path.join(__dirname, "../../build/icon.png"),
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
  options: {
    rtmpUrl: string;
    key: string;
    mimeType?: string;
  },
  onStart: (cmd: string) => void,
  onError: (err: Error) => void,
  onEnd: () => void
) => {
  const { rtmpUrl, key, mimeType } = options;
  const fullUrl = key ? `${rtmpUrl}/${key}` : rtmpUrl;
  console.log(`Initializing stream to: ${fullUrl} (Input: ${mimeType || "unknown"})`);

  const isH264Input = mimeType?.includes("h264");

  const command = ffmpeg().input(input);

  // Input Format Logic
  command.inputFormat("webm"); // MediaRecorder ALWAYS sends WebM container (even if H.264 inside)

  // Audio Codec (Always AAC for RTMP)
  command.audioCodec("aac");

  // Video Codec Logic
  if (isH264Input) {
    console.log("--- STREAM MODE: PASS-THROUGH (CPU OPTIMIZED) ---");
    // Pass-through H.264 video directly provided by MediaRecorder
    command.videoCodec("copy");
    // FLV container needs h264_mp4toannexb for H.264
    // from WebM to FLV/RTMP, we typically need this to ensure Annex B format
    command.outputOptions("-bsf:v h264_mp4toannexb");
  } else {
    console.log("--- STREAM MODE: TRANSCODE (HARDWARE/SOFTWARE) ---");

    // Try Hardware Acceleration (Best Effort)
    // Note: We can't easily "try" and fallback in one go without complex probing.
    // For now, we sticking to a highly optimized Software Preset to ensure stability across all user PCs without crashes.
    // If user has GPU, standard libx264 is still CPU bound.
    // FUTURE TODO: Add explicit "Hardware Encoder" option in UI to select 'h264_nvenc'.

    // SW ENCODING OPTIMIZED
    command.videoCodec("libx264");
    command.outputOptions([
      "-preset ultrafast", // CHANGED: veryfast -> ultrafast (Lowest CPU usage)
      "-tune zerolatency",
      "-b:v 4500k",
      "-maxrate 4500k",
      "-bufsize 9000k",
      "-g 60", // Keyframe interval 2s (30fps)
      "-r 30",
      "-vf scale=1920:-1",
      "-pix_fmt yuv420p",
    ]);
  }

  // Common Output Options
  command.outputOptions([
    "-f flv",
  ]);

  command.output(fullUrl);

  command.on("start", (cmd) => {
    console.log("FFmpeg spawned:", cmd);
    onStart(cmd);
  });

  command.on("error", (err, stdout, stderr) => {
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
  const ffmpegCommands = new Map<string, ffmpeg.FfmpegCommand>();

  ipcMain.on("stream:start", (event, config) => { // Config: { id, rtmpUrl, key, mimeType }
    const { id, rtmpUrl, key } = config;

    if (ffmpegCommands.has(id)) {
      try {
        ffmpegCommands.get(id)?.kill("SIGKILL");
        ffmpegCommands.delete(id);
      } catch (e) { }
    }

    try {
      const command = createFfmpegCommand(
        "pipe:0",
        config,
        () => {
          event.sender.send("stream:status", { id, status: "started" });
          // Only send ffmpeg-ready once if needed, or track it per stream? 
          // For simplicity, we can treat "started" as ready. 
          // But the frontend waits for "stream:ffmpeg-ready" to start recording.
          // We should probably emit ready if it's the first one, or just assume ready if others are running.
          // Actually, the recorder is shared. If it's already running, we just need to pipe to this new process.
          // Let's send it anyway.
          event.sender.send("stream:ffmpeg-ready", { id });
        },
        (err) => {
          event.sender.send("stream:status", {
            id,
            status: "error",
            error: err.message,
          });
          ffmpegCommands.delete(id);
        },
        () => {
          event.sender.send("stream:status", { id, status: "stopped" });
          ffmpegCommands.delete(id);
        }
      );

      ffmpegCommands.set(id, command);
      command.run();

    } catch (error: any) {
      event.sender.send("stream:status", {
        id,
        status: "error",
        error: error.message,
      });
    }
  });

  ipcMain.on("stream:data", (event, data) => {
    // Broadcast data to ALL active ffmpeg processes
    ffmpegCommands.forEach((command, id) => {
      if ((command as any).ffmpegProc) {
        const proc = (command as any).ffmpegProc;
        if (proc.stdin && proc.stdin.writable && !proc.killed) {
          try {
            proc.stdin.write(Buffer.from(data)); // Ensure Buffer
          } catch (err) {
            console.error(`Write failed for stream ${id}:`, err);
          }

          // Error handler to prevent crashes
          if (!proc.stdin.listeners("error").length) {
            proc.stdin.on("error", (err: any) => {
              console.log(`Stdin Error (ipc) for ${id}:`, err.code);
            });
          }
        }
      }
    });
  });

  ipcMain.on("stream:stop", (event, config) => {
    // Safety check for config
    const id = config?.id;

    if (id) {
      // Stop specific stream
      const command = ffmpegCommands.get(id);
      if (command) {
        console.log(`Stopping IPC stream: ${id}`);
        try {
          command.kill("SIGKILL");
        } catch (e) { }
        ffmpegCommands.delete(id);
        event.sender.send("stream:status", { id, status: "stopped" });
      }
    } else {
      // Stop ALL streams
      console.log("Stopping ALL IPC streams...");
      ffmpegCommands.forEach((command, streamId) => {
        try {
          command.kill("SIGKILL");
        } catch (e) { }
        event.sender.send("stream:status", { id: streamId, status: "stopped" });
      });
      ffmpegCommands.clear();
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
        { rtmpUrl, key },
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
