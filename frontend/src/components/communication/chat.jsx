import React, { useState } from "react";
import { useChat } from "hooks/useChat";
import { useCall } from "context/CallContext";
import CallVideo from "./Callvideo";
import ImageModal from "./ImageModal";
import { FaPaperclip, FaPaperPlane, FaStar, FaPhone } from "react-icons/fa";
import { getFileUrl, getFileName, toggleFavoriteMessage } from "utils/chat";
import "./chat.css";

// ── Renderizado de cada mensaje ───────────────────────────
const MessageContent = ({ msg, onImageClick }) => {
  const [favorite, setFavorite] = useState(msg.favorite === 1);
  const src = getFileUrl(msg.content);

  const handleFavorite = async () => {
    try {
      const data = await toggleFavoriteMessage(msg.id);
      setFavorite(data.favorite);
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <div className="message-content">
    {{
      image: <img className="content-image" src={src} alt="imagen" onClick={() => onImageClick(src)} />,
      file: <a className="content-file" href={src} target="_blank" rel="noreferrer">{getFileName(msg.content)}</a>,
      text: <p className="content">{msg.content}</p>,
    }[msg.type]}

    <FaStar
      onClick={handleFavorite}
      style={{ color: favorite ? "gold" : "gray", cursor: "pointer" }}
    />
  </div>
);
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
      <div className="chat-header-info">
        <div className="chat-avatar">{targetUserName?.[0] || "C"}</div>
        <span className="chat-username">{targetUserName || "Chat"}</span>
      </div>

      {targetUserId && !activeCall && (
        <button onClick={handleCall} className="call-start-btn">
          Llamar <FaPhone />
        </button>
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