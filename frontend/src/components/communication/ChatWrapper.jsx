import { useParams } from "react-router-dom";
import Chat from "./chat";
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/apiClient";
import { useCall } from "@/context/CallContext";

export default function ChatWrapper() {
  const { chatRoomId } = useParams();
  const userId = parseInt(localStorage.getItem("userId"));

  const [authorized, setAuthorized]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [targetUser, setTargetUser]   = useState({ id: null, name: null });

  const { activeCall, setIsMinimized } = useCall();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 1. Verificar acceso (ya lo hacía antes)
        await apiFetch(`rooms/${chatRoomId}/messages`);
        setAuthorized(true);

        // 2. Traer el otro participante de la sala
        const participants = await apiFetch(`rooms/${chatRoomId}/participants`);
        if (participants.length > 0) {
          setTargetUser({ id: participants[0].id, name: participants[0].name });
        }

      } catch (err) {
        console.error("Error:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (chatRoomId) checkAccess();
  }, [chatRoomId]);

  // Al salir del chat, minimizar la llamada si hay una activa
  useEffect(() => {
    return () => {
      if (activeCall) setIsMinimized(true);
    };
  }, [activeCall]);

  if (!chatRoomId)  return <p>Chat no encontrado</p>;
  if (loading)      return <p>Cargando...</p>;
  if (!authorized)  return <p>No tienes acceso a este chat</p>;

  return (
    <Chat
      roomId={chatRoomId}
      userId={userId}
      targetUserId={targetUser.id}
      targetUserName={targetUser.name}
    />
  );
}