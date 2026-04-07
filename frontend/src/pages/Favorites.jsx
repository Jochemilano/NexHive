import React, { useEffect, useState } from "react";
import { getUserFavorites, formatDate } from "@/utils/favorites";
import { getFileUrl, getFileName, toggleFavoriteMessage  } from "@/utils/chat";
import {FaStar} from "react-icons/fa";
import ImageModal from "@/components/communication/ImageModal";
import "@/styles.css";
import "./Favorites.css"

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = parseInt(localStorage.getItem("userId"));
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await getUserFavorites(userId);
        setFavorites(data);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const handleToggleFavorite = async (msgId) => {
    const confirmRemove = window.confirm("¿Seguro que quieres quitar este mensaje de tus favoritos?");
    if (!confirmRemove) return;

    try {
      const data = await toggleFavoriteMessage(msgId);
      if (!data.favorite) {
        // Elimina de la lista si ya no es favorito
        setFavorites((prev) => prev.filter((msg) => msg.id !== msgId));
      }
    } catch (err) {
      console.error("Error actualizando favorito:", err);
    }
  };

  if (loading) return <p>Cargando favoritos...</p>;
  if (favorites.length === 0) return <p>No tienes mensajes favoritos.</p>;
  
  return (
    <div className="favorites-page">
      <h2>Mensajes Favoritos</h2>

      <div className="favorites-list">
        {favorites.map((msg) => (
          <div key={msg.id} className="favorite-message">

          {/* Header */}
            <div className="message-header">
            <strong className="sender">{msg.sender_name}</strong>
              <small className="date">
                {formatDate(msg.created_at)}
              </small>
            </div>
            
           {/* Contenido */}
            <div className="message-content">
              {msg.type === "image" ? (
                <img
                  src={getFileUrl(msg.content)}
                  alt="Imagen enviada"
                  onClick={() => setModalImage(getFileUrl(msg.content))}
                  style={{ cursor: "pointer" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : msg.type === "file" ? (
                <a
                  href={getFileUrl(msg.content)}
                  target="_blank"
                  rel="noreferrer"
                  className="content-file"
                >
                  {getFileName(msg.content)}
                </a>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>

            {/* Botón flotante */}
            <button
              className="favorite-toggle-btn"
              onClick={() => handleToggleFavorite(msg.id)}
              title="Quitar de favoritos"
            >
              <FaStar style={{ color: "gold" }} />
            </button>

          </div>
        ))}
      </div>

      <ImageModal src={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
};

export default Favorites;