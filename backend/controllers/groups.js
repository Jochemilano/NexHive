const express = require("express");
const router = express.Router();
const query = require("../helpers/query");
const verifyToken = require("../middleware/verifyToken");

// Crear grupo
router.post("/groups", verifyToken, async (req, res) => {
  const { name } = req.body;
  const adminId = req.userId;

  if (!name) return res.status(400).json({ message: "Nombre requerido" });

  try {
    const result = await query(
      "INSERT INTO groups (name, admin_id) VALUES (?, ?)",
      [name, adminId]
    );
    const groupId = result.insertId;

    await query(
      "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)",
      [adminId, groupId]
    );

    res.json({ id: groupId, name, admin_id: adminId });

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

    const channels = await query("SELECT id FROM channels WHERE group_id=?", [groupId]);

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