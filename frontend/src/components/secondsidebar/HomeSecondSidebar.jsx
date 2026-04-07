import React, { useEffect, useState } from "react";
import { fetchAllUsers } from "@/utils/groups";
import { apiFetch } from "@/utils/apiClient";
import { useNavigate } from "react-router-dom";

const HomeSecondSidebar = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const currentUserId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data.filter(u => u.id !== currentUserId));
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };
    loadUsers();
  }, []);

  const handleUserClick = async (user) => {
    try {
      const userIds = [currentUserId, user.id].sort();
      const roomName = `chat-${userIds.join("-")}`;

      const rooms = await apiFetch("rooms"); 
      let existingRoom = rooms.find(r => r.name === roomName);
      let roomId;

      if (existingRoom) {
        roomId = existingRoom.id;
      } else {
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

      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error("Error abriendo chat:", err);
    }
  };

  return (
    <div className="sidebar-inner">
      <h3>Usuarios</h3>
      <div className="user-list">
        {users.map(u => (
          <div
            key={u.id}
            className="user-item"
            onClick={() => handleUserClick(u)}
          >
            {u.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeSecondSidebar;