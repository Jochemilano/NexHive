const express = require("express");
const router = express.Router();
const query = require("../helpers/query");
const verifyToken = require("../middleware/verifyToken");

// Crear grupo
router.post("/groups", verifyToken, async (req, res) => {
  const { name, collaborators = [] } = req.body;
  const adminId = req.userId;

  if (!name) return res.status(400).json({ message: "Nombre requerido" });

  try {
    // 1️⃣ Crear grupo
    const result = await query(
      "INSERT INTO groups (name, admin_id) VALUES (?, ?)",
      [name, adminId]
    );
    const groupId = result.insertId;

    // 2️⃣ Insertar admin en user_groups
    await query(
      "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)",
      [adminId, groupId]
    );

    // 3️⃣ Insertar colaboradores en user_groups
    if (collaborators.length > 0) {
      const values = collaborators.map(userId => [userId, groupId]);
      await query(
        "INSERT INTO user_groups (user_id, group_id) VALUES ?",
        [values]
      );
    }

    const allUsers = [adminId, ...collaborators];

    // 4️⃣ Crear room de CHAT
    const chatRoom = await query(
      "INSERT INTO rooms (name, type, created_by) VALUES (?, ?, ?)",
      ["general-chat", "chat", adminId]
    );
    const chatRoomId = chatRoom.insertId;

    // 5️⃣ Crear room de VOZ
    const voiceRoom = await query(
      "INSERT INTO rooms (name, type, created_by) VALUES (?, ?, ?)",
      ["general-voice", "voice", adminId]
    );
    const voiceRoomId = voiceRoom.insertId;

    // 6️⃣ Agregar todos los usuarios a los rooms
    if (allUsers.length > 0) {
      const chatValues = allUsers.map(userId => [chatRoomId, userId]);
      await query(
        "INSERT INTO room_participants (room_id, user_id) VALUES ?",
        [chatValues]
      );

      const voiceValues = allUsers.map(userId => [voiceRoomId, userId]);
      await query(
        "INSERT INTO room_participants (room_id, user_id) VALUES ?",
        [voiceValues]
      );
    }

    // 7️⃣ Crear registro en channels
    await query(
      "INSERT INTO channels (group_id, voice_room_id, chat_room_id) VALUES (?, ?, ?)",
      [groupId, voiceRoomId, chatRoomId]
    );

    // 8️⃣ Devolver respuesta
    res.json({
      id: groupId,
      name,
      admin_id: adminId,
      chat_room_id: chatRoomId,
      voice_room_id: voiceRoomId,
      collaborators
    });

  } catch (err) {
    console.error("ERROR DB GROUP:", err);
    res.status(500).json({ message: "Error al crear grupo" });
  }
});

// Traer grupos de usuario
router.get("/groups", verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const results = await query(
      `SELECT g.id, g.name, g.admin_id
       FROM groups g
       JOIN user_groups ug ON g.id = ug.group_id
       WHERE ug.user_id = ?`,
      [userId]
    );
    res.json(results);
  } catch (err) {
    console.error("ERROR DB GET GROUPS:", err);
    res.status(500).json({ message: "Error al traer grupos" });
  }
});

// Detalles de grupo
router.get("/groups/:groupId/details", verifyToken, async (req, res) => {
  const { groupId } = req.params;
  const userId = req.userId;

  try {
    const userGroup = await query(
      "SELECT * FROM user_groups WHERE user_id=? AND group_id=?",
      [userId, groupId]
    );

    if (userGroup.length === 0) return res.status(403).json({ message: "No pertenece al grupo" });

    const channels = await query(
      "SELECT id, chat_room_id, voice_room_id FROM channels WHERE group_id=?",
      [groupId]
    );

    const projects = await query(
      `SELECT p.id AS project_id, p.name AS project_name,
              a.id AS activity_id, a.name AS activity_name,
              a.description AS activity_description, a.status AS activity_status,
              a.start_date, a.deadline
       FROM projects p
       LEFT JOIN activities a ON a.project_id = p.id
       WHERE p.group_id = ?
       ORDER BY p.id, a.id`,
      [groupId]
    );

    res.json({ channels, projects });

  } catch (err) {
    console.error("ERROR DB GROUP DETAILS:", err);
    res.status(500).json({ message: "Error al traer detalles del grupo" });
  }
});

module.exports = router;