import Modal from "components/modal/Modal";
import Separator from "components/separator/Separator";
import { useNavigate } from "react-router-dom";
import Button from "components/button/Button";
import { useState, useEffect } from "react";
import Input from "components/input/Input";
import { FaPlus, FaTimes } from "react-icons/fa";
import React from "react";
import "./Sidebar.css";
import { fetchGroups, createGroup, fetchAllUsers } from "utils/groups";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [groups, setGroups] = useState([]);
  
  // Estados para colaboradores
  const [allUsers, setAllUsers] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Cargar grupos al iniciar
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

  // ✅ Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // ✅ Cargar todos los usuarios
  const loadUsers = async () => {
    try {
      const users = await fetchAllUsers();
      setAllUsers(users);
      
      // ✅ Obtener ID del usuario actual (asumiendo que está en localStorage)
      const userId = parseInt(localStorage.getItem('userId')) || null;
      setCurrentUserId(userId);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    }
  };

  // ✅ Agregar colaborador a la lista
  const handleSelectCollaborator = (e) => {
    const userId = parseInt(e.target.value);
    if (!userId) return;

    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    // Agregar a la lista si no está ya
    if (!selectedCollaborators.find(c => c.id === userId)) {
      setSelectedCollaborators(prev => [...prev, user]);
    }

    // Resetear el select
    e.target.value = "";
  };

  // ✅ Remover colaborador de la lista
  const handleRemoveCollaborator = (userId) => {
    setSelectedCollaborators(prev => prev.filter(c => c.id !== userId));
  };

  // ✅ Usuarios disponibles (excluir yo mismo y los ya seleccionados)
  const availableUsers = allUsers.filter(user => {
    if (user.id === currentUserId) return false; // ✅ No mostrarme a mí
    if (selectedCollaborators.find(c => c.id === user.id)) return false; // ✅ No mostrar ya seleccionados
    return true;
  });

  // Crear grupo y agregar al estado
  const handleCreateGroup = async () => {
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para el grupo");
      return;
    }

    try {
      // Extraer solo los IDs de los colaboradores
      const collaboratorIds = selectedCollaborators.map(c => c.id);
      
      const newGroup = await createGroup(name, collaboratorIds);
      setGroups(prev => [...prev, newGroup]);
      
      // Resetear formulario
      setName("");
      setSelectedCollaborators([]);
      setIsOpen(false);
    } catch (err) {
      console.error("Error creando grupo:", err);
      alert("Error al crear el grupo");
    }
  };

  // ✅ Limpiar estado al cerrar modal
  const handleCloseModal = () => {
    setIsOpen(false);
    setName("");
    setSelectedCollaborators([]);
  };

  return (
    <aside className="sidebar">
      <Button text="H" onClick={() => navigate("/home")} />
      <Button text="CLL" onClick={() => navigate("/call")} />
      <Button text="GD" onClick={() => navigate("/saved")} />
      <Button text="C" onClick={() => navigate("/calendar")} />
      <Separator />
      
      {groups.map(group => (
        <Button
          key={group.id}
          text={group.name[0].toUpperCase()}
          onClick={() => navigate(`/groups/${group.id}`)}
        />
      ))}

      <Modal.Button onClick={() => setIsOpen(true)}><FaPlus/></Modal.Button>
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <Modal.Header onClose={handleCloseModal}>Crea un grupo</Modal.Header>
        
        <Modal.Body>
          {/* Nombre del grupo */}
          <Input
            label="Nombre del grupo"
            type="text"
            placeholder="Dinos el nombre del grupo"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          
          {/* ✅ Selector de colaboradores */}
          <div style={{ marginTop: "20px" }}>
            <label 
              htmlFor="collaborator-select"
              style={{ 
                display: "block", 
                marginBottom: "8px",
                fontWeight: "500"
              }}
            >
              Agregar colaboradores
            </label>
            <select
              id="collaborator-select"
              onChange={handleSelectCollaborator}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                cursor: "pointer"
              }}
              defaultValue=""
            >
              <option value="" disabled>
                {availableUsers.length > 0 
                  ? "-- Selecciona un colaborador --" 
                  : "No hay más usuarios disponibles"}
              </option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username || `Usuario ${user.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Lista de colaboradores seleccionados */}
          {selectedCollaborators.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <p style={{ 
                marginBottom: "10px", 
                fontWeight: "500",
                fontSize: "14px"
              }}>
                Colaboradores seleccionados ({selectedCollaborators.length}):
              </p>
              <ul style={{ 
                listStyle: "none", 
                padding: 0, 
                margin: 0 
              }}>
                {selectedCollaborators.map(collaborator => (
                  <li
                    key={collaborator.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      marginBottom: "6px",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "6px",
                      fontSize: "14px"
                    }}
                  >
                    <span>
                      {collaborator.name || collaborator.username || `Usuario ${collaborator.id}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCollaborator(collaborator.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#e74c3c",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Remover colaborador"
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
          <Modal.AcceptButton onClick={handleCreateGroup}>
            Crear
          </Modal.AcceptButton>
        </Modal.Footer>
      </Modal>
    </aside>
  );
};

export default Sidebar;