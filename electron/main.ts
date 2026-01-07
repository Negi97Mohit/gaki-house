// electron/main.ts
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

// --- STREAMING LOGIC ---

// Helper: Build tee payload for multiple targets
const buildTeePayload = (targets: { url: string; key: string }[]) => {
  return targets
    .map((t) => {
      // Handle cases where key is part of URL or separate
      const sep = t.url.endsWith("/") ? "" : "/";
      const fullUrl = t.key ? `${t.url}${sep}${t.key}` : t.url;
      // [f=flv] forces the format for each leg of the tee
      return `[f=flv]${fullUrl}`;
    })
    .join("|");
};

const createFfmpegCommand = (
  input: string | any,
  targets: { url: string; key: string }[],
  onStart: (cmd: string) => void,
  onError: (err: Error) => void,
  onEnd: () => void
) => {
  console.log(`Initializing stream to ${targets.length} targets`);

  const command = ffmpeg()
    .input(input)
    .inputFormat("webm")
    .videoCodec("libx264")
    .audioCodec("aac")
    .outputOptions([
      "-preset veryfast",
      "-tune zerolatency",
      "-b:v 4500k",
      "-maxrate 4500k",
      "-bufsize 9000k",
      "-g 60",
      "-r 30",
      "-vf scale=1920:-1",
      "-pix_fmt yuv420p",
      "-map 0:v", // Map video from input 0
      "-map 0:a", // Map audio from input 0
    ]);

  // LOGIC: If 1 target -> Standard FLV. If > 1 -> Tee Muxer.
  if (targets.length === 1) {
    const t = targets[0];
    const sep = t.url.endsWith("/") ? "" : "/";
    const fullUrl = t.key ? `${t.url}${sep}${t.key}` : t.url;
    command.format("flv").output(fullUrl);
  } else {
    // Multi-stream using Tee Muxer
    const teePayload = buildTeePayload(targets);
    command
      .outputOptions(["-flags +global_header"]) // Critical for tee
      .format("tee")
      .output(teePayload);
  }

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

// --- IPC STREAMING (Electron Branch) ---

function setupIpcHandlers() {
  let ffmpegCommand: ffmpeg.FfmpegCommand | null = null;

  ipcMain.on("stream:start", (event, config) => {
    // Determine targets
    let targets: { url: string; key: string }[] = [];
    if (config.targets && Array.isArray(config.targets)) {
      targets = config.targets;
    } else if (config.rtmpUrl) {
      // Legacy fallback
      targets = [{ url: config.rtmpUrl, key: config.key }];
    }

    if (ffmpegCommand) {
      try {
        ffmpegCommand.kill("SIGKILL");
      } catch (e) {}
    }

    try {
      ffmpegCommand = createFfmpegCommand(
        "pipe:0",
        targets,
        () => {
          event.sender.send("stream:status", { status: "started" });
          event.sender.send("stream:ffmpeg-ready");
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
          proc.stdin.write(Buffer.from(data));
        } catch (err) {
          console.error("Write failed:", err);
        }
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

// --- SOCKET STREAMING SERVER (Web Branch) ---

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

    socket.on("start-stream", (data) => {
      let targets: { url: string; key: string }[] = [];
      if (data.targets && Array.isArray(data.targets)) {
        targets = data.targets;
      } else if (data.rtmpUrl) {
        targets = [{ url: data.rtmpUrl, key: data.key }];
      }

      if (targets.length === 0) {
        socket.emit("stream-status", "error: No targets");
        return;
      }

      if (ffmpegCommand) {
        try {
          ffmpegCommand.kill("SIGKILL");
        } catch (e) {}
      }

      ffmpegCommand = createFfmpegCommand(
        "pipe:0",
        targets,
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
            console.log("Write failed:", err);
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
  setupIpcHandlers();
  startStreamingServer();

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
