const jwt = require("jsonwebtoken");
const db = require("../db");

module.exports = (io, connectedUsers) => {
  // ← FUERA de io.on("connection") para que sea compartido entre todos los usuarios
  const voiceRooms = new Map(); // voiceRoomId -> Set de userIds

  io.on("connection", (socket) => {
    const token = socket.handshake.auth?.token;
    if (!token) return socket.disconnect();

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      connectedUsers.set(socket.userId, socket.id);
      socket.join(socket.userId.toString());
      console.log("Usuario conectado:", socket.userId);
    } catch (err) {
      console.log("❌ JWT inválido en socket:", err.message);
      return socket.disconnect();
    }

    // Unirse a sala de chat
    socket.on("join-room", (roomId) => {
      socket.join(roomId.toString());
      console.log("Usuario", socket.userId, "se unió a sala", roomId);
    });

    // Enviar mensaje
    socket.on("send-message", async ({ roomId, type, content, replyToId }) => {
      try {
        const [result] = await db.query(
          "INSERT INTO messages (room_id, sender_id, type, content, reply_to_id) VALUES (?, ?, ?, ?, ?)",
          [roomId, socket.userId, type, content, replyToId || null]
        );

        const [user] = await db.query("SELECT name FROM users WHERE id=?", [socket.userId]);

        const messageData = {
          id: result.insertId,
          room_id: roomId,
          sender_id: socket.userId,
          sender_name: user?.[0]?.name || "Usuario",
          type,
          content,
          reply_to_id: replyToId || null,
          created_at: new Date(),
          edited: 0,
          favorite: 0,
        };

        io.to(roomId.toString()).emit("receive-message", messageData);
      } catch (err) {
        console.error("ERROR SOCKET MESSAGE:", err);
      }
    });

    // Llamadas 1 a 1
    socket.on("call-user", async ({ toUserId, offer }) => {
      const targetSocketId = connectedUsers.get(toUserId);
      if (!targetSocketId) return;

      try {
        const [user] = await db.query("SELECT name FROM users WHERE id=?", [socket.userId]);
        io.to(targetSocketId).emit("incoming-call", {
          fromUserId: socket.userId,
          fromUserName: user?.[0]?.name || "Usuario",
          offer
        });
      } catch (err) {
        console.error("Error obteniendo nombre de usuario:", err);
      }
    });

    socket.on("call-accepted", ({ toUserId, answer }) => {
      const targetSocketId = connectedUsers.get(toUserId);
      if (!targetSocketId) return;
      io.to(targetSocketId).emit("call-accepted", { fromUserId: socket.userId, answer });
    });

    socket.on("call-declined", ({ toUserId }) => {
      const targetSocketId = connectedUsers.get(toUserId);
      if (targetSocketId) io.to(targetSocketId).emit("call-declined");
    });

    socket.on("call-ended", ({ toUserId }) => {
      const targetSocketId = connectedUsers.get(toUserId);
      if (targetSocketId) io.to(targetSocketId).emit("call-ended");
    });

    // ── Sala de voz grupal (mesh) ──────────────────────────────────────────

    socket.on("join-voice-room", async ({ voiceRoomId }) => {
      // Evitar doble entrada del mismo usuario
      const roomKey = `voice-${voiceRoomId}`;
      if (!voiceRooms.has(roomKey)) voiceRooms.set(roomKey, new Map()); // userId -> userName
      const room = voiceRooms.get(roomKey);

      if (room.has(socket.userId)) return; // ya está, ignorar duplicado

      const [user] = await db.query("SELECT name FROM users WHERE id=?", [socket.userId]);
      const userName = user?.[0]?.name || "Usuario";

      // Decirle al recién llegado quiénes ya están
      const existingUsers = Array.from(room.entries()).map(([uid, uname]) => ({
        userId: uid,
        userName: uname,
      }));
      socket.emit("voice-room-users", { users: existingUsers });

      // Avisar a los que ya están que llegó alguien nuevo
      room.forEach((_, existingUserId) => {
        const existingSocketId = connectedUsers.get(existingUserId);
        if (existingSocketId) {
          io.to(existingSocketId).emit("voice-user-joined", {
            userId: socket.userId,
            userName,
          });
        }
      });

      // Agregar al recién llegado
      room.set(socket.userId, userName);
      socket.join(roomKey);
      console.log(`Usuario ${socket.userId} (${userName}) entró a sala de voz ${voiceRoomId}`);
    });

    socket.on("voice-signal", ({ toUserId, signal }) => {
      const targetSocketId = connectedUsers.get(toUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("voice-signal", {
          fromUserId: socket.userId,
          signal,
        });
      }
    });

    socket.on("leave-voice-room", ({ voiceRoomId }) => {
      const roomKey = `voice-${voiceRoomId}`;
      const room = voiceRooms.get(roomKey);
      if (room) {
        room.delete(socket.userId);
        if (room.size === 0) voiceRooms.delete(roomKey);
      }
      socket.leave(roomKey);
      socket.to(roomKey).emit("voice-user-left", { userId: socket.userId });
      console.log(`Usuario ${socket.userId} salió de sala de voz ${voiceRoomId}`);
    });

    // ──────────────────────────────────────────────────────────────────────

    socket.on("disconnect", () => {
      // Limpiar de todas las salas de voz en las que estaba
      voiceRooms.forEach((room, roomKey) => {
        if (room.has(socket.userId)) {
          room.delete(socket.userId);
          socket.to(roomKey).emit("voice-user-left", { userId: socket.userId });
          if (room.size === 0) voiceRooms.delete(roomKey);
        }
      });

      connectedUsers.delete(socket.userId);
      console.log("Usuario desconectado:", socket.userId);
    });
  });
};