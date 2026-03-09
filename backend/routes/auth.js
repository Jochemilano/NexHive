const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const query = require("../helpers/query");
const verifyToken = require("../middleware/verifyToken");

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const results = await query(
      "SELECT id, name, email, status, rol FROM users WHERE email=? AND password=?",
      [email, password]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = results[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.name,
        email: user.email,
        estado: user.status,
        rol: user.rol
      }
    });

  } catch (err) {
    console.error("ERROR DB LOGIN:", err);
    res.status(500).json({ message: "Error de servidor" });
  }
});

// PERFIL
router.get("/perfil", verifyToken, async (req, res) => {
  try {
    const results = await query(
      "SELECT name, email, status FROM users WHERE id=?",
      [req.userId]
    );

    if (!results[0]) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(results[0]);
  } catch (err) {
    console.error("ERROR DB PERFIL:", err);
    res.status(500).json({ message: "Error en la base de datos" });
  }
});

module.exports = router;