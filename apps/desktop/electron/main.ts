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
import Store from "electron-store";

// 1. Fix Path for macOS/Linux environment variables

// Initialize persistent storage
const store = new Store();

// 2. Configure FFmpeg
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath.replace("app.asar", "app.asar.unpacked"));
}

let mainWindow: BrowserWindow | null = null;

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
    mainWindow.loadFile(path.join(__dirname, "../../web/dist/index.html"));
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
      shell.openExternal(url);
      return { action: "deny" };
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
  onEnd: () => void,
  onProgress: (progress: any) => void
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

  command.on("progress", (progress) => {
    onProgress(progress);
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
        },
        (progress) => {
          event.sender.send("stream:progress", { 
            id, 
            fps: progress.currentFps, 
            kbps: progress.currentKbps 
          });
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
  // Uses a temporary loopback HTTP server on port 80 to capture the OAuth redirect,
  // since "http://localhost" is registered as an authorized redirect URI in Google Cloud Console.
  ipcMain.handle(
    "auth:google-oauth",
    async (event, { apiKey }: { apiKey: string }) => {
      return new Promise(async (resolve) => {
        let loopbackServer: http.Server | null = null;
        let authWindow: BrowserWindow | null = null;
        let resolved = false;

        const cleanup = () => {
          if (loopbackServer) {
            try { loopbackServer.close(); } catch (_) {}
            loopbackServer = null;
          }
          if (authWindow && !authWindow.isDestroyed()) {
            authWindow.close();
          }
          authWindow = null;
        };

        const tryResolve = (data: any) => {
          if (resolved) return;
          resolved = true;
          resolve(data);
          cleanup();
        };

        try {
          // Hardcoded Web SDK client ID (matches Firebase project)
          const clientId =
            "696196670090-698euvvutelhc3v2ic0nfqcu2tr251vt.apps.googleusercontent.com";

          // The redirect URI MUST exactly match what's registered in Google Cloud Console.
          // "http://localhost" (port 80) is already registered.
          const redirectUri = "http://localhost";

          // 1. Try to create a loopback HTTP server on port 80 to capture the redirect
          let usingLoopbackServer = false;
          loopbackServer = http.createServer((req, res) => {
            if (req.method === "POST") {
              let body = "";
              req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
              req.on("end", () => {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("OK");
                try {
                  const params = new URLSearchParams(body);
                  const idToken = params.get("id_token");
                  const accessToken = params.get("access_token");
                  if (idToken) {
                    console.log("[Auth] Successfully extracted tokens via loopback server");
                    tryResolve({ idToken, accessToken });
                  }
                } catch (e) {
                  console.error("[Auth] Failed to parse token POST:", e);
                }
              });
            } else {
              // GET request — Google redirects here with tokens in the fragment (#id_token=...).
              // Fragments are NOT sent to the server, so serve a page that reads and POSTs them.
              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(`<!DOCTYPE html>
<html><body><p>Signing in…</p><script>
  var h = location.hash.substring(1);
  if (h) {
    fetch(location.origin, { method: "POST", body: h })
      .then(function() { document.body.innerText = "Done! You can close this window."; })
      .catch(function() { document.body.innerText = "Auth error. Close this window and try again."; });
  } else {
    document.body.innerText = "Auth error: no tokens received.";
  }
</script></body></html>`);
            }
          });

          try {
            await new Promise<void>((listenResolve, listenReject) => {
              loopbackServer!.on("error", listenReject);
              loopbackServer!.listen(80, "127.0.0.1", () => {
                loopbackServer!.removeAllListeners("error");
                listenResolve();
              });
            });
            usingLoopbackServer = true;
            console.log("[Auth] Loopback server listening on port 80");
          } catch (portErr) {
            // Port 80 is unavailable — fall back to fragment extraction via BrowserWindow
            console.warn("[Auth] Port 80 unavailable, using fragment extraction fallback");
            try { loopbackServer.close(); } catch (_) {}
            loopbackServer = null;
          }

          // 2. Build the Google OAuth URL
          const scope = "openid email profile";
          const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=token id_token` +
            `&scope=${encodeURIComponent(scope)}` +
            `&nonce=${Date.now().toString(36)}`;

          // 3. Open the auth in system browser if possible, else fallback to Electron window
          if (usingLoopbackServer) {
            shell.openExternal(authUrl);
          } else {
            authWindow = new BrowserWindow({
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

            authWindow.loadURL(authUrl);
          }

          // 4. If loopback server is NOT running, extract tokens from the BrowserWindow URL
          if (!usingLoopbackServer) {
            const tryExtractTokensFromPage = async () => {
              if (resolved || !authWindow || authWindow.isDestroyed()) return;
              try {
                const fullUrl = await authWindow.webContents.executeJavaScript(
                  "window.location.href"
                );
                if (fullUrl && fullUrl.includes("#") && fullUrl.includes("id_token")) {
                  const hash = fullUrl.split("#")[1];
                  const params = new URLSearchParams(hash);
                  const idToken = params.get("id_token");
                  const accessToken = params.get("access_token");
                  if (idToken) {
                    console.log("[Auth] Successfully extracted tokens via fragment");
                    tryResolve({ idToken, accessToken });
                  }
                }
              } catch (e) {
                // Window may have been destroyed, ignore
              }
            };

            authWindow.webContents.on("did-navigate", (_, url) => {
              if (url.startsWith(redirectUri)) {
                setTimeout(tryExtractTokensFromPage, 200);
              }
            });

            authWindow.webContents.on(
              "did-fail-load",
              (_, errorCode, errorDesc, validatedURL) => {
                if (validatedURL.startsWith(redirectUri)) {
                  setTimeout(tryExtractTokensFromPage, 200);
                }
              }
            );

            authWindow.webContents.on("did-finish-load", () => {
              tryExtractTokensFromPage();
            });
          }

          if (authWindow) {
            authWindow.on("closed", () => {
              authWindow = null;
              if (!resolved) {
                resolved = true;
                resolve(null);
                if (loopbackServer) {
                  try { loopbackServer.close(); } catch (_) {}
                  loopbackServer = null;
                }
              }
            });
          }

          // Safety timeout — 5 minutes
          setTimeout(() => {
            if (!resolved) {
              console.warn("[Auth] OAuth timed out after 5 minutes");
              tryResolve(null);
            }
          }, 5 * 60 * 1000);
        } catch (error) {
          console.error("[Auth] Google OAuth error:", error);
          tryResolve(null);
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

  // 7. LOGGER HANDLERS
  const logPath = path.join(app.getPath("userData"), "telemetry.log");
  const oldPath = path.join(app.getPath("userData"), "telemetry.old.log");
  let checkingRotation = false;

  ipcMain.on("logger:append", (event, line: string) => {
    // Fire-and-forget async append prevents blocking any threads.
    fs.appendFile(logPath, line + "\n", () => {
      // Very cheap rotation check guard preventing stat races
      if (!checkingRotation) {
        checkingRotation = true;
        fs.stat(logPath, (err, stats) => {
          if (!err && stats.size > 10 * 1024 * 1024) { // 10MB limit
            fs.rename(logPath, oldPath, () => {
              checkingRotation = false;
            });
          } else {
            checkingRotation = false;
          }
        });
      }
    });
  });

  // 8. ASSET FILE READER
  ipcMain.handle("asset:read-file", async (_event, filePath: string) => {
    try {
      const buffer = await fs.promises.readFile(filePath);
      return buffer;
    } catch (err: any) {
      console.error("[asset:read-file] Failed to read:", filePath, err.message);
      return null;
    }
  });
}

// --- SERVER & APP LIFECYCLE ---

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
});



