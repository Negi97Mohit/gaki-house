import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    const ffmpegProcesses = new Map(); // id -> { process, buffer, isReady }

    // Helper to get or create stream state
    const getStreamState = (id) => {
        if (!ffmpegProcesses.has(id)) {
            ffmpegProcesses.set(id, { process: null, buffer: [], isReady: false });
        }
        return ffmpegProcesses.get(id);
    };

    socket.on('start-stream', ({ id, rtmpUrl, key }) => {
        const streamUrl = `${rtmpUrl}/${key}`;
        console.log(`Starting stream [${id}] to: ${rtmpUrl} (hidden key)`);

        // Clean up existing if any
        const existing = ffmpegProcesses.get(id);
        if (existing && existing.process) {
            try { existing.process.kill('SIGKILL'); } catch (e) { }
        }

        // Reset state for this ID
        const state = { process: null, buffer: [], isReady: false };
        ffmpegProcesses.set(id, state);

        // Input options for receiving raw WebM from browser
        // The browser sends webm clusters via socket
        state.process = ffmpeg({ source: 'pipe:0' })
            .inputOptions([
                // '-re', // Do NOT use -re for live pipes
                '-analyzeduration 100000', // Reduce analysis time
                '-probesize 100000'
            ])
            .outputOptions([
                '-c:v libx264', // H.264 video codec
                '-preset ultrafast', // Low latency
                '-tune zerolatency',
                '-maxrate 2500k',
                '-bufsize 5000k',
                '-pix_fmt yuv420p',
                '-g 60', // Keyframe interval (approx 2s at 30fps)
                '-c:a aac', // AAC audio codec
                '-ar 44100',
                '-b:a 128k',
                '-f flv' // FLV format for RTMP
            ])
            .output(streamUrl)
            .on('start', (commandLine) => {
                console.log(`FFmpeg process [${id}] started:`, commandLine);
                socket.emit('stream-status', { id, status: 'started' });
                // Also emit ffmpeg-ready so frontend knows at least one is ready
                socket.emit('ffmpeg-ready', { id });
                state.isReady = true;

                // Flush buffer
                if (state.buffer.length > 0) {
                    console.log(`Flushing ${state.buffer.length} buffered chunks to [${id}]`);
                    state.buffer.forEach(data => {
                        if (state.process && state.process.ffmpegProc) {
                            try {
                                state.process.ffmpegProc.stdin.write(data);
                            } catch (e) { console.error(`Write error during flush [${id}]`, e); }
                        }
                    });
                    state.buffer = [];
                }
            })
            .on('error', (err, stdout, stderr) => {
                console.error(`FFmpeg error [${id}]:`, err.message);
                // console.error('FFmpeg stderr:', stderr);
                socket.emit('stream-status', { id, status: 'error', error: err.message });
                ffmpegProcesses.delete(id);
            })
            .on('end', () => {
                console.log(`FFmpeg process [${id}] ended`);
                socket.emit('stream-status', { id, status: 'ended' });
                ffmpegProcesses.delete(id);
            });

        // Start the process
        state.process.run();
    });

    socket.on('binary-stream', (data) => {
        // Broadcast to ALL active streams
        ffmpegProcesses.forEach((state, id) => {
            if (state.isReady && state.process && state.process.ffmpegProc && !state.process.ffmpegProc.stdin.destroyed) {
                try {
                    state.process.ffmpegProc.stdin.write(data);
                } catch (err) {
                    console.error(`Error writing to ffmpeg stdin [${id}]:`, err);
                }
            } else if (state.process) {
                // Buffer if stream is requested but not ready
                // Only buffer if process exists (meaning it's starting)
                // console.log(`Buffering chunk for [${id}], ffmpeg not ready`);
                state.buffer.push(data);
            }
        });
    });

    socket.on('stop-stream', ({ id } = {}) => {
        if (id) {
            const state = ffmpegProcesses.get(id);
            if (state && state.process) {
                console.log(`Stopping stream [${id}] manually`);
                state.process.kill('SIGKILL');
                ffmpegProcesses.delete(id);
                socket.emit('stream-status', { id, status: 'stopped' });
            }
        } else {
            // Stop ALL
            console.log('Stopping ALL streams manually');
            ffmpegProcesses.forEach((state, sId) => {
                if (state.process) state.process.kill('SIGKILL');
                socket.emit('stream-status', { id: sId, status: 'stopped' });
            });
            ffmpegProcesses.clear();
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        ffmpegProcesses.forEach((state) => {
            if (state.process) state.process.kill('SIGKILL');
        });
        ffmpegProcesses.clear();
    });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Streaming Server running on port ${PORT}`);
});
