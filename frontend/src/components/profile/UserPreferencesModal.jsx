import { useState, useEffect } from "react";
import Modal from "@/components/modal/Modal";
import { FaGlobe, FaPalette, FaBell } from "react-icons/fa";
import "./UserPreferencesModal.css";

const UserPreferencesModal = ({ isOpen, handleClose, initialData, onSave }) => {
  const [language, setLanguage] = useState("es");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (initialData) {
      setLanguage(initialData.language || "es");
      setTheme(initialData.theme || "light");
      setNotifications(initialData.notifications_enabled ?? true);
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    onSave({
      language,
      theme,
      notifications_enabled: notifications,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header onClose={handleClose}>
        Preferencias de Usuario
      </Modal.Header>

      <Modal.Body>
        <div className="preferences-field">
            <label className="preferences-label">
              <FaGlobe className="preferences-icon" />
              Idioma
            </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

        <div className="preferences-field">
            <label className="preferences-label">
              <FaPalette className="preferences-icon" />
              Tema
            </label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Claro (default)</option>
              <option value="theme-dark">Oscuro</option>
              <option value="theme-blue">Azul</option>
              <option value="theme-purple">Morado</option>
              <option value="theme-gray">Gris</option>
              <option value="theme-pink">Rosa</option>
            </select>
          </div>

        <div className="preferences-field preferences-field--checkbox">
          <input
            id="notifications"
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
           />

            <label htmlFor="notifications" className="preferences-label">
              <FaBell className="preferences-icon" />
              Notificaciones
             </label>
          </div>
      </Modal.Body>

      <Modal.Footer onClose={handleClose}>
        <Modal.AcceptButton onClick={handleSubmit}>
          Guardar
        </Modal.AcceptButton>
      </Modal.Footer>
    </Modal>
  );
};

export default UserPreferencesModal;