require("dotenv").config();
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) return res.status(401).json({ message: "Token no proporcionado" });

  const token = auth.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("❌ JWT inválido:", err.message);
      return res.status(403).json({ message: "Token inválido" });
    }
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;