// index.js
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
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Helper function to build the Tee Muxer payload
// Fixes: Adds 'onfail=ignore' so one disconnect doesn't crash others
// Fixes: Ensures correct slash handling between URL and Key
const buildTeePayload = (targets) => {
  return targets
    .map((t) => {
      // Ensure there is exactly one slash between URL and Key
      const sep = t.url.endsWith("/") ? "" : "/";
      const fullUrl = t.key ? `${t.url}${sep}${t.key}` : t.url;

      // [f=flv] forces FLV format
      // :onfail=ignore prevents the stream from stopping if one target fails
      return `[f=flv:onfail=ignore]${fullUrl}`;
    })
    .join("|");
};

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  let ffmpegProcess = null;

  socket.on("start-stream", (data) => {
    // 1. Normalize Input: Handle both old (single) and new (array) formats
    let targets = [];
    if (data.targets && Array.isArray(data.targets)) {
      targets = data.targets;
    } else if (data.rtmpUrl) {
      targets = [{ url: data.rtmpUrl, key: data.key }];
    }

    if (targets.length === 0) {
      console.error("No targets provided");
      socket.emit("stream-status", "error: No targets provided");
      return;
    }

    console.log(`Starting stream with ${targets.length} targets`);

    // 2. Initialize FFmpeg with Input Options
    ffmpegProcess = ffmpeg({ source: "pipe:0" })
      .inputOptions(["-analyzeduration 100000", "-probesize 100000"])
      .inputFormat("webm") // Browser sends WebM
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-preset veryfast", // 'ultrafast' if CPU is struggling
        "-tune zerolatency",
        "-b:v 4500k",
        "-maxrate 4500k",
        "-bufsize 9000k",
        "-g 60", // Keyframe interval 2s
        "-r 30",
        "-vf scale=1920:-1",
        "-pix_fmt yuv420p",
        "-map 0:v",
        "-map 0:a",
      ]);

    // 3. Configure Output (Single vs Multi-Target)
    if (targets.length > 1) {
      const teePayload = buildTeePayload(targets);
      console.log("Tee Payload:", teePayload);

      ffmpegProcess
        .outputOptions(["-flags +global_header"]) // Required for tee muxer
        .format("tee")
        .output(teePayload);
    } else {
      // Single target fallback (standard FLV)
      const t = targets[0];
      const sep = t.url.endsWith("/") ? "" : "/";
      const fullUrl = t.key ? `${t.url}${sep}${t.key}` : t.url;

      console.log("Single Target URL:", fullUrl);
      ffmpegProcess.format("flv").output(fullUrl);
    }

    // 4. Event Handlers
    ffmpegProcess
      .on("start", (cmd) => {
        console.log("FFmpeg command:", cmd);
        socket.emit("ffmpeg-ready");
        socket.emit("stream-status", "started");
      })
      .on("error", (err, stdout, stderr) => {
        // Ignore the error if it was caused by us manually killing the process
        if (err.message.includes("SIGKILL")) return;

        console.error("FFmpeg error:", err.message);
        if (stderr) console.error("FFmpeg stderr:", stderr);

        socket.emit("stream-status", `error: ${err.message}`);
      })
      .on("end", () => {
        console.log("FFmpeg process ended");
        socket.emit("stream-status", "stopped");
      });

    // 5. Run
    ffmpegProcess.run();
  });

  socket.on("binary-stream", (data) => {
    if (
      ffmpegProcess &&
      ffmpegProcess.ffmpegProc &&
      !ffmpegProcess.ffmpegProc.stdin.destroyed
    ) {
      try {
        ffmpegProcess.ffmpegProc.stdin.write(data);
      } catch (err) {
        console.error("Write error:", err);
      }
    }
  });

  socket.on("stop-stream", () => {
    if (ffmpegProcess) {
      console.log("Stopping stream manually");
      ffmpegProcess.kill("SIGKILL");
      ffmpegProcess = null;
      socket.emit("stream-status", "stopped");
    }
  });

  socket.on("disconnect", () => {
    if (ffmpegProcess) {
      ffmpegProcess.kill("SIGKILL");
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Web Streaming Engine running on port ${PORT}`);
});
