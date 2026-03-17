import React, { useState, useEffect } from "react";
import { socket, joinRoom, sendMessage } from "socket";
import { apiFetch } from "utils/apiClient";
import "./chat.css";
import { uploadFile } from "utils/rooms";
import ImageModal from "./ImageModal";
import { useCall } from "./CallContext";
import CallVideo from "./Callvideo";

const Chat = ({ roomId, userId, targetUserId, targetUserName }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [modalImage, setModalImage] = useState(null);
  const BACKEND_URL = "http://localhost:3001";

  const { activeCall, isMinimized, startCall } = useCall();

  const showCallHere = activeCall && !isMinimized;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await apiFetch(`rooms/${roomId}/messages`);
        setMessages(data);
      } catch (err) {
        console.error("Error cargando mensajes:", err);
      }
    };
    fetchMessages();
    joinRoom(roomId);
    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => socket.off("receive-message");
  }, [roomId]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    sendMessage({ roomId, senderId: userId, type: "text", content: input });
    setInput("");
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await uploadFile(file);
    sendMessage({
      roomId,
      senderId: userId,
      type: file.type.startsWith("image/") ? "image" : "file",
      content: data.url,
    });
  };

  const handleCall = () => {
    if (targetUserId) startCall(targetUserId, targetUserName, roomId); // ← pasa roomId
  };

  return (
    <div className="chat-page">
      {showCallHere && (
        <div className="chat-call-section">
          <CallVideo expanded={true} />
        </div>
      )}

      <div className="chat-section">
        <div className="chat-header">
          <span>{targetUserName || "Chat"}</span>
          {targetUserId && !activeCall && (
            <button onClick={handleCall} className="call-start-btn">
              📞 Llamar
            </button>
          )}
        </div>

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
                {msg.type === "file" && (
                  <a className="content-file" href={`${BACKEND_URL}${msg.content}`} target="_blank" rel="noreferrer">
                    {msg.content.split("/").pop()}
                  </a>
                )}
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
      </div>

      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
};

export default Chat;