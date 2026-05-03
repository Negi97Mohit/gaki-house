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

// 3. Register custom protocol for deep linking
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('gaki', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('gaki');
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
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#000000",
      symbolColor: "#ffffff",
      height: 32,
    },
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
    platform?: string;
  },
  onStart: (cmd: string) => void,
  onError: (err: Error) => void,
  onEnd: () => void,
  onProgress: (progress: any) => void
) => {
  const { rtmpUrl, key, mimeType } = options;
  const fullUrl = key ? `${rtmpUrl}/${key}` : rtmpUrl;

  const isH264Input = mimeType?.includes("h264");

  const command = ffmpeg().input(input);
  command.inputFormat("webm");
  // Explicit audio settings \u2014 without these FFmpeg guesses and often
  // produces 64kbps mono at mismatched sample rates (tinny, degraded quality).
  command.audioCodec("aac");
  command.audioBitrate("192k");
  command.audioFrequency(48000);
  command.audioChannels(2);

  if (isH264Input) {
    command.videoCodec("copy");
    command.outputOptions("-bsf:v h264_mp4toannexb");
  } else {
    command.videoCodec("libx264");
    
    const outputOptionsList = [
      "-preset ultrafast",
      "-tune zerolatency",
      "-b:v 4500k",
      "-maxrate 4500k",
      "-bufsize 9000k",
      "-g 60",
      "-r 30",
      "-pix_fmt yuv420p",
    ];

    const platformStr = (options.platform || "").toLowerCase();
    
    if (platformStr.includes("instagram") || platformStr.includes("tiktok") || platformStr.includes("custom_vertical")) {
      // Individually resize for vertical platforms (9:16)
      // We scale the width to 1080 (maintaining aspect ratio), then pad the height to 1920 with black bars.
      // This ensures the FULL video is visible on Instagram without getting its sides cropped off.
      outputOptionsList.push("-vf scale=1080:-1,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black");
    } else {
      // Standard 16:9 scaling for YouTube, Twitch, etc.
      outputOptionsList.push("-vf scale=1920:-1");
    }

    command.outputOptions(outputOptionsList);
  }

  command.outputOptions(["-f flv"]);
  command.output(fullUrl);

  command.on("start", (cmd) => {
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
    onEnd();
  });

  return command;
};

