import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Matchmaking queue - stores socket IDs waiting for a match
const matchmakingQueue = [];

// Active rooms - maps roomId to { user1, user2 }
const activeRooms = new Map();

// User to room mapping - maps socketId to roomId
const userRooms = new Map();

console.log("🚀 Omegle Signaling Server Starting...");

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // User requests to find a random stranger
  socket.on("request-match", () => {
    console.log(`🔍 ${socket.id} requesting match...`);

    // Check if user is already in queue or in a room
    if (matchmakingQueue.includes(socket.id)) {
      socket.emit("match-status", { status: "already-in-queue" });
      return;
    }

    if (userRooms.has(socket.id)) {
      socket.emit("match-status", { status: "already-connected" });
      return;
    }

    // If someone else is waiting, pair them up
    if (matchmakingQueue.length > 0) {
      const partnerId = matchmakingQueue.shift();
      const partnerSocket = io.sockets.sockets.get(partnerId);

      // Verify partner is still connected
      if (!partnerSocket) {
        // Partner disconnected, try matching with next in queue
        socket.emit("request-match");
        return;
      }

      // Create a unique room ID
      const roomId = `room-${socket.id}-${partnerId}`;

      // Join both users to the room
      socket.join(roomId);
      partnerSocket.join(roomId);

      // Store room information
      activeRooms.set(roomId, {
        user1: socket.id,
        user2: partnerId,
        createdAt: Date.now(),
      });
      userRooms.set(socket.id, roomId);
      userRooms.set(partnerId, roomId);

      console.log(`🎯 Match found! Room: ${roomId}`);
      console.log(`   User 1: ${socket.id}`);
      console.log(`   User 2: ${partnerId}`);

      // Notify both users they've been matched
      socket.emit("match-found", {
        roomId,
        partnerId,
        isInitiator: true, // This user will send the offer
      });

      partnerSocket.emit("match-found", {
        roomId,
        partnerId: socket.id,
        isInitiator: false, // This user will receive the offer
      });
    } else {
      // No one waiting, add to queue
      matchmakingQueue.push(socket.id);
      socket.emit("match-status", { status: "searching" });
      console.log(`⏳ ${socket.id} added to queue. Queue size: ${matchmakingQueue.length}`);
    }
  });

  // User cancels matchmaking search
  socket.on("cancel-match", () => {
    const index = matchmakingQueue.indexOf(socket.id);
    if (index > -1) {
      matchmakingQueue.splice(index, 1);
      socket.emit("match-status", { status: "cancelled" });
      console.log(`❌ ${socket.id} cancelled search. Queue size: ${matchmakingQueue.length}`);
    }
  });

  // WebRTC signaling: Forward offer to partner
  socket.on("webrtc-offer", ({ offer, roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const partnerId = room.user1 === socket.id ? room.user2 : room.user1;
    console.log(`📤 Forwarding offer from ${socket.id} to ${partnerId}`);

    socket.to(partnerId).emit("webrtc-offer", {
      offer,
      senderId: socket.id,
    });
  });

  // WebRTC signaling: Forward answer to partner
  socket.on("webrtc-answer", ({ answer, roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const partnerId = room.user1 === socket.id ? room.user2 : room.user1;
    console.log(`📥 Forwarding answer from ${socket.id} to ${partnerId}`);

    socket.to(partnerId).emit("webrtc-answer", {
      answer,
      senderId: socket.id,
    });
  });

  // WebRTC signaling: Forward ICE candidate to partner
  socket.on("ice-candidate", ({ candidate, roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      return; // Silently ignore if room doesn't exist (connection might be closing)
    }

    const partnerId = room.user1 === socket.id ? room.user2 : room.user1;

    socket.to(partnerId).emit("ice-candidate", {
      candidate,
      senderId: socket.id,
    });
  });

  // Text chat message relay
  socket.on("send-message", ({ message, roomId }) => {
    const room = activeRooms.get(roomId);
    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    const partnerId = room.user1 === socket.id ? room.user2 : room.user1;

    // Send message to partner
    socket.to(partnerId).emit("receive-message", {
      message,
      senderId: socket.id,
      timestamp: Date.now(),
    });

    console.log(`💬 Message from ${socket.id} to ${partnerId}: ${message.substring(0, 50)}...`);
  });

  // User wants to skip to next stranger
  socket.on("next-stranger", () => {
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      const room = activeRooms.get(roomId);
      if (room) {
        const partnerId = room.user1 === socket.id ? room.user2 : room.user1;
        const partnerSocket = io.sockets.sockets.get(partnerId);

        console.log(`⏭️  ${socket.id} clicked "Next"`);

        // Notify partner that user disconnected
        if (partnerSocket) {
          partnerSocket.emit("partner-disconnected", {
            reason: "next-clicked",
          });
          partnerSocket.leave(roomId);
          userRooms.delete(partnerId);
        }

        // Clean up room
        activeRooms.delete(roomId);
        socket.leave(roomId);
        userRooms.delete(socket.id);
      }
    }

    // Automatically re-enter matchmaking
    // Client will automatically request a new match
    // socket.emit("request-match");
  });

  // User disconnects or exits Omegle mode
  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);

    // Remove from queue if waiting
    const queueIndex = matchmakingQueue.indexOf(socket.id);
    if (queueIndex > -1) {
      matchmakingQueue.splice(queueIndex, 1);
      console.log(`   Removed from queue. Queue size: ${matchmakingQueue.length}`);
    }

    // Notify partner if in a room
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      const room = activeRooms.get(roomId);
      if (room) {
        const partnerId = room.user1 === socket.id ? room.user2 : room.user1;
        const partnerSocket = io.sockets.sockets.get(partnerId);

        if (partnerSocket) {
          partnerSocket.emit("partner-disconnected", {
            reason: "disconnected",
          });
          partnerSocket.leave(roomId);
          userRooms.delete(partnerId);
        }

        // Clean up room
        activeRooms.delete(roomId);
        userRooms.delete(socket.id);
      }
    }
  });

  // Handle explicit leave-room requests
  socket.on("leave-room", () => {
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      const room = activeRooms.get(roomId);
      if (room) {
        const partnerId = room.user1 === socket.id ? room.user2 : room.user1;
        const partnerSocket = io.sockets.sockets.get(partnerId);

        if (partnerSocket) {
          partnerSocket.emit("partner-disconnected", {
            reason: "left",
          });
          partnerSocket.leave(roomId);
          userRooms.delete(partnerId);
        }

        activeRooms.delete(roomId);
        socket.leave(roomId);
        userRooms.delete(socket.id);
      }
    }

    socket.emit("room-left");
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeRooms: activeRooms.size,
    queueSize: matchmakingQueue.length,
    connectedUsers: io.sockets.sockets.size,
  });
});

// Stats endpoint for monitoring
app.get("/stats", (req, res) => {
  const rooms = Array.from(activeRooms.entries()).map(([id, room]) => ({
    roomId: id,
    duration: Date.now() - room.createdAt,
  }));

  res.json({
    totalConnections: io.sockets.sockets.size,
    activeRooms: activeRooms.size,
    queueSize: matchmakingQueue.length,
    rooms,
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🎉 Omegle Signaling Server running on port ${PORT}`);
  console.log(`📊 Stats: http://localhost:${PORT}/stats`);
  console.log(`🏥 Health: http://localhost:${PORT}/health\n`);
});
