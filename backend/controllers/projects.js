const express = require("express");
const router = express.Router();
const query = require("../helpers/query");
const verifyToken = require("../middleware/verifyToken");

// Crear proyecto
router.post("/projects", verifyToken, async (req, res) => {
  const { name, description, groupId } = req.body;
  const userId = req.userId;

  if (!name || !groupId)
    return res.status(400).json({ message: "Datos incompletos" });

  try {
    const userGroup = await query(
      "SELECT * FROM user_groups WHERE user_id=? AND group_id=?",
      [userId, groupId]
    );
    if (userGroup.length === 0)
      return res.status(403).json({ message: "No pertenece al grupo" });

    const result = await query(
      "INSERT INTO projects (name, description, group_id) VALUES (?, ?, ?)",
      [name, description, groupId]
    );

    res.json({ id: result.insertId, name, description, group_id: groupId });
  } catch (err) {
    console.error("ERROR DB CREATE PROJECT:", err);
    res.status(500).json({ message: "Error creando proyecto" });
  }
});

// Crear actividad — guarda created_by con el userId del token
router.post("/activities", verifyToken, async (req, res) => {
  const { name, projectId, description, status, start_date, deadline } = req.body;
  const userId = req.userId;

  if (!name || !projectId)
    return res.status(400).json({ message: "Datos incompletos" });

  function formatDateForSQL(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().slice(0, 19).replace("T", " ");
  }

  try {
    const check = await query(
      `SELECT g.id
       FROM projects p
       JOIN groups g ON p.group_id = g.id
       JOIN user_groups ug ON g.id = ug.group_id
       WHERE p.id = ? AND ug.user_id = ?`,
      [projectId, userId]
    );
    if (check.length === 0)
      return res.status(403).json({ message: "No tiene acceso a este proyecto" });

    const startDateTime = start_date ? new Date(start_date) : null;
    const deadlineDateTime = deadline ? new Date(deadline) : null;

    // Se agrega created_by para registrar el responsable
    const activityResult = await query(
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

    const eventResult = await query(
      `INSERT INTO calendar_events
         (title, description, start_datetime, end_datetime, type, created_by)
       VALUES (?, ?, ?, ?, 'ACTIVITY', ?)`,
      [name, description || "", formatDateForSQL(startDateTime), formatDateForSQL(deadlineDateTime), userId]
    );

    const eventId = eventResult.insertId;

    await query(
      "INSERT INTO calendar_event_activities (event_id, activity_id) VALUES (?, ?)",
      [eventId, activityId]
    );

    // Traer el nombre del usuario para devolverlo en la respuesta
    const userRows = await query("SELECT name FROM users WHERE id = ?", [userId]);
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
    res.status(500).json({ message: "Error creando actividad" });
  }
});

module.exports = router;