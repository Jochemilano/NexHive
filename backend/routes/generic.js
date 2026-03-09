const express = require("express");
const router = express.Router();
const query = require("../helpers/query");
const db = require("../db");
const verifyToken = require("../middleware/verifyToken");

// Consulta genérica por ID (segura)
router.post("/getById", verifyToken, async (req, res) => {
  const { tabla, id } = req.body;
  const tablasPermitidas = ["users", "productos", "ordenes"];

  if (!tablasPermitidas.includes(tabla))
    return res.status(400).json({ error: "Tabla no permitida" });

  try {
    const results = await query(`SELECT * FROM ?? WHERE id = ?`, [tabla, id]);
    res.json(results);
  } catch (err) {
    console.error("ERROR GET BY ID:", err);
    res.status(500).json({ error: "Error en la consulta" });
  }
});

// Traer usuarios activos
router.get("/users", async (req, res) => {
  try {
    const [results] = await db.query(`SELECT id, name FROM users WHERE status = 1`);
    res.json(results);
  } catch (err) {
    console.error("ERROR GET USERS:", err);
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
});

module.exports = router;