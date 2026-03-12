import React, { useEffect, useState } from "react";
import { fetchAllUsers } from "utils/groups"; // ya existe
import { apiFetch } from "utils/apiClient";
import { useNavigate } from "react-router-dom";

const HomeSecondSidebar = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data.filter(u => u.id !== currentUserId)); // no mostrarte a ti mismo
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };
    loadUsers();
  }, []);

  const handleUserClick = async (user) => {
    try {
      // Creamos un nombre único por convención para chats privados
      const userIds = [currentUserId, user.id].sort();
      const roomName = `chat-${userIds.join("-")}`;

      // 1️⃣ Intentamos ver si ya existe la sala
      const rooms = await apiFetch("rooms"); // endpoint backend para listar salas del usuario
      let existingRoom = rooms.find(r => r.name === roomName);
      let roomId;

      if (existingRoom) {
        roomId = existingRoom.id;
      } else {
        // 2️⃣ Si no existe, creamos la sala privada
        const res = await apiFetch("rooms", {
          method: "POST",
          body: JSON.stringify({
            name: roomName,
            type: "chat",
            userIds
          })
        });
        roomId = res.roomId;
      }

      // 3️⃣ Navegamos a la sala segura
      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error("Error abriendo chat:", err);
    }
  };

  return (
    <aside className="second-sidebar">
      <div style={{ padding: "10px" }}>
        <h3>Usuarios</h3>
        <div>
          {users.map(u => (
            <div
              key={u.id}
              style={{
                padding: "8px",
                marginBottom: "5px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor: "pointer"
              }}
              onClick={() => handleUserClick(u)}
            >
              {u.name}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default HomeSecondSidebar;