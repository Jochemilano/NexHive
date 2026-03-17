import React, { useState, useEffect } from "react";
import { socket, joinRoom, sendMessage } from "socket";
import { apiFetch } from "utils/apiClient";
import "./chat.css";
import { uploadFile } from 'utils/rooms';
import ImageModal from "./ImageModal";

const Chat = ({ roomId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const BACKEND_URL = "http://localhost:3001";
  //const userId = parseInt(localStorage.getItem("userId"));
  
  useEffect(() => {
    // Cargar mensajes históricos con apiFetch
    const fetchMessages = async () => {
      try {
        const data = await apiFetch(`rooms/${roomId}/messages`);
        setMessages(data);
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      }
    };
    fetchMessages();

    // Unirse a la sala y escuchar mensajes nuevos
    joinRoom(roomId);

    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Limpiar listener al desmontar
    return () => {
      socket.off("receive-message");
    };
  }, [roomId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const message = {
      roomId,
      senderId: userId,
      type: "text",
      content: input
    };

    sendMessage(message); // Socket sigue igual
    setInput("");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = await uploadFile(file);

    const message = {
      roomId,
      senderId: userId,
      type: file.type.startsWith("image/") ? "image" : "file",
      content: data.url
    };

    sendMessage(message);
  };

  return (
  <div className="chat-container">
    <div className="chat-messages">
      {messages.map((msg) => {
        const isMine = msg.senderId === userId;
        return (
          <div
            key={msg.id || `${msg.senderId}-${msg.content}`}
            className={`chat-message ${isMine ? "mine" : "other"}`}
          >
            <span className="sender">{msg.sender_name || msg.senderId}</span>

            {msg.type === "text" && <p className="content">{msg.content}</p>}
            {msg.type === "image" && (
              <img
                className="content-image"
                src={`${BACKEND_URL}${msg.content}`}
                alt="imagen"
                onClick={() => setModalImage(`${BACKEND_URL}${msg.content}`)}
                style={{ cursor: "pointer" }}
              />
            )}
            {msg.type === "file" && <a className="content-file" href={`${BACKEND_URL}${msg.content}`} target="_blank" rel="noreferrer">{msg.content.split("/").pop()}</a>}
          </div>
        );
      })}
    </div>

    <div className="chat-input">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        placeholder="Escribe un mensaje..."
      />
      <input type="file" onChange={handleFile} />
      <button onClick={handleSendMessage}>Enviar</button>
    </div>
    <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
  </div>
);
};

export default Chat;