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

// Listar salas del usuario
router.get("/rooms", verifyToken, async (req, res) => {
  const userId = req.userId;
  try {
    const [rooms] = await db.query(
      `SELECT r.id, r.name
       FROM rooms r
       JOIN room_participants rp ON r.id = rp.room_id
       WHERE rp.user_id = ?`,
      [userId]
    );
    res.json(rooms);
  } catch (err) {
    console.error("ERROR GET USER ROOMS:", err);
    res.status(500).json({ message: "Error obteniendo salas" });
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
      `SELECT 
          m.id, 
          m.room_id, 
          m.sender_id, 
          m.type, 
          m.content, 
          m.created_at,
          u.name AS sender_name,
          CASE WHEN f.id IS NULL THEN 0 ELSE 1 END AS favorite
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      LEFT JOIN favorites f 
              ON f.message_id = m.id AND f.user_id = ?
      WHERE m.room_id = ?
      ORDER BY m.created_at ASC`,
      [userId, roomId]
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

// Traer participantes de una sala (excluyendo al usuario que consulta)
router.get("/rooms/:roomId/participants", verifyToken, async (req, res) => {
  const { roomId } = req.params;
  const userId = req.userId;
 
  try {
    // Verificar que el usuario pertenece a la sala
    const [access] = await db.query(
      "SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?",
      [roomId, userId]
    );
    if (access.length === 0) return res.status(403).json({ error: "No autorizado" });
 
    // Traer los otros participantes (no el que consulta)
    const [participants] = await db.query(
      `SELECT u.id, u.name
       FROM room_participants rp
       JOIN users u ON u.id = rp.user_id
       WHERE rp.room_id = ? AND rp.user_id != ?`,
      [roomId, userId]
    );
 
    res.json(participants);
 
  } catch (err) {
    console.error("ERROR GET PARTICIPANTS:", err);
    res.status(500).json({ message: "Error obteniendo participantes" });
  }
});

// Buscar sala directa (tipo "direct") entre el usuario autenticado y otro usuario
router.get("/rooms/direct/:otherUserId", verifyToken, async (req, res) => {
  const userId      = req.userId;
  const otherUserId = parseInt(req.params.otherUserId);
 
  try {
    const [rows] = await db.query(
      `SELECT r.id
       FROM rooms r
       WHERE (r.name = ? OR r.name = ?)
         AND (
           SELECT COUNT(*) FROM room_participants WHERE room_id = r.id
         ) = 2
       LIMIT 1`,
      [
        `chat-${userId}-${otherUserId}`,
        `chat-${otherUserId}-${userId}`
      ]
    );
 
    if (rows.length === 0) return res.status(404).json({ message: "No existe sala directa" });
 
    res.json({ roomId: rows[0].id });
  } catch (err) {
    console.error("ERROR GET DIRECT ROOM:", err);
    res.status(500).json({ message: "Error buscando sala" });
  }
});

module.exports = router;