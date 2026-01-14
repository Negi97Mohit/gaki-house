import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

ffmpeg.setFfmpegPath(ffmpegPath);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  const ffmpegProcesses = new Map();

  socket.on("start-stream", ({ id, rtmpUrl, key }) => {
    const streamUrl = `${rtmpUrl}/${key}`;
    console.log(`Starting stream [${id}]`);

    // Cleanup existing
    const existing = ffmpegProcesses.get(id);
    if (existing?.process) {
      try {
        existing.process.kill("SIGKILL");
      } catch (e) {}
    }

    const state = { process: null, buffer: [], isReady: false };
    ffmpegProcesses.set(id, state);

    state.process = ffmpeg({ source: "pipe:0" })
      .inputOptions(["-analyzeduration 100000", "-probesize 100000"])
      .outputOptions([
        "-c:v libx264",
        "-preset ultrafast",
        "-tune zerolatency",
        "-maxrate 2500k",
        "-bufsize 5000k",
        "-pix_fmt yuv420p",
        "-g 60",
        "-c:a aac",
        "-ar 44100",
        "-b:a 128k",
        "-f flv",
        // --- ROBUSTNESS FIX ---
        // Force output to 1920x1080.
        // "force_original_aspect_ratio=decrease" fits video inside 1080p.
        // "pad" fills the rest with black.
        // This ensures stream never breaks if window is resized.
        "-vf",
        "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2",
      ])
      .output(streamUrl)
      .on("start", (cmd) => {
        console.log(`FFmpeg started [${id}]`);
        socket.emit("stream-status", { id, status: "started" });
        state.isReady = true;
        if (state.buffer.length > 0) {
          state.buffer.forEach((d) => {
            try {
              state.process.ffmpegProc.stdin.write(d);
            } catch (e) {}
          });
          state.buffer = [];
        }
      })
      .on("error", (err) => {
        console.error(`FFmpeg error [${id}]:`, err.message);
        socket.emit("stream-status", {
          id,
          status: "error",
          error: err.message,
        });
        ffmpegProcesses.delete(id);
      })
      .on("end", () => {
        socket.emit("stream-status", { id, status: "ended" });
        ffmpegProcesses.delete(id);
      });

    state.process.run();
  });

  socket.on("binary-stream", (data) => {
    ffmpegProcesses.forEach((state) => {
      if (state.isReady && state.process?.ffmpegProc?.stdin?.writable) {
        try {
          state.process.ffmpegProc.stdin.write(data);
        } catch (e) {}
      } else if (state.process) {
        state.buffer.push(data);
      }
    });
  });

  socket.on("stop-stream", ({ id } = {}) => {
    if (id) {
      const state = ffmpegProcesses.get(id);
      if (state?.process) {
        state.process.kill("SIGKILL");
        ffmpegProcesses.delete(id);
        socket.emit("stream-status", { id, status: "stopped" });
      }
    } else {
      ffmpegProcesses.forEach((state) => state.process?.kill("SIGKILL"));
      ffmpegProcesses.clear();
    }
  });

  socket.on("disconnect", () => {
    ffmpegProcesses.forEach((state) => state.process?.kill("SIGKILL"));
    ffmpegProcesses.clear();
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Streaming Server running on port ${PORT}`);
});
