import { useState, useEffect } from "react";
import { socket, joinRoom, sendMessage } from "@/utils/socket";
import { apiFetch } from "@/utils/apiClient";
import { uploadFile } from "@/utils/rooms";

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

  const send = (content, replyToId = null) => {
    sendMessage({
      roomId,
      senderId: userId,
      type: "text",
      content,
      replyToId: replyToId || null,
    });
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
  const editMessage = async (messageId, content) => {
    await apiFetch(`messages/${messageId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
    // Actualiza localmente
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, content, edited: 1 } : m))
    );
  };

  const deleteMessage = async (messageId) => {
    await apiFetch(`messages/${messageId}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };
  

  return { messages, send, sendFile, editMessage, deleteMessage };
};