require("dotenv").config();
const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "nexhive",
  port: process.env.DB_PORT || 3306,

  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

// 🔎 Probar conexión al iniciar servidor
async function testConnection() {
  try {
    const connection = await db.getConnection();

    console.log("✅ MySQL conectado correctamente");
    console.log("📍 Host:", connection.config.host);
    console.log("📦 Base de datos:", connection.config.database);
    console.log("🔌 Puerto:", connection.config.port);

    connection.release();

  } catch (err) {

    console.error("❌ Error conectando a MySQL");
    console.error("Código:", err.code);
    console.error("Mensaje:", err.message);

    if (err.code === "ETIMEDOUT") {
      console.error("→ MySQL tardó demasiado en responder");
      console.error("→ Verifica que XAMPP tenga MySQL iniciado");
    }

    if (err.code === "ECONNREFUSED") {
      console.error("→ MySQL rechazó la conexión");
      console.error("→ Verifica el puerto (3306 o 3307)");
    }

    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("→ Usuario o contraseña incorrectos");
    }

    if (err.code === "ER_BAD_DB_ERROR") {
      console.error("→ La base de datos no existe");
    }
  }
}

testConnection();

module.exports = db;