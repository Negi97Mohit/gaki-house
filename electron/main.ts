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
import Store from "electron-store";

// 1. Fix Path for macOS/Linux environment variables
fixPath();

// Initialize persistent storage
const store = new Store();

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

  // CHANGE: Maximize window on startup
  mainWindow.maximize();

  mainWindow.setMenuBarVisibility(false);

  // In development, load from Vite server
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else if (!app.isPackaged) {
    // Fallback for dev mode if env var is missing
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow Google and Firebase Auth flows to open in a new window
    // We check for the specific auth domain and Google's accounts domain
    const isAuthUrl =
      url.includes("accounts.google.com") ||
      url.includes("gaki-fb708.firebaseapp.com") ||
      // Also allow generic firebase auth domains just in case
      url.includes("firebaseapp.com/__/auth/");

    if (isAuthUrl) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          parent: mainWindow || undefined,
          modal: true,
        },
      };
    }

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
      } catch (e) { }
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
        } catch (e) { }
        ffmpegCommands.delete(id);
        event.sender.send("stream:status", { id, status: "stopped" });
      }
    } else {
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

  // 3. STORAGE HANDLERS
  ipcMain.handle("storage:get", (_, key: string) => {
    return store.get(key);
  });

  ipcMain.handle("storage:set", (_, key: string, value: any) => {
    store.set(key, value);
    return true;
  });

  ipcMain.handle("storage:delete", (_, key: string) => {
    store.delete(key);
    return true;
  });

  // 4. AUTH HANDLERS
  ipcMain.handle("auth:start", async (event, authUrl: string) => {
    return new Promise((resolve, reject) => {
      const authWindow = new BrowserWindow({
        width: 600,
        height: 700,
        show: true,
        parent: mainWindow || undefined,
        modal: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      authWindow.loadURL(authUrl);

      const handleCallback = (url: string) => {
        // Look for tokens in URL params (Twitch/YouTube usually return fragments or query params)
        if (url.includes("access_token") || url.includes("code")) {
          resolve(url);
          authWindow.close();
        }
      };

      authWindow.webContents.on("will-navigate", (event, url) => {
        handleCallback(url);
      });

      authWindow.webContents.on("will-redirect", (event, url) => {
        handleCallback(url);
      });

      authWindow.on("closed", () => {
        resolve(null);
      });
    });
  });

  // Google OAuth flow for Electron (bypasses auth/unauthorized-domain)
  ipcMain.handle(
    "auth:google-oauth",
    async (event, { apiKey }: { apiKey: string }) => {
      return new Promise(async (resolve) => {
        try {
          // Fetch the Google client ID from Firebase's project config
          const fetch = (await import("node-fetch")).default;
          const configResp = await fetch(
            `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${apiKey}`
          );
          const configData = (await configResp.json()) as any;

          // Find the Google provider's client ID
          const googleProvider = configData?.idpConfig?.find(
            (p: any) => p.provider === "GOOGLE"
          );
          const clientId = googleProvider?.clientId;

          if (!clientId) {
            console.error(
              "[Auth] Could not find Google client ID from Firebase config"
            );
            resolve(null);
            return;
          }

          const redirectUri = "http://localhost";
          const scope = "openid email profile";
          const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=token id_token` +
            `&scope=${encodeURIComponent(scope)}` +
            `&nonce=${Date.now().toString(36)}`;

          const authWindow = new BrowserWindow({
            width: 500,
            height: 700,
            show: true,
            parent: mainWindow || undefined,
            modal: true,
            autoHideMenuBar: true,
            webPreferences: {
              nodeIntegration: false,
              contextIsolation: true,
            },
          });

          let resolved = false;
          const tryResolve = (data: any) => {
            if (resolved) return;
            resolved = true;
            resolve(data);
            if (!authWindow.isDestroyed()) authWindow.close();
          };

          // Use executeJavaScript to read the full URL including the fragment (#)
          // Navigation events (will-navigate, will-redirect) strip the fragment,
          // so we must read it from the page's own window.location after navigation.
          const tryExtractTokensFromPage = async () => {
            if (resolved || authWindow.isDestroyed()) return;
            try {
              const fullUrl = await authWindow.webContents.executeJavaScript(
                "window.location.href"
              );
              console.log("[Auth] Page URL:", fullUrl);
              if (
                fullUrl &&
                fullUrl.includes("#") &&
                fullUrl.includes("id_token")
              ) {
                const hash = fullUrl.split("#")[1];
                const params = new URLSearchParams(hash);
                const idToken = params.get("id_token");
                const accessToken = params.get("access_token");
                if (idToken) {
                  console.log("[Auth] Successfully extracted tokens");
                  tryResolve({ idToken, accessToken });
                }
              }
            } catch (e) {
              // Window may have been destroyed, ignore
            }
          };

          authWindow.loadURL(authUrl);

          // After Google redirects to http://localhost#tokens, the page will
          // either load (if something is on port 80) or fail. Either way,
          // window.location.href will contain the fragment with our tokens.
          authWindow.webContents.on("did-navigate", (_, url) => {
            if (url.startsWith(redirectUri)) {
              // Small delay to ensure the fragment is available in the page context
              setTimeout(tryExtractTokensFromPage, 100);
            }
          });

          authWindow.webContents.on(
            "did-fail-load",
            (_, errorCode, errorDesc, validatedURL) => {
              if (validatedURL.startsWith(redirectUri)) {
                setTimeout(tryExtractTokensFromPage, 100);
              }
            }
          );

          authWindow.webContents.on("did-finish-load", () => {
            tryExtractTokensFromPage();
          });

          authWindow.on("closed", () => {
            if (!resolved) resolve(null);
          });
        } catch (error) {
          console.error("[Auth] Google OAuth error:", error);
          resolve(null);
        }
      });
    }
  );

  // 5. PROXY HANDLERS (Bypass CORS)
  ipcMain.handle("proxy:request", async (event, url: string, options: any) => {
    try {
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(url, options);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error: any) {
      console.error("[Proxy] Request failed:", error);
      return { ok: false, status: 500, error: error.message };
    }
  });

  // 6. BROWSER FETCH HANDLER (Bypass Cloudflare)
  ipcMain.handle("kick-fetch-url", async (event, url: string) => {
    return new Promise((resolve) => {
      const fetchWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Hidden window
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      fetchWindow.loadURL(url);

      fetchWindow.webContents.on("did-finish-load", async () => {
        try {
          // extract JSON from the body
          const content = await fetchWindow.webContents.executeJavaScript(
            `document.body.innerText`
          );
          try {
            const json = JSON.parse(content);
            resolve({ ok: true, data: json });
          } catch (e) {
            resolve({ ok: false, error: "Failed to parse JSON" });
          }
        } catch (e: any) {
          resolve({ ok: false, error: e.message });
        }
        fetchWindow.close();
      });

      fetchWindow.webContents.on("did-fail-load", () => {
        resolve({ ok: false, error: "Failed to load URL" });
        fetchWindow.close();
      });

      // Timeout safety
      setTimeout(() => {
        if (!fetchWindow.isDestroyed()) {
          fetchWindow.close();
          resolve({ ok: false, error: "Timeout" });
        }
      }, 15000);
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
        } catch (e) { }

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
          } catch (err) { }
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
