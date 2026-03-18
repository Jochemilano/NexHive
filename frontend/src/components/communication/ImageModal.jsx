import React from "react";
import "./ImageModal.css";

const ImageModal = ({ src, onClose }) => {
  if (!src) return null;

  const handleDownload = async (e) => {
    e.stopPropagation(); // evita que el modal se cierre
    try {
      const response = await fetch(src, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Extraer el nombre del archivo desde la URL
      const fileName = src.split("/").pop().split("?")[0] || "imagen.jpg";

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando la imagen:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-buttons-overlay" onClick={(e) => e.stopPropagation()}>
        <button className="download-btn" onClick={handleDownload}>⬇ Descargar</button>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      <div className="modal-image-wrapper" onClick={(e) => e.stopPropagation()}>
        <img className="modal-image" src={src} alt="Preview" />
      </div>
    </div>
  );
};

export default ImageModal;