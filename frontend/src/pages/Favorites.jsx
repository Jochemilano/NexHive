import React, { useEffect, useState } from "react";
import { getUserFavorites, formatDate } from "utils/favorites";
import { getFileUrl } from "utils/chat";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = parseInt(localStorage.getItem("userId"));

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

  if (loading) return <p>Cargando favoritos...</p>;
  if (favorites.length === 0) return <p>No tienes mensajes favoritos.</p>;
  
  return (
    <div className="favorites-page">
      <h2>Mensajes Favoritos</h2>
      <div className="favorites-list">
        {favorites.map((msg) => (
          <div key={msg.id} className="favorite-message">
            <strong>{msg.sender_name}:</strong>
            
            {msg.type === "image" ? (
              <img
                src={getFileUrl(msg.content)}
                alt="Imagen enviada"
                style={{ maxWidth: "200px", display: "block", marginTop: "8px" }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <p>{msg.content}</p>
            )}

            <small>{formatDate(msg.created_at)}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;