//utils/rooms.js
import { apiFetch } from "./apiClient";

// Traer todas las salas del usuario
export const fetchUserRooms = () => apiFetch("rooms");

// Crear sala privada
export const createPrivateRoom = async (userIds) => {
  const roomData = {
    name: `chat-${userIds.join("-")}`,
    type: "chat",
    userIds
  };
  const res = await apiFetch("rooms", {
    method: "POST",
    body: JSON.stringify(roomData)
  });
  return res.roomId;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("http://localhost:3001/upload", {
    method: "POST",
    body: formData
  });

  return res.json();
};