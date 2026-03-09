require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Rutas
const authRoutes = require("./routes/auth");
const groupsRoutes = require("./routes/groups");
const projectsRoutes = require("./routes/projects");
const eventsRoutes = require("./routes/events");
const roomsRoutes = require("./routes/rooms");
const genericRoutes = require("./routes/generic");

// DB
const db = require("./db");

// Socket setup
const setupSockets = require("./sockets");

const app = express();
app.use(cors());
app.use(express.json());

// Endpoints básicos
app.get("/", (req, res) => res.send("Servidor corriendo"));

// Rutas
app.use("/api", authRoutes);
app.use("/api", groupsRoutes);
app.use("/api", projectsRoutes);
app.use("/api", eventsRoutes);
app.use("/api", roomsRoutes);
app.use("/api", genericRoutes);

// Servidor + Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
const connectedUsers = new Map();

// Llamar al socket handler
setupSockets(io, connectedUsers);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));