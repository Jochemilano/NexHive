import React, { useState } from "react";
import { useChat } from "hooks/useChat";
import { useCall } from "context/CallContext";
import CallVideo from "./Callvideo";
import ImageModal from "./ImageModal";
import { FaPaperclip, FaPaperPlane } from "react-icons/fa";
import "./chat.css";

const BACKEND_URL = "http://localhost:3001";

// ── Renderizado de cada mensaje ───────────────────────────
const MessageContent = ({ msg, onImageClick }) => {
  const src = `${BACKEND_URL}${msg.content}`;
  if (msg.type === "image")
    return <img className="content-image" src={src} alt="imagen" onClick={() => onImageClick(src)} style={{ cursor: "pointer" }} />;
  if (msg.type === "file")
    return <a className="content-file" href={src} target="_blank" rel="noreferrer">{msg.content.split("/").pop()}</a>;
  return <p className="content">{msg.content}</p>;
};

// ── Componente principal ──────────────────────────────────
const Chat = ({ roomId, userId, targetUserId, targetUserName }) => {
  const [input,      setInput]      = useState("");
  const [modalImage, setModalImage] = useState(null);

  const { messages, send, sendFile } = useChat(roomId, userId);
  const { activeCall, isMinimized, startCall } = useCall();

  const handleSend = () => { send(input); setInput(""); };
  const handleFile = (e) => sendFile(e.target.files[0]);
  const handleCall = () => startCall(targetUserId, targetUserName, roomId);

  return (
    <div className="chat-page">
      {activeCall && !isMinimized && (
        <div className="chat-call-section">
          <CallVideo expanded />
        </div>
      )}

      <div className="chat-section">
        <div className="chat-header">
          <span>{targetUserName || "Chat"}</span>
          {targetUserId && !activeCall && (
            <button onClick={handleCall} className="call-start-btn">📞 Llamar</button>
          )}
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id || `${msg.sender_id}-${msg.content}`}
              className={`chat-message ${Number(msg.sender_id) === Number(userId) ? "mine" : "other"}`}
            >
              <span className="sender">{msg.sender_name || msg.sender_id}</span>
              <MessageContent msg={msg} onImageClick={setModalImage} />
            </div>
          ))}
        </div>

        <div className="chat-input">
          <label htmlFor="file-upload" className="icon-btn">
            <FaPaperclip />
          </label>
          <input id="file-upload" type="file" onChange={handleFile} style={{ display: "none" }} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
          />
          <button onClick={handleSend} className="send-btn" disabled={!input.trim()}>
            <FaPaperPlane />
          </button>
        </div>
      </div>

      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
};

export default Chat;