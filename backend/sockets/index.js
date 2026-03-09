const jwt = require("jsonwebtoken");
const db = require("../db");

module.exports = (io, connectedUsers) => {
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

    // Unirse a sala
    socket.on("join-room", (roomId) => {
      socket.join(roomId.toString());
      console.log("Usuario", socket.userId, "se unió a sala", roomId);
    });

    // Enviar mensaje
    socket.on("send-message", async ({ roomId, type, content }) => {
      try {
        const result = await db.query(
          "INSERT INTO messages (room_id, sender_id, type, content) VALUES (?, ?, ?, ?)",
          [roomId, socket.userId, type, content]
        );

        const [user] = await db.query("SELECT name FROM users WHERE id=?", [socket.userId]);

        const messageData = {
          id: result.insertId,
          room_id: roomId,
          sender_id: socket.userId,
          sender_name: user?.[0]?.name || "Usuario",
          type,
          content,
          created_at: new Date()
        };

        io.to(roomId.toString()).emit("receive-message", messageData);
      } catch (err) {
        console.error("ERROR SOCKET MESSAGE:", err);
      }
    });

    // Llamadas simple-peer
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

    socket.on("disconnect", () => {
      connectedUsers.delete(socket.userId);
      console.log("Usuario desconectado:", socket.userId);
    });
  });
};