import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import Modal from "components/modal/Modal";
import Separator from "components/separator/Separator";
import Button from "components/button/Button";
import { useGroups } from "hooks/useGroups";
import { useCreateGroupModal } from "hooks/useCreateGroupModal";
import CreateGroupModal from "components/groups/CreateGroupModal";
import "./Sidebar.css";

const NAV_ITEMS = [
  { path: "/home", label: "H" },
  { path: "/Favorites", label: "GD" },
  { path: "/calendar", label: "C" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const { groups, addGroup } = useGroups();
  const {
    name,
    setName,
    availableUsers,
    selectedCollaborators,
    selectCollaborator,
    removeCollaborator,
    reset,
  } = useCreateGroupModal(isOpen);

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
        <div
          key={path}
          className={`sidebar-item-wrapper ${
            location.pathname === path ? "active" : ""
          }`}
        >
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
        <div
          key={group.id}
          className={`sidebar-item-wrapper ${
            location.pathname === `/groups/${group.id}` ? "active" : ""
          }`}
        >
          <div className="pill" />
          <Button
            className="button-general"
            text={group.name[0].toUpperCase()}
            onClick={() => navigate(`/groups/${group.id}`)}
          />
        </div>
      ))}

      {/* Usamos el modal separado */}
      <CreateGroupModal
        isOpen={isOpen}
        handleClose={handleClose}
        name={name}
        setName={setName}
        availableUsers={availableUsers}
        selectedCollaborators={selectedCollaborators}
        selectCollaborator={selectCollaborator}
        removeCollaborator={removeCollaborator}
        handleCreate={handleCreate}
      />
    </aside>
  );
};

export default Sidebar;