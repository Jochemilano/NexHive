const express = require("express");
const router = express.Router();
const query = require("../helpers/query");
const verifyToken = require("../middleware/verifyToken");

// Crear proyecto
router.post("/projects", verifyToken, async (req, res) => {
  const { name, description, groupId, start_date, deadline, collaborators } = req.body;
  const userId = req.userId;

  if (!name || !groupId)
    return res.status(400).json({ message: "Datos incompletos" });

  try {
    // Verificar que el usuario pertenece al grupo
    const userGroup = await query(
      "SELECT * FROM user_groups WHERE user_id=? AND group_id=?",
      [userId, groupId]
    );
    if (userGroup.length === 0)
      return res.status(403).json({ message: "No pertenece al grupo" });

    // Crear proyecto
    const result = await query(
      "INSERT INTO projects (name, description, group_id, start_date, deadline) VALUES (?, ?, ?, ?, ?)",
      [name, description || "", groupId, start_date || null, deadline || null]
    );

    const projectId = result.insertId;

    // Agregar colaboradores al proyecto
    if (Array.isArray(collaborators) && collaborators.length > 0) {
      const values = collaborators.map(user_id => `(${user_id}, ${projectId})`).join(",");
      await query(`INSERT INTO users_projects (user_id, project_id) VALUES ${values}`);
    }

    // Retornar proyecto creado
    res.json({
      id: projectId,
      name,
      description: description || "",
      group_id: groupId,
      start_date: start_date || null,
      deadline: deadline || null,
      collaborators: collaborators || []
    });
  } catch (err) {
    console.error("ERROR DB CREATE PROJECT:", err);
    res.status(500).json({ message: "Error creando proyecto" });
  }
});


module.exports = router;