import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
  desktopCapturer,
  dialog,
} from "electron";
import path from "path";
import http from "http";
import fs from "fs";
import { Server as SocketIOServer } from "socket.io";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fixPath from "fix-path";

// 1. Fix Path for macOS/Linux environment variables
fixPath();

// 2. Configure FFmpeg
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath.replace("app.asar", "app.asar.unpacked"));
}

let mainWindow: BrowserWindow | null = null;
let io: SocketIOServer | null = null;
let server: http.Server | null = null;

// --- RECORDER STATE ---
let recorderStream: fs.WriteStream | null = null;
let currentRecordingPath: string | null = null;

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

// --- STREAMING LOGIC (RTMP) ---

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
  console.log(
    `Initializing stream to: ${fullUrl} (Input: ${mimeType || "unknown"})`
  );

  const isH264Input = mimeType?.includes("h264");

  const command = ffmpeg().input(input);
  command.inputFormat("webm");
  command.audioCodec("aac");

  if (isH264Input) {
    command.videoCodec("copy");
    command.outputOptions("-bsf:v h264_mp4toannexb");
  } else {
    command.videoCodec("libx264");
    command.outputOptions([
      "-preset ultrafast",
      "-tune zerolatency",
      "-b:v 4500k",
      "-maxrate 4500k",
      "-bufsize 9000k",
      "-g 60",
      "-r 30",
      "-vf scale=1920:-1",
      "-pix_fmt yuv420p",
    ]);
  }

  command.outputOptions(["-f flv"]);
  command.output(fullUrl);

  command.on("start", (cmd) => {
    console.log("FFmpeg spawned:", cmd);
    onStart(cmd);
  });

  command.on("error", (err, stdout, stderr) => {
    if (err.message.includes("SIGKILL")) return;
    console.error("FFmpeg Error:", err.message);
    onError(err);
  });

  command.on("end", () => {
    console.log("Stream ended successfully");
    onEnd();
  });

  return command;
};

// --- HELPER: CONVERT TO MP4 (FIXES DURATION) ---
const convertToMp4 = (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(".webm", ".mp4");
    console.log(`[Recorder] Converting to MP4: ${inputPath} -> ${outputPath}`);

    ffmpeg(inputPath)
      .outputOptions([
        "-c:v copy", // Copy video stream (Fast, no re-encoding)
        "-c:a aac", // Ensure audio is AAC (Standard for MP4)
        "-strict experimental",
        "-movflags +faststart", // Move metadata to beginning for fast playback
      ])
      .save(outputPath)
      .on("end", () => {
        console.log("[Recorder] Conversion complete.");
        // Cleanup: Delete the raw WebM file
        try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          resolve(outputPath);
        } catch (e) {
          console.error("Cleanup error:", e);
          resolve(outputPath);
        }
      })
      .on("error", (err) => {
        console.error("[Recorder] Conversion failed:", err);
        // Return original file if conversion fails so user doesn't lose data
        resolve(inputPath);
      });
  });
};

// --- IPC HANDLERS ---

