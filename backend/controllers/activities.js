const express = require("express");
const router = express.Router();
const db = require("../db");
const verifyToken = require("../middleware/verifyToken");

// Función auxiliar para formatear fechas a SQL
function formatDateForSQL(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d)) {
    console.warn("Fecha inválida:", date);
    return null;
  }
  return d.toISOString().slice(0, 19).replace("T", " ");
}

// ------------------------
// POST /activities — Crear actividad
// ------------------------
router.post("/activities", verifyToken, async (req, res) => {
  const { name, projectId, description, status, start_date, deadline } = req.body;
  const userId = req.userId;

  if (!name || !projectId) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  try {
    // Verificar acceso del usuario al proyecto
    const [check] = await db.query(
      `SELECT g.id
       FROM projects p
       JOIN groups g ON p.group_id = g.id
       JOIN user_groups ug ON g.id = ug.group_id
       WHERE p.id = ? AND ug.user_id = ?`,
      [projectId, userId]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: "No tiene acceso a este proyecto" });
    }

    const startDateTime = start_date ? new Date(start_date) : null;
    const deadlineDateTime = deadline ? new Date(deadline) : null;

    // Insertar actividad
    const [activityResult] = await db.query(
      `INSERT INTO activities
         (name, project_id, description, status, start_date, deadline, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        projectId,
        description || "",
        status || "pending",
        formatDateForSQL(startDateTime),
        formatDateForSQL(deadlineDateTime),
        userId,
      ]
    );
    const activityId = activityResult.insertId;

    // Insertar evento en calendario
    const [eventResult] = await db.query(
      `INSERT INTO calendar_events
         (title, description, start_datetime, end_datetime, type, created_by)
       VALUES (?, ?, ?, ?, 'ACTIVITY', ?)`,
      [name, description || "", formatDateForSQL(startDateTime), formatDateForSQL(deadlineDateTime), userId]
    );
    const eventId = eventResult.insertId;

    // Vincular actividad con evento
    await db.query(
      "INSERT INTO calendar_event_activities (event_id, activity_id) VALUES (?, ?)",
      [eventId, activityId]
    );

    // Traer nombre del usuario
    const [userRows] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);
    const createdByName = userRows[0]?.name ?? null;

    res.json({
      id: activityId,
      name,
      project_id: projectId,
      description: description || "",
      status: status || "pending",
      start_date: startDateTime ? startDateTime.toISOString() : null,
      deadline: deadlineDateTime ? deadlineDateTime.toISOString() : null,
      created_by: userId,
      created_by_name: createdByName,
      calendar_event: {
        id: eventId,
        title: name,
        description: description || "",
        start: startDateTime ? startDateTime.toISOString() : null,
        end: deadlineDateTime ? deadlineDateTime.toISOString() : null,
      },
    });
  } catch (err) {
    console.error("ERROR DB CREATE ACTIVITY:", err);
    res.status(500).json({ message: "Error creando actividad", error: err.message });
  }
});

// ------------------------
// GET /activities/:id — Traer detalles de actividad
// ------------------------
router.get("/activities/:id", verifyToken, async (req, res) => {
  const activityId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT
         a.id,
         a.name,
         a.description,
         a.status,
         a.start_date,
         a.deadline,
         a.project_id,
         a.created_by,
         u.name AS created_by_name,
         p.group_id
       FROM activities a
       JOIN projects p ON a.project_id = p.id
       LEFT JOIN users u ON u.id = a.created_by
       WHERE a.id = ?`,
      [activityId]
    );

    const activity = rows[0];
    if (!activity) return res.status(404).json({ message: "Actividad no encontrada" });

    const [check] = await db.query(
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
      project_id: activity.project_id,
      created_by: activity.created_by,
      created_by_name: activity.created_by_name,
    });
  } catch (err) {
    console.error("ERROR DB GET ACTIVITY:", err);
    res.status(500).json({ message: "Error al obtener actividad", error: err.message });
  }
});

// ------------------------
// PUT /activities/:id — Editar actividad
// ------------------------
router.put("/activities/:id", verifyToken, async (req, res) => {
  const activityId = req.params.id;
  const { name, description, status, start_date, deadline } = req.body;

  if (!name) return res.status(400).json({ message: "Nombre requerido" });

  try {
    const [rows] = await db.query(
      `SELECT a.id, a.project_id, p.group_id
       FROM activities a
       JOIN projects p ON a.project_id = p.id
       WHERE a.id = ?`,
      [activityId]
    );

    const activity = rows[0];
    if (!activity) return res.status(404).json({ message: "Actividad no encontrada" });

    const [check] = await db.query(
      "SELECT * FROM user_groups WHERE user_id=? AND group_id=?",
      [req.userId, activity.group_id]
    );

    if (check.length === 0) return res.status(403).json({ message: "No tiene acceso a esta actividad" });

    await db.query(
      `UPDATE activities
       SET name=?, description=?, status=?, start_date=?, deadline=?
       WHERE id=?`,
      [name, description || "", status || "pending", formatDateForSQL(start_date), formatDateForSQL(deadline), activityId]
    );

    await db.query(
      `UPDATE calendar_events e
       JOIN calendar_event_activities cea ON e.id = cea.event_id
       SET e.title=?, e.description=?, e.start_datetime=?, e.end_datetime=?
       WHERE cea.activity_id=?`,
      [name, description || "", formatDateForSQL(start_date), formatDateForSQL(deadline), activityId]
    );

    res.json({
      id: activityId,
      name,
      description: description || "",
      status: status || "pending",
      start_date: start_date || null,
      deadline: deadline || null,
    });
  } catch (err) {
    console.error("ERROR DB UPDATE ACTIVITY:", err);
    res.status(500).json({ message: "Error actualizando actividad", error: err.message });
  }
});

module.exports = router;