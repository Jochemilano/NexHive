import { useState, useEffect } from "react";
import { socket, joinRoom, sendMessage } from "utils/socket";
import { apiFetch } from "utils/apiClient";
import { uploadFile } from "utils/rooms";

export const useChat = (roomId, userId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    apiFetch(`rooms/${roomId}/messages`)
      .then(setMessages)
      .catch(err => console.error("Error cargando mensajes:", err));

    joinRoom(roomId);
    socket.on("receive-message", msg => setMessages(prev => [...prev, msg]));
    return () => socket.off("receive-message");
  }, [roomId]);

  const send = (text) => {
    if (!text.trim()) return;
    sendMessage({ roomId, senderId: userId, type: "text", content: text });
  };

  const sendFile = async (file) => {
    if (!file) return;
    const data = await uploadFile(file);
    sendMessage({
      roomId,
      senderId: userId,
      type: file.type.startsWith("image/") ? "image" : "file",
      content: data.url,
    });
  };

  return { messages, send, sendFile };
};