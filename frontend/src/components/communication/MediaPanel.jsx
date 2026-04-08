import React from "react";
import { FaImages, FaTimes } from "react-icons/fa";
import "./MediaPanel.css";
const MediaPanel = ({ messages = [], onClose, onImageClick }) => {
  const images = messages.filter(msg => msg.type === "image");

  return (
    <div className="media-panel">
      {/* === Header con título y botón de cerrar === */}
      <div className="media-header">
        <h3>Multimedia</h3>
        <button onClick={onClose} className="close-btn">
          <FaTimes />
        </button>
      </div>

      {/* === Contenido del panel === */}
      {images.length === 0 ? (
        <div className="no-media">
          <FaImages className="no-media-icon" />
          <p>No se han compartido imágenes en este chat aún. Suba archivos relevantes para llenar este apartado.</p>
        </div>
      ) : (
        <div className="media-grid">
          {images.map((msg) => (
            <img
              key={msg.id}
              src={`http://localhost:3001${msg.content}`}
              alt="media"
              onClick={() => onImageClick(`http://localhost:3001${msg.content}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPanel;