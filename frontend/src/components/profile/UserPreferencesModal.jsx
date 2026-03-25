import { useState, useEffect } from "react";
import Modal from "components/modal/Modal";

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
        <div className="modal-field">
          <label>Idioma</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="modal-field">
        <label>Tema</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="light">Claro (default)</option>
            <option value="theme-dark">Oscuro</option>
            <option value="theme-dark-pro">Oscuro Pro</option>
            <option value="theme-purple">Morado</option>
        </select>
        </div>

        <div className="modal-field">
          <label>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
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