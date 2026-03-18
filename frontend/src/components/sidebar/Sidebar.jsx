import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaTimes } from "react-icons/fa";
import Modal from "components/modal/Modal";
import Separator from "components/separator/Separator";
import Button from "components/button/Button";
import Input from "components/input/Input";
import { useGroups } from "hooks/useGroups";
import { useCreateGroupModal } from "hooks/useCreateGroupModal";
import "./Sidebar.css";

const NAV_ITEMS = [
  { path: "/home",     label: "H"  },
  { path: "/saved",    label: "GD" },
  { path: "/calendar", label: "C"  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const { groups, addGroup } = useGroups();
  const { name, setName, availableUsers, selectedCollaborators,
          selectCollaborator, removeCollaborator, reset } = useCreateGroupModal(isOpen);

  const handleCreate = async () => {
    if (!name.trim()) return alert("Por favor ingresa un nombre para el grupo");
    try {
      await addGroup(name, selectedCollaborators.map(c => c.id));
      handleClose();
    } catch {
      alert("Error al crear el grupo");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <aside className="sidebar">
      {NAV_ITEMS.map(({ path, label }) => (
        <div key={path} className={`sidebar-item-wrapper ${location.pathname === path ? "active" : ""}`}>
          <div className="pill" />
          <Button className="button-general" text={label} onClick={() => navigate(path)} />
        </div>
      ))}

      <Separator />

      <div className="sidebar-item-wrapper">
        <div className="pill" />
        <Modal.Button className="modal-button" onClick={() => setIsOpen(true)}>
          <FaPlus />
        </Modal.Button>
      </div>

      {groups.map(group => (
        <div key={group.id} className={`sidebar-item-wrapper ${location.pathname === `/groups/${group.id}` ? "active" : ""}`}>
          <div className="pill" />
          <Button
            className="button-general"
            text={group.name[0].toUpperCase()}
            onClick={() => navigate(`/groups/${group.id}`)}
          />
        </div>
      ))}

      <Modal isOpen={isOpen} onClose={handleClose}>
        <Modal.Header onClose={handleClose}>Crea un grupo</Modal.Header>
        <Modal.Body>
          <Input label="Nombre del grupo" type="text" placeholder="Dinos el nombre del grupo"
            value={name} onChange={e => setName(e.target.value)} />

          <div style={{ marginTop: "20px" }}>
            <label htmlFor="collaborator-select" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Agregar colaboradores
            </label>
            <select id="collaborator-select" onChange={selectCollaborator} defaultValue=""
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" }}>
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
              <ul style={{ listStyle: "none", padding: 0 }}>
                {selectedCollaborators.map(c => (
                  <li key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", marginBottom: "6px", backgroundColor: "#f5f5f5", borderRadius: "6px", fontSize: "14px" }}>
                    <span>{c.name || c.username || `Usuario ${c.id}`}</span>
                    <button type="button" onClick={() => removeCollaborator(c.id)}
                      style={{ background: "transparent", border: "none", color: "#e74c3c", cursor: "pointer" }}>
                      <FaTimes />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer onClose={handleClose}>
          <Modal.AcceptButton onClick={handleCreate}>Crear</Modal.AcceptButton>
        </Modal.Footer>
      </Modal>
    </aside>
  );
};

export default Sidebar;