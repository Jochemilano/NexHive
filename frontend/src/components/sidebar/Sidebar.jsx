import Modal from "components/modal/Modal";
import Separator from "components/separator/Separator";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "components/button/Button";
import { useState, useEffect } from "react";
import Input from "components/input/Input";
import { FaPlus, FaTimes } from "react-icons/fa";
import React from "react";
import "./Sidebar.css";
import { fetchGroups, createGroup, fetchAllUsers } from "utils/groups";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([]);

  const [allUsers, setAllUsers] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const data = await fetchGroups();
        setGroups(data);
      } catch (err) {
        console.error("Error cargando grupos:", err);
      }
    };
    loadGroups();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const users = await fetchAllUsers();
      setAllUsers(users);
      const userId = parseInt(localStorage.getItem('userId')) || null;
      setCurrentUserId(userId);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  const handleSelectCollaborator = (e) => {
    const userId = parseInt(e.target.value);
    if (!userId) return;
    const user = allUsers.find(u => u.id === userId);
    if (user && !selectedCollaborators.find(c => c.id === userId)) {
      setSelectedCollaborators(prev => [...prev, user]);
    }
    e.target.value = "";
  };

  const handleRemoveCollaborator = (userId) => {
    setSelectedCollaborators(prev => prev.filter(c => c.id !== userId));
  };

  const availableUsers = allUsers.filter(user => {
    if (user.id === currentUserId) return false;
    if (selectedCollaborators.find(c => c.id === user.id)) return false;
    return true;
  });

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para el grupo");
      return;
    }
    try {
      const collaboratorIds = selectedCollaborators.map(c => c.id);
      const newGroup = await createGroup(name, collaboratorIds);
      setGroups(prev => [...prev, newGroup]);
      setName("");
      setSelectedCollaborators([]);
      setIsOpen(false);
    } catch (err) {
      console.error("Error creando grupo:", err);
      alert("Error al crear el grupo");
    }
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setName("");
    setSelectedCollaborators([]);
  };

  return (
    <aside className="sidebar">
      <div className={`sidebar-item-wrapper ${location.pathname === "/home" ? "active" : ""}`}>
        <div className="pill"></div>
        <Button className="button-general" text="H" onClick={() => navigate("/home")} />
      </div>

      <div className={`sidebar-item-wrapper ${location.pathname === "/call" ? "active" : ""}`}>
        <div className="pill"></div>
        <Button className="button-general" text="CLL" onClick={() => navigate("/call")} />
      </div>

      <div className={`sidebar-item-wrapper ${location.pathname === "/saved" ? "active" : ""}`}>
        <div className="pill"></div>
        <Button className="button-general" text="GD" onClick={() => navigate("/saved")} />
      </div>

      <div className={`sidebar-item-wrapper ${location.pathname === "/calendar" ? "active" : ""}`}>
        <div className="pill"></div>
        <Button className="button-general" text="C" onClick={() => navigate("/calendar")} />
      </div>

      <Separator />

      <div className="sidebar-item-wrapper">
        <div className="pill"></div>
        <Modal.Button className="modal-button" onClick={() => setIsOpen(true)}>
          <FaPlus />
        </Modal.Button>
      </div>

      {groups.map(group => {
        const isActive = location.pathname === `/groups/${group.id}`;
        return (
          <div key={group.id} className={`sidebar-item-wrapper ${isActive ? "active" : ""}`}>
            <div className="pill"></div>
            <Button
              className="button-general"
              text={group.name[0].toUpperCase()}
              onClick={() => navigate(`/groups/${group.id}`)}
            />
          </div>
        );
      })}

      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <Modal.Header onClose={handleCloseModal}>Crea un grupo</Modal.Header>
        <Modal.Body>
          <Input
            label="Nombre del grupo"
            type="text"
            placeholder="Dinos el nombre del grupo"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div style={{ marginTop: "20px" }}>
            <label htmlFor="collaborator-select" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Agregar colaboradores
            </label>
            <select
              id="collaborator-select"
              onChange={handleSelectCollaborator}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", cursor: "pointer" }}
              defaultValue=""
            >
              <option value="" disabled>
                {availableUsers.length > 0 ? "-- Selecciona un colaborador --" : "No hay más usuarios disponibles"}
              </option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username || `Usuario ${user.id}`}
                </option>
              ))}
            </select>
          </div>

          {selectedCollaborators.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <p style={{ marginBottom: "10px", fontWeight: "500", fontSize: "14px" }}>
                Colaboradores seleccionados ({selectedCollaborators.length}):
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {selectedCollaborators.map(collaborator => (
                  <li key={collaborator.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", marginBottom: "6px", backgroundColor: "#f5f5f5", borderRadius: "6px", fontSize: "14px" }}>
                    <span>{collaborator.name || collaborator.username || `Usuario ${collaborator.id}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      style={{ background: "transparent", border: "none", color: "#e74c3c", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer onClose={handleCloseModal}>
          <Modal.AcceptButton onClick={handleCreateGroup}>Crear</Modal.AcceptButton>
        </Modal.Footer>
      </Modal>
    </aside>
  );
};

export default Sidebar;