function setupIpcHandlers() {
  const ffmpegCommands = new Map<string, ffmpeg.FfmpegCommand>();

  // 1. STREAMING HANDLERS
  ipcMain.on("stream:start", (event, config) => {
    const { id, rtmpUrl, key } = config;

    if (ffmpegCommands.has(id)) {
      try {
        ffmpegCommands.get(id)?.kill("SIGKILL");
        ffmpegCommands.delete(id);
      } catch (e) {}
    }

    try {
      const command = createFfmpegCommand(
        "pipe:0",
        config,
        () => {
          event.sender.send("stream:status", { id, status: "started" });
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
    ffmpegCommands.forEach((command, id) => {
      if ((command as any).ffmpegProc) {
        const proc = (command as any).ffmpegProc;
        if (proc.stdin && proc.stdin.writable && !proc.killed) {
          try {
            proc.stdin.write(Buffer.from(data));
          } catch (err) {
            console.error(`Write failed for stream ${id}:`, err);
          }
          if (!proc.stdin.listeners("error").length) {
            proc.stdin.on("error", (err: any) =>
              console.log(`Stdin Error (ipc) for ${id}:`, err.code)
            );
          }
        }
      }
    });
  });

  ipcMain.on("stream:stop", (event, config) => {
    const id = config?.id;

    if (id) {
      const command = ffmpegCommands.get(id);
      if (command) {
        console.log(`Stopping IPC stream: ${id}`);
        try {
          command.kill("SIGKILL");
        } catch (e) {}
        ffmpegCommands.delete(id);
        event.sender.send("stream:status", { id, status: "stopped" });
      }
    } else {
      console.log("Stopping ALL IPC streams...");
      ffmpegCommands.forEach((command, streamId) => {
        try {
          command.kill("SIGKILL");
        } catch (e) {}
        event.sender.send("stream:status", { id: streamId, status: "stopped" });
      });
      ffmpegCommands.clear();
    }
  });

  // 2. RECORDER HANDLERS

  ipcMain.handle("recorder:start", async () => {
    try {
      const videosPath = app.getPath("videos");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `GAKI_Recording_${timestamp}.webm`; // Start as WebM
      const filePath = path.join(videosPath, filename);

      if (recorderStream) {
        recorderStream.end();
      }

      console.log(`[Recorder] Starting file stream: ${filePath}`);
      recorderStream = fs.createWriteStream(filePath);
      currentRecordingPath = filePath;

      recorderStream.on("error", (err) => {
        console.error("[Recorder] File Write Error:", err);
      });

      return { filePath };
    } catch (error: any) {
      console.error("[Recorder] Start Error:", error);
      throw error;
    }
  });

  ipcMain.handle("recorder:write", async (event, buffer) => {
    if (recorderStream && !recorderStream.destroyed) {
      recorderStream.write(Buffer.from(buffer));
    }
  });

  ipcMain.handle("recorder:stop", async (event, durationMs) => {
    return new Promise((resolve, reject) => {
      if (recorderStream) {
        console.log(`[Recorder] Closing stream. UI Duration: ${durationMs}ms`);
        const rawPath = currentRecordingPath;

        recorderStream.end(async () => {
          recorderStream = null;

          if (rawPath) {
            try {
              // Convert to MP4 to fix duration and ensure compatibility
              const finalPath = await convertToMp4(rawPath);
              resolve({ filePath: finalPath });
            } catch (e) {
              console.error("[Recorder] Fix failed:", e);
              resolve({ filePath: rawPath });
            }
          } else {
            resolve({ filePath: null });
          }
        });
      } else {
        resolve({ filePath: null });
      }
    });
  });
}

// --- SERVER & APP LIFECYCLE ---

function startStreamingServer() {
  server = http.createServer();
  io = new SocketIOServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("Frontend connected to streaming engine:", socket.id);
    let ffmpegCommand: ffmpeg.FfmpegCommand | null = null;

    socket.on("start-stream", ({ rtmpUrl, key }) => {
      if (!rtmpUrl || !key) return;
      if (ffmpegCommand)
        try {
          ffmpegCommand.kill("SIGKILL");
        } catch (e) {}

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
          } catch (err) {}
          if (!proc.stdin.listeners("error").length) {
            proc.stdin.on("error", (err: any) =>
              console.log("Stdin Error:", err.code)
            );
          }
        }
      }
    });

    socket.on("stop-stream", () => {
      if (ffmpegCommand) {
        ffmpegCommand.kill("SIGKILL");
        ffmpegCommand = null;
        socket.emit("stream-status", "stopped");
      }
    });

    socket.on("disconnect", () => {
      if (ffmpegCommand) ffmpegCommand.kill("SIGKILL");
    });
  });

  server.listen(3000, () => {
    console.log("Streaming Engine running on port 3000");
  });
}

ipcMain.handle("get-desktop-sources", async (event, options) => {
  const sources = await desktopCapturer.getSources(options);
  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
    appIcon: source.appIcon ? source.appIcon.toDataURL() : null,
  }));
});

app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
  startStreamingServer();

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer
      .getSources({ types: ["screen"] })
      .then((sources) => {
        if (sources.length > 0)
          callback({ video: sources[0], audio: "loopback" });
        else console.error("No screen sources found");
      })
      .catch((err) => console.error("Error getting screen sources:", err));
  });

  ipcMain.on("toggle-fullscreen", () => {
    if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (io) io.close();
  if (server) server.close();
});
