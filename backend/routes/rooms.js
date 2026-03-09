const express = require("express");
const router = express.Router();
const db = require("../db");
const query = require("../helpers/query");
const verifyToken = require("../middleware/verifyToken");

// Crear sala
router.post("/rooms", verifyToken, async (req, res) => {
  const { name, type, userIds } = req.body;
  const createdBy = req.userId;

  if (!name || !type || !userIds || !Array.isArray(userIds))
    return res.status(400).json({ message: "Datos incompletos" });

  try {
    const roomResult = await query(
      "INSERT INTO rooms (name, type, created_by) VALUES (?, ?, ?)",
      [name, type, createdBy]
    );

    const roomId = roomResult.insertId;

    for (const userId of userIds) {
      await query("INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)", [roomId, userId]);
    }

    res.json({ success: true, roomId });

  } catch (err) {
    console.error("ERROR DB CREATE ROOM:", err);
    res.status(500).json({ message: "Error creando sala" });
  }
});

// Traer mensajes de sala
router.get("/rooms/:roomId/messages", verifyToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.userId;

  try {
    // Verificar que el usuario pertenece a la sala
    const [participants] = await db.query(
      "SELECT * FROM room_participants WHERE room_id=? AND user_id=?",
      [roomId, userId]
    );

    if (participants.length === 0) return res.status(403).json({ error: "No autorizado" });

    // Traer mensajes
    const [messages] = await db.query(
      `SELECT messages.id, messages.room_id, messages.sender_id, messages.type, messages.content, messages.created_at,
              users.name as sender_name
       FROM messages
       JOIN users ON users.id = messages.sender_id
       WHERE room_id = ?
       ORDER BY created_at ASC`,
      [roomId]
    );

    res.json(messages);

  } catch (err) {
    console.error("ERROR DB GET ROOM MESSAGES:", err);
    res.status(500).json({ message: "Error obteniendo mensajes" });
  }
});

// Enviar mensaje a sala
router.post("/messages", verifyToken, async (req, res) => {
  const { roomId, type, content } = req.body;
  const senderId = req.userId;

  if (!roomId || !type || !content)
    return res.status(400).json({ message: "Datos incompletos" });

  try {
    const result = await query(
      "INSERT INTO messages (room_id, sender_id, type, content) VALUES (?, ?, ?, ?)",
      [roomId, senderId, type, content]
    );

    res.json({ success: true, messageId: result.insertId });

  } catch (err) {
    console.error("ERROR DB POST MESSAGE:", err);
    res.status(500).json({ message: "Error enviando mensaje" });
  }
});

module.exports = router;