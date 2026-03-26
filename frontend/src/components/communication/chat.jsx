import React, { useState, useEffect, useRef } from "react";
import { useChat } from "hooks/useChat";
import { useCall } from "context/CallContext";
import CallVideo from "./Callvideo";
import ImageModal from "./ImageModal";
import { FaPaperclip, FaPaperPlane, FaStar, FaPhone, FaReply, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { getFileUrl, getFileName, toggleFavoriteMessage } from "utils/chat";
import "./chat.css";
import "./call.css";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
};

const MessageContent = ({ msg, onImageClick, isMine, onReply, onEdit, onDelete }) => {
  const [favorite, setFavorite] = useState(msg.favorite === 1);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const src = getFileUrl(msg.content);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFavorite = async () => {
    try {
      const data = await toggleFavoriteMessage(msg.id);
      setFavorite(data.favorite);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="message-wrapper">
      <div className="message-content">
        {msg.reply_to_id && (
          <div className="reply-preview">
            <span className="reply-author">{msg.reply_sender_name}</span>
            <span className="reply-text">{msg.reply_content}</span>
          </div>
        )}

        {{
          image: <img className="content-image" src={src} alt="imagen" onClick={() => onImageClick(src)} />,
          file:  <a className="content-file" href={src} target="_blank" rel="noreferrer">{getFileName(msg.content)}</a>,
          text:  <p className="content">{msg.content}</p>,
        }[msg.type]}

        <div className="message-meta">
          {msg.edited === 1 && <span className="edited-tag">editado</span>}
          <span className="message-time">{formatTime(msg.created_at)}</span>
        </div>

        <button
          className="menu-toggle-btn"
          onClick={() => setMenuOpen(prev => !prev)}
          type="button"
        >
          ▼
        </button>

        {menuOpen && (
          <div className="context-menu" ref={menuRef}>
            <ul>
              <li onClick={() => { handleFavorite(); setMenuOpen(false); }}>
                <FaStar style={{color: favorite ? "gold" : "gray", marginRight: 6}} />
                Favoritos
              </li>
              {isMine && (
                <>
                  <li onClick={() => { onEdit(msg); setMenuOpen(false); }}>
                    <FaEdit style={{marginRight: 6}} /> Editar
                  </li>
                  <li onClick={() => { onDelete(msg.id); setMenuOpen(false); }}>
                    <FaTrash style={{marginRight: 6}} /> Eliminar
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      <button
        className="reply-btn"
        onClick={() => onReply(msg)}
        aria-label="Responder"
        type="button"
      >
        <FaReply />
      </button>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────
const Chat = ({ roomId, userId, targetUserId, targetUserName }) => {
  // 1. Estados
  const [input, setInput] = useState("");
  const [modalImage, setModalImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 2. Refs
  const chatPageRef = useRef(null);
  const scrollContainerRef = useRef(null); // apuntará al main-content

  // 3. Hooks de datos
  const { messages, send, sendFile, deleteMessage, editMessage } = useChat(roomId, userId);
  const { activeCall, isMinimized, startCall } = useCall();

  // 4. Funciones de scroll
  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const threshold = 80;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    setIsAtBottom(atBottom);
  };

  // 5. Effects
  useEffect(() => {
    const container = chatPageRef.current?.parentElement;
    if (!container) return;
    scrollContainerRef.current = container;
    container.addEventListener("scroll", handleScroll);
    scrollToBottom();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) scrollToBottom();
  }, [messages]);

  // 6. Handlers
  const handleSend = () => {
    if (!input.trim()) return;
    if (editingMsg) {
      editMessage(editingMsg.id, input);
      setEditingMsg(null);
    } else {
      send(input, replyTo?.id || null);
      setReplyTo(null);
    }
    setInput("");
  };

  const handleFile  = (e) => sendFile(e.target.files[0]);
  const handleCall  = () => startCall(targetUserId, targetUserName, roomId);

  const handleEdit = (msg) => {
    setEditingMsg(msg);
    setReplyTo(null);
    setInput(msg.content);
  };

  const handleReply = (msg) => {
    setReplyTo(msg);
    setEditingMsg(null);
  };

  const cancelAction = () => {
    setReplyTo(null);
    setEditingMsg(null);
    setInput("");
  };

  return (
    <div className="chat-page" ref={chatPageRef}>
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
              <MessageContent
                msg={msg}
                onImageClick={setModalImage}
                isMine={Number(msg.sender_id) === Number(userId)}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={deleteMessage}
              />
            </div>
          ))}
        </div>

        <div className="chat-footer-sticky">
          {(replyTo || editingMsg) && (
            <div className="action-banner">
              <div className="action-content">
                {replyTo && (
                  <>
                    <FaReply className="action-icon" />
                    <div className="action-info">
                      <span className="reply-label">
                        Respondiendo a <b>{replyTo.sender_name}</b>
                      </span>
                      <span className="reply-text-truncate">
                        {replyTo.content}
                      </span>
                    </div>
                  </>
                )}
                {editingMsg && (
                  <>
                    <FaEdit className="action-icon" />
                    <span>Editando mensaje...</span>
                  </>
                )}
              </div>
              <button className="cancel-action" onClick={cancelAction}>
                <FaTimes />
              </button>
            </div>
          )}

          <div className="chat-input">
            <label htmlFor="file-upload" className="icon-btn">
              <FaPaperclip />
            </label>
            <input id="file-upload" type="file" onChange={handleFile} style={{ display: "none" }} />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={editingMsg ? "Edita el mensaje..." : "Escribe un mensaje..."}
              className="chat-textarea"
              rows={1}
            />

            <button onClick={handleSend} className="send-btn" disabled={!input.trim()}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      {!isAtBottom && (
        <button
          className="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          aria-label="Ir al fondo"
          type="button"
        >
          ↓
        </button>
      )}

      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
};

export default Chat;