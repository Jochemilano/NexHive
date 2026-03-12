import { useParams } from "react-router-dom";
import Chat from "./chat";
import { useEffect, useState } from "react";
import { apiFetch } from "utils/apiClient";

export default function ChatWrapper() {
  const { chatRoomId } = useParams();
  const userId = parseInt(localStorage.getItem("userId"));
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Intentamos obtener mensajes; backend revisa participantes
        await apiFetch(`rooms/${chatRoomId}/messages`);
        setAuthorized(true);
      } catch (err) {
        console.error("No autorizado o error al cargar chat:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    if (chatRoomId) checkAccess();
  }, [chatRoomId]);

  if (!chatRoomId) return <p>Chat no encontrado</p>;
  if (loading) return <p>Cargando...</p>;
  if (!authorized) return <p>No tienes acceso a este chat</p>;

  return <Chat roomId={chatRoomId} userId={userId} />;
}