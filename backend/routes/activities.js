const express = require("express");
const router = express.Router();
const { query } = require("../db"); // asegúrate que tu db.js exporte query correctamente
const verifyToken = require("../middleware/verifyToken");

// Traer detalles de actividad
router.get("/:id", verifyToken, async (req, res) => {
  const activityId = req.params.id;

  try {
    const [activity] = await query(
      `SELECT a.id, a.name, a.description, a.status, a.start_date, a.deadline, a.project_id,
              p.group_id
       FROM activities a
       JOIN projects p ON a.project_id = p.id
       WHERE a.id = ?`,
      [activityId]
    );

    if (!activity) return res.status(404).json({ message: "Actividad no encontrada" });

    const check = await query(
      "SELECT * FROM user_groups WHERE user_id=? AND group_id=?",
      [req.userId, activity.group_id]
    );

    if (check.length === 0) return res.status(403).json({ message: "No tiene acceso a esta actividad" });

    res.json({
      id: activity.id,
      name: activity.name,
      description: activity.description,
      status: activity.status,
      start_date: activity.start_date,
      deadline: activity.deadline,
      project_id: activity.project_id
    });

  } catch (err) {
    console.error("ERROR DB GET ACTIVITY:", err);
    res.status(500).json({ message: "Error al obtener actividad" });
  }
});

// Editar actividad
router.put("/:id", verifyToken, async (req, res) => {
  const activityId = req.params.id;
  const { name, description, status, start_date, deadline } = req.body;

  if (!name) return res.status(400).json({ message: "Nombre requerido" });

  try {
    const [activity] = await query(
      `SELECT a.id, a.project_id, p.group_id
       FROM activities a
       JOIN projects p ON a.project_id = p.id
       WHERE a.id = ?`,
      [activityId]
    );

    if (!activity) return res.status(404).json({ message: "Actividad no encontrada" });

    const check = await query(
      "SELECT * FROM user_groups WHERE user_id=? AND group_id=?",
      [req.userId, activity.group_id]
    );

    if (check.length === 0) return res.status(403).json({ message: "No tiene acceso a esta actividad" });

    await query(
      `UPDATE activities
       SET name=?, description=?, status=?, start_date=?, deadline=?
       WHERE id=?`,
      [name, description || "", status || "pending", start_date || null, deadline || null, activityId]
    );

    await query(
      `UPDATE calendar_events e
       JOIN calendar_event_activities cea ON e.id = cea.event_id
       SET e.title=?, e.description=?, e.start_datetime=?, e.end_datetime=?
       WHERE cea.activity_id=?`,
      [name, description || "", start_date || null, deadline || null, activityId]
    );

    res.json({
      id: activityId,
      name,
      description: description || "",
      status: status || "pending",
      start_date: start_date || null,
      deadline: deadline || null
    });

  } catch (err) {
    console.error("ERROR DB UPDATE ACTIVITY:", err);
    res.status(500).json({ message: "Error actualizando actividad" });
  }
});

module.exports = router;