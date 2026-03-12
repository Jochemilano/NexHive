import { apiFetch } from "./apiClient";

// Traer todas las salas del usuario
export const fetchUserRooms = () => apiFetch("rooms"); // si no existe, se puede crear endpoint similar en backend

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