// --- HELPER: CONVERT TO MP4 (FIXES DURATION) ---
const convertToMp4 = (inputPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const outputPath = inputPath.replace(".webm", ".mp4");

    ffmpeg(inputPath)
      .outputOptions([
        "-c:v copy", // Copy video stream (Fast, no re-encoding)
        "-c:a aac", // Ensure audio is AAC (Standard for MP4)
        "-strict experimental",
        "-movflags +faststart", // Move metadata to beginning for fast playback
      ])
      .save(outputPath)
      .on("end", () => {
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
              console.error(`Stdin Error (ipc) for :`, err.code)
            );
          }
        } else { console.warn('[Main] Dropping chunk for stream ' + id + ': stdin not writable or proc killed'); }
      } else { console.warn('[Main] Dropping chunk for stream ' + id + ': ffmpegProc not yet available'); }
    });
  });

  ipcMain.on("stream:stop", (event, config) => {
    const id = config?.id;

    if (id) {
      const command = ffmpegCommands.get(id);
      if (command) {
        try {
          command.kill("SIGKILL");
        } catch (e) { }
        ffmpegCommands.delete(id);
        event.sender.send("stream:status", { id, status: "stopped" });
      }
    } else {
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
          ipcMain.removeHandler("auth:google-oauth-cancel");
        };

        ipcMain.handleOnce("auth:google-oauth-cancel", () => {
          console.log("[Auth] Cancelled by frontend");
          tryResolve(null);
        });

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
          const redirectUri = "http://localhost:3456";

          // 1. Try to create a loopback HTTP server on port 3456 to capture the redirect
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
              // GET request â€” Google redirects here with tokens in the fragment (#id_token=...).
              // Fragments are NOT sent to the server, so serve a page that reads and POSTs them.
              res.writeHead(200, { "Content-Type": "text/html" });
              res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GAKI - Authentication</title>
  <style>
    body {
      margin: 0; padding: 0; background-color: #000000; color: #ffffff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100vh; text-align: center;
    }
    .container {
      max-width: 400px; padding: 40px;
      animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .logo {
      font-size: 36px; font-weight: 800; letter-spacing: -1.5px;
      margin-bottom: 4px;
    }
    .subtitle {
      font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
      color: rgba(255,255,255,0.4); margin-bottom: 48px;
    }
    h1 { font-size: 20px; margin: 0 0 12px 0; font-weight: 400; color: #ffffff; }
    p { color: rgba(255, 255, 255, 0.5); font-size: 14px; line-height: 1.6; margin: 0; }
    .spinner {
      width: 24px; height: 24px; border: 2px solid rgba(255,255,255,0.1);
      border-radius: 50%; border-top-color: #fff; animation: spin 1s linear infinite; margin: 0 auto 32px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .success-icon {
      width: 48px; height: 48px; background: rgba(255, 255, 255, 0.05); color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      margin: 0 auto 32px auto; font-size: 20px; font-weight: 300;
    }
    .btn {
      background: white; color: black; border: none; padding: 12px 32px; margin-top: 32px;
      border-radius: 999px; font-weight: 500; font-size: 14px; cursor: pointer; transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container" id="content">
    <img src="data:image/png;base64,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" class="logo-img" alt="GAKI" />
    <div class="subtitle">House of Video Creation</div>
    <div class="spinner"></div>
    <h1>Authenticating</h1>
    <p>Securely signing you in...</p>
  </div>
  <script>
    var content = document.getElementById('content');
    function showSuccess() {
      content.innerHTML = '<img src="data:image/png;base64,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" class="logo-img" alt="GAKI" /><div class="subtitle">House of Video Creation</div><div class="success-icon">âœ“</div><h1>Signed In Successfully</h1><p>You may now return to the application.</p><button class="btn" onclick="window.location.href=\\'gaki://auth-complete\\'">Return to App</button>';
      setTimeout(function() {
        window.location.href = "gaki://auth-complete";
      }, 300);
    }
    function showError() {
      content.innerHTML = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH8AAABuCAYAAAAON8wtAAAQAElEQVR4AexdCXwURdav7p7ungmXCipnuBJyQhIO72sBRbyV+3Z11+NTVlcR8cRd1hPkdBEvRBAJp4or6u567nrsroQESCbnJBASEm5yzPTd33uTmTBXQibpHgjJ/Pqlq15VvXpV/1dVr6p7JjRp/7TZHmgHv81CT0g7+O3gt+EeaMNNbx/57eC34R5ow01vH/nt4LfhHmjDTW9o5LfhLmk7TW8Hv+1gHdTSdvCDuqTtMAwHf15JdtrzxfYxf9pXcOtfSgvvfLm0aNzLBxwTFpYVTl5YWjR1UXnRtCXlJdOWljumIy2B8KKyoimvlxVPeg3yvVRadBeWW7C/8A4kDCPv5QMFE14rK5y0sKx48iLIj/fXoMzCA46JWA7reAXC7rgn38LyoqlLyovq61pW7pjhS0sPOmYuO1g8a/nB4ruRVpQV/xbprxB/A/iYvrTcMX1xedFUrM8tG3T01vWapx5Mx3qWQFuQMO4lL38pyMG6USbWifWsrCj53arK/Q+8e7D04Q8qSh9Ze/jAHz306OpDZQ+/DWlLoY3POHL6mmGShoOfxHd+r6OF/VIj+nZZ07YJmrpFUJVNNYq2oUZT11fL6ocnZOnD47KyDgnD1Yr6UZUip9dCPlFTt2I5Rdc+RsIw8gRV31SraOk1irwB8+O9FsrUqMpGLId1uCDsjnvy1cjq+hOyWl/XMVlZ60vHJeWDY5K85qgkv490RJFXIx2C+GHgYzrqeFJW12N9btmgo7curz6YjvVgW5Aw7iUvH+Vg3SgT68R6KkXpnYOC8Gap5FrhEF1Li5zOxR5ass9Vu6IM0nRC0uM6dF591oP/Vnl5FENTsVm1NeQ/1SfayYA+2OOsJgxFJZ/14KOCNEWxeG8n43rAQtFRxkk7JcnwaZ+hKP6UeEIoiqojQghFyGmJhvykgU9Tyrf2PKHaD21iGuiSFrHDBb/Ryu7v2dMZmMFK0aQ7y5MeLC9cxHInfOlCjjt+Icsd6wbUlWWPdGPZo90sLOGgjK8cFgziApYlPTkr6cPbSL0Mjjt5McdVAVV35/iavlYbaY2E+gNVXcxy1dh+C7TXt/0QBfx9OcaEaWPENCwFgTsuS4tXx6XYPohLPd+X1g5KvWBtXGrXdUAfxqVduC4urdsJSU2BjjjGU6dU01A8eD4dGabCKUmx9TIGpZ63ZlBqF6DO7w9K6bQqZjDVGgn1B+qyJi618yHZdXsUzWCL64mlaGt9xMDAqR42UGigKJWQEtLEz/bBw3YfFtVRfaw2kafr1FN1nVRpKhF1vftFUbanmiiqVWZTCJsZOPOZ1ZC63jVLulcupXf2Bpty/yQ5LbNSEn/Tn4/SvTOAomnkgCQQp6rd8/T+vB1NkdMa81hU3RYpvSMCPq1THcNt0OaEoT9XKPK1/a1RmncG8BoA7JPHzt+X/49wZbaK/LTq5zCbqXNEwLdQVLOsOT0u5V8Vknh1Pz5KDTSASlkavWB//r/M7JwzIZvRScS2yhEBn2XoZoGPnZ+ekPZTuSJd0ZePkgMNoEySroLj418w37lCCs34e3smNiwi4FtaaM2b41L/WyY4r+7H2YKWgH2i89KXSgt/IrpuynbIxL4PKZpW1YhggpUbVRHKapBoirI0mNjEhK1Jw/9TKglX9uVsAUuASPaLrssXHCj8romizupsOkVFzIgjBL4xr4hvSxz2S5noujKasyl+S4AokDJRuOaF0oKvz2pkzzLlIgI+RYyzZpwBDsrStWAAp3wAXScHwAAqRGFkazcAiobDDeqUlejQNklThVMc40IRAR/U9WkOxFp4bQEn8LAs3QDnAKR+BoBOOiCJxG0A+1vvNhCc40Q4zPTvoSCGf3JzY4aDr2q6FKgMIA9XILdlcdgFfFcuSyP78Ta93gDwIAhnAEkcPX9f7lctqyHypSfk7hw5kLMtrFXVwMpNgd9w8AO1NjO+KT7120OyMLov77MLwBkADKBSlm94YV/+P82s30jZUxB4a4evHIKziwBH2b6yTUEeKjAefIqYpSuoG3xtiB/2TYUk3DTAGuW/BIABVMjiKDCAs/4kEIHvzUV9nuussYi6FtxIkzjGg2+Soo2J3ZQw7Kty0XUrHAWHMoDRz5XkfdFY+TOZNs2eeUMfPuqLAsFpFWDZakAXUwaU2eA30Bbj2RsThv2tUpRvCzUDHFakG587Cx8GuYG3WT/Pc9ZygVO98T0ULNEM8E2x0mDVgzkbElI+qxBdoQ1AksaeTTPADHvmmN48v8Nee2qqR6/YTT47Y4qiYKNMBTfWAI4Z4AepBdYAVxDbFMaGhGGfVcrizf15n12AxwnEGWD+/vwzvguYmbd7bE8APtdVy3jXeIS3i4Ul0VYb4QHwgM7B5ABWy6OGgx8KZZ1E0IuBPvkoLm1HuSSMBQMI8gEOydINL+zP/xKynZFrev6um3uy7Oe5Qi3tBzxjIT04znFYFP5kC3iTxxTkofWGgw8yg/DXAX3gR/RCJ7BMFkbBNtDvJLBUcJFKWRrz3L78v0VUIahsWn7mLb0s1s/sQi0lepw7BLYLAN/Vwu08TknDJJ3sYAhyoYDJlxngh1A5siPfq8Bm2AYekOUx8DTw1EEQWCIawBFFuvnpfbmfePOafZ+Wl3lnH9b6GYx4f+AtFnI+y/7y19jk4Wv6p53QaKYyUJeg0RSYoZnxiICvEUprpn4tLrYNDoLKZOdIeBp46nGwxwCOK8rtc0vsm1pcyWkETM/PGNeHt26zu2qI34gH4LtZ2F/fHJh8hVcEI8t+mODZPpI33ci7X0VGCvaVRZmlvW8ljYS3JIz47qAo3BzN2wgLz00wq+IxgGpFmTCnOGcj8syg6Xm77ujFRm2xO4OB787y2W/EDB5BKKp+cMuE5szQI5RMM8APWrB0Gnrav/bIxzqL30ualmnx8aTdBgAngXCWPnGOw/gZYEZB1q29eNvH4NUHjfhenDXvaI1yaWBH0BTVesEPQh5ap2s+PQ7xM3F1cnV8lRA9VfY4Wl4d6g1AUybMNXAGmJWfNa6nhd+e66wF4Ose1GDfdIGpPtpqLXQyyuXrUlJqvXp47xRRWi/43kb43s2YXnzlny48uzB7LUdTs8vgkS+CjfkRCCQMI68UZoBqVZ04t9i+AXktoZl5mZO6s9wWu7M6CHhY+4uO1uqXvtl3yPFQdWh6636B09unodoWcd7jhTkbZaLNwJc9EGRUgIaJqCNsry5kOcJBGHmY5jGAyXOLc9OR1xxyA8/x6bjGS57VDjsER3xvzlpwmIjD30tKOtaQbJ2BqSE4sd4nCE5qPicig/JMufpPOHI+qSXqxEDgEXSnojxRKQp3XMzyVf4G4CLVqjxpbklu2LuAGbm7JnTnrOk41QcBz1oLDqpV7u1cY3BRmsY0lm5kmvHg6wQN3U9H6gw4fE+V5H1Wram3hwL+hCI/9PngSxZ9NeSyT48q4rieHC9ynu8G1s8AijzhyZK8rX4NaSQyPTdzYg/OuikPvHpJrzN37AjPiC88LuiXrY+9rKoREe4khqKwmDuMfyiKIhRFYdBwMhx8miJBlqtrtE4i+JnnsH96XJFuCQV8lSw/8Wni8JVedbYljvjnYVmaDGsxYT2d7DWAKkW66+kS+zZv3obuU3J23dGD4zfmucC5CwC+B4z4Wka5pLGp3leuTqmhkA7F8y3WrLDh4FMUFQS+qnt6pFkqhlfoCUf2lhOqclsg8HCYQmo05dmPk4YvCpS4NXH4J0ck+fehDOC4otzZ2EHQJPvOW3rw/Ob8IOBZ0guBJ84Rbzbg3AXqgXFKZyI2UAwHHxsQSDCjNrVBgUXDis8B4KtVbdwBSSA4erEwTVEEga/VlPlb44e9iLxQtDEx7d2TsjynN28NmgGq4SDo8WJ70O/iTM3ZdVNv3vZpkeisfwMHh2gXeDrXm+MLJI0d/vbA4SdD1dcQT6cD3uFqKKMB/IiAr8PHAF0bFTHHYd9c0xjwCcP/3KgASFyfMPT1akV+Hn8EwkIQRuI2ItwFOFXlt7OLsuuXiylwctfDyv+tUHDS/ke2LOnNcYVOpzZ0RWzsadd4qNb/0ijVn0E8mhDDPxEB33CtAwQ+VpTzUY2qjA854lX52a1NAN4r8sP4oQsA6Bd7wgzgPQ3EWQQNQNG1Bx8u3JM+K3/XnJ4s/zEAT/kDbyG9eb6ollEvWZmcXOOVGc5dp+kg8KF8nSVCwMir1YP/x4Ls9U5NnRIK+JOqMm9r4ogGp/qGOnJdfNqzLlV7sQfLk0ADOKmpkywUsxCAhwMcX68e1ngEnlbCWuMDddB0rU6ob4Ip0BMSEfApQkxZ8x8ryP7QRbSpoYA/oUqPglf/qm8fhhNeF5/yrFPTXuvO8eAD1HWTAoc2hyUJvxoWAniu6ISTXPJmGM5dKH0YLQT4oTIawKtrlQGCGhMByAP+jeUIP+2PRdnrnESb5gs8VoLO3VFJvnd74iXLwpfqX2J9fOqTTlV5tRvLEth/+ydCDOtD564nyxVVS67Lmrqdg6INXopuge46layDwSGd4hgXigj4xqlbJ2l2Yfb7Lk2bXiq63A5ZHZcQK82QE7L83ueDRwR55t484d6dLuoVTdN/9J4Cest7gYcj20KnrlzxdtzwI940o+9sa/5BJiO/dvwHmOplXbsbgQ/2jHTSnbeOnrTn14FGAcBZtUsvYNlLfRfiU8DzBTWadOWqmJRDRtVnoRQUb5S4RuVEZORTWot3K+5GPApevUzp00IDTwjMBgRO6/p2s1l/vjMnq8U/WXpHdsbYCyzshiLRZfH36nE7xxc6Ke0aI4HHRqq0520TjJhMkQGfajn4uJ0TdW3KfsFJvCMeD3BwLcZGUJ6OcsEZSZkkXBgXxe+Zbt9V/3qUJ7nJtzuzd97Ym+e2HJSl8yWPD4Z14Brfm+MLj1Da1Sv7J1c0WWATM9LUOQY+TeCYrYmND5UNR7wrBPDo3HW1WHbG2TqI+LozgoPl8WtP+GStl83248z8jNHIC4cmAPB9eP7jUkmIChzxvTzArzEBeNRRa80/ywLOkYSN8CWK1ry4+LKbFH7MkZMu6GrQiO8Gz+LhYOf5tXFpwytVZ2I0byvzNwCV5MITtosttn9My8sY26TKINPEnP/d1Mtm/bREEqyBwPfhOEe1QK4xC3ioHncVze4rLB8O0eFkbkpev32KtwAcW3mD4dxxqnfCoQq+au071SPwtar6522JwxegvI8GjXBUKs7R/ay2Cl8DQPDyXDWkO2vdMdW+8y7M2xhNyPn15l7WDp86BBcXYqovrpbla95OTDzYmIyWpmkU1XrBb2njveVnO/Z+4IQRf0AU/NZ4BB5AXbg1Yeh8b168b4gbnntYkK+PiYo64msAEuyT8TSuO2/bOjV31wTMG4rGZ2eM6mON2l4kOC2BwEdzfEmNLF29Ki61LFTZ1sozfOQTKvg0L9xXt2cX7n1f1vSZOOLxVA07F507BF7WlGUb49PmIi+QEJqGwQAADB9JREFU1iWm7D0kCdfH2qKO+hoAGAsphEeuF7H8plAGMN7+v+t6WvnPwEhoKcC568db9x1T5YgBT5t1ohPYWRA3HnwQGnjBTk8L5DUUf7Bw7zsy0e8ONeJlXV+xIX7Yow2VRf6aQWmZhxTphgRbB6evAeAM4ICdwoUst8l3CZiQ9+tVPdmoHSWiy+YLfGfGQnDEH1Gkq96NTTmAss8UyZommFF3hMDX5KYo/0DBnpU60X+HwAeOeEnTl2+IS/1DgJyQ0fdjUzLKFfFq2AVU+RuARtAAunLWrVPsGbPHoXNnifq6RAoBPM87qjT50kgDr7bykR/k88maLoZEyYeJwMOS8WAo4AVVW5Ien/qIT/bTBtEAKiXlmjhb1DFfA4DZg5QILsLSzPLzWP5zh+j0c+5wxPfkuLxKkb7E6AOc0yoNGRpYIoP6FLK2+IrIyFd1Peg/cPhq/lDh3rcgHhJ4UVUXb0pIewzSw75WxyVnHZSFUQOt/k6grGvkkCy6n85JPms8An8Ry+05TsuXrU1IOBp2hQYUoCz+D3ZQpCnIg2AzwA/aqohEb/DFhgcLs99UiX6f79M5r3MnaOqrGxOGPg56NvtCH+Co7BodzdnKfWeAQIGdLRbS2cL8p0IgV+C3ZQPTIxWHgRIK61C8FqtkBvhBSmlEqw5iAuP+/N3LdV17IHCq72phiaAqizbFD50H2Vp8rY4bmnVYVm7sw1tLQxmABbbWFzDs8SoiT9vczDdwWqykRwBsloKABgZcngwG3owHX4eVO0BBTQ0e+b8ryFpEUdTsAwEvWyLwoqYu2pQw7IkAMS2Krk8YsqdCVG6K5nm/k0CvUJhtzuN1S4I33hbuxoMfotc0mvLbqszKzVzAUszjBwKAx7N6M4D3qrQRzgEOS9rYvrzV7yQQdxb7RYHqRLOf3JWz805v/rPorpuhS0TAZwgcs3m0hydtL0RZLM+W+ryIAaPO/Xq1oGmvGz3iPdXW33AGOKyINw6wRh3yXQLQCdwvOhl4cLNtQs7OSfUFIhzQCRXkM5mlQkTApyiawQbMzNv1YkeLZX4Q8PCQxqVp4NUPnYP5DKBGRXyIPoAo3zQw4CRQBhuFwx7SnePTJ+VkTG5UiEmJDfyzBVMMIiLgR1HMbZPtu97qwLBPh5zqVXXx5hZ69eFi8UHCkJ2HFekWOAeo9p8BdOI2AJ7fMCV35/Rw5bY0Pw2fQBmAPFyB3JbHDQefoQN+WQLUhr3zRI6i7gsa8eDVy7q6rKXbueZ2w5rYlF8qJfGmUAZQDMvSRaxt3YzcrHubK7855VTqHHqZQ4RDlCOKTI4CoWOFHeJd4xVN/+vpzuoxv5m0Oi7134dk+ZYhUZ3UKIYhYKvu6vDwp1hwkq4s+24kDYChQn5R062T0X8MH/mBCiL41apCVM/DPi/wcJix8qOEtIcD85+J+HuDhvxwUBJGJtk6yTZfA4CTQIdQS7px7Lt352XOiIRuDbzs6rVJQ1UwHXxfbb3AKzpZtT4+7SHftDMdfgsMoEKRxgyxddT8DUAnRfA4+AKWWzvdnjHuTOhpCvLQkIiB7wVe1fR3PopPfRDqPuuut2OSv61QlOuH2AKWANgFFMEScBFv3TLFnnWrmYo38GDHFPwjAr4XeEnVVq1PSLvPzM5rqexVMUnfHFKk62EJUHx9AFy+0AB68uz2qfadY1paT0PlNZ0OevcB+o9pKH9L+KaDT1EUuQC8eqeuvJqeOPRMj/gm9dVKmAEOKfKYwVGdSKABFLicpAdv+3JydsaoJgkLN5Oqel9XrC/JUBRbHzEwYDr4sMUjsq7t2BI/3JCHNAa2vVFROANUyK5RgQYggRNYAD5ALyv/j+n2Xdc1KqQZiToT8ivazZB0+iKmg89TNHGq6o+nV+Xsy7EqJuWbSkm4LhmcQN8ZQNJ1Uii6qB689dvpeVlXG6k5o2lB076R8n1lmQ4+Vqbpwb/Tg/zWQG/GDvm+TBSuS7J19DsHQB8gH7aB8Czgh5kFGZcb1RZFD36ZwyjZgXIiAj5DtIj9pGhgA42IvxuX8q8ySRyZaOso+84AaADuL4awth9m5GcF/Y5uc+qmLTCtNKdgM8pEBHyKoi3N0O2sKoIHQRWyeD36ADaaJt69l4g+gNNp6WHhfpyal3lJS5VuYKvXUrEhy9MhuQYzaaq+rwyWHFlx78ASUCoK1w7p0Jn4GoCgqQSWAKYnx/0A28BhLdEKTkL1lpQPp2xEwCeUHrR9CUfJsykvzgDlgvPqwUEGoJFCl5PvY436eWr+rtTm6sxozLnl8MEDnNO+ut3czjKoXFhi3oaHQeWyeGVyVCfVfwbQYAZwshdb+O8n5WWkhCXUk1kFd98TNP0WkZGv6fo5BT6i8k7M4J8OKtI1CVGdZF8DcMEZTYng6tyLtX43JXfnEMwbDlk09dwa+bru/w5fOJ1xNudFAzgiiaPjbR0FG83UOzb4AxEOwXleN9b61ZS8X+PDaYNCc036dlM4MhvKa/7Ipwihaf38hhRo7Xx8GnhQFu+Js3Wo/x9+2CYBzmpKRVf3Loz1i0lh/EQMo6sddc/jb5RjJpkOPr4U0d/acf5Ee8bm8faMNZPsGRtm5GV9cm/+7q8eKNjz3ezCvT89WpT938cdORlPOOxZc4vtu+eW2PcgzSvO2zuv2J79dHFuzlPFuXYkDCMf881x2DPnOHJ3zYGydXd7pluGA2QUA4GcJz0yvHKwvC+hTC8hH/Nh3XMd9iyU+Zgj53+PFGb//HDh3h8eKNj99b0Fu3fcDfpPz921eVpuRvrU3My1gqqOqVGVo1T92K+DTAADqJTEfl0s1L+n52bAA6HMDbNys7b/vmD33+8v2PPNAwV7vsU7xmflZX48Pmfnex1pZgWWq5Ng7l/Dwdfh46syNgTPwqtUZTx00KyTqjL5sCzeXiYJN5SIrmsLBOflua7aEdnOmrQ9zuohu2urB++uqU5Gyqw9mZRZW52YUVuVsKu2Kh4Jw8jHfHud1Sl7nVWpe6Fs3b06xS3DCTI8crI8MjJr6+RgeV9CmV5CPubDunc7q4egzBxnzfA8ofayQvDwS0RhJJz2jYX9/u1HFHn8UUWZdEyRZhxXlVnQjq443fu2HcPI2y8JXY4oyq3HVGlypSLeCtvF6/eJrt9A+6/DO8YrZemOGk29p0pTr6qFrSOWNZsMB18j5Jxz7swG4XTyZa2VfEUbpvkTFKxZaFXtREhL+4ACy9CIrsDN8At1M1SoRukFseD8JHXoRM4BOuNt6MfbCCydxYaC5BFmOPiVovxYF4tldlcL99R5Fsu8LhbmyU6M5fEONPOIlaEfstL0/SxF/95CqHsshNxN6fpMnSLTdKJP0XVtEuxyxyuUfpekq7cLmn6LS9VuElVtrKArYyB+vahpo4E3SlTVkS5F+Q2SQOTrkDDsJlUbhXmxDJYVNf1mQVdvk4l+p6wp4ySNjFd1bSIcpU5214v169QM1MVLNMYpajosY1MxD+ZVdG0SlpN1dQLqKWtkHMpzh4GH6ZjX3R4sD+1jKOpeC03fZ2WYB63YfoqejX0Bjt2jHRnLY50Zdk5nCzMX++p81vJMV4Z9rhvDPn8Bwz57HvAJRT10RJT+j5jwMRz8J6MH/vporwFvzOsz8JVn+sS++myfQa89Hx27+IW+g5YviI5buaBv3Nsv9Yt79+X+8e+/3D/hg9cGJK5b1C/ho0X9E9MXDUjatHhgwtYl/RI/XjYgefuKgYmfvxGT9MXymKQvVwwY/HeI/3P5wKSvgffN8pjkb9+IHfwd0or+Q75HwrCbYpK+wbxYBssuH5i4Y8WA5M+W9k/8ZOnAwduWQR2LByRtXtw/caO7Xqx/QPyHqIuXXsV4v/j1r/dP2LCof2I65l0yAPQbkLR56YDkLajn0oEJ21CeOww8TMe87vZgeWjfK/3iV7/cN+6dBdGDVi3A9veLewP7Yn7fQcvmR8cueS465vXn+gxaiH31dO/Yl+ZFx/zlyeiYBU9Fx7z4DPCh71bO6Tvw3yZg716SzJDbLrMV9IDhI78VtLldRU8PtIPv6Yi2eGsHvy2i7mlzO/iejmiLt3bwm4f6OVGqHfxzAsbmNaId/Ob12zlRqh38cwLG5jWiHfzm9ds5Uaod/HMCxuY14v8BAAD//9bzxKQAAAAGSURBVAMAzoemvhAOeroAAAAASUVORK5CYII=" class="logo-img" alt="GAKI" /><div class="subtitle">House of Video Creation</div><h1>Authentication Failed</h1><p>Something went wrong. Please close this window and try again.</p>';
    }
    var h = location.hash.substring(1);
    if (h) {
      fetch(location.origin, { method: "POST", body: h })
        .then(function() { showSuccess(); })
        .catch(function() { showError(); });
    } else {
      showError();
    }
  </script>
</body>
</html>`);
            }
          });

          try {
            await new Promise<void>((listenResolve, listenReject) => {
              loopbackServer!.on("error", listenReject);
              loopbackServer!.listen(3456, "127.0.0.1", () => {
                loopbackServer!.removeAllListeners("error");
                listenResolve();
              });
            });
            usingLoopbackServer = true;
            console.log("[Auth] Loopback server listening on port 3456");
          } catch (portErr) {
            // Port 3456 is unavailable â€” fall back to fragment extraction via BrowserWindow
            console.warn("[Auth] Port 3456 unavailable, using fragment extraction fallback");
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

          // Safety timeout â€” 5 minutes
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

ipcMain.handle("get-app-window-id", () => {
  if (mainWindow) {
    return mainWindow.getMediaSourceId();
  }
  return null;
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
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
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
});
