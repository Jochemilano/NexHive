import React from "react";
import "./ImageModal.css";

const ImageModal = ({ src, onClose }) => {
  if (!src) return null;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(src, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
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
    <div className="image-modal-overlay" onClick={onClose}>

      <div className="image-modal-actions" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-btn" onClick={handleDownload}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar
        </button>
        <button className="image-modal-btn image-modal-btn--close" onClick={onClose}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="image-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <img className="image-modal-img" src={src} alt="Preview" />
      </div>

    </div>
  );
};

export default ImageModal;