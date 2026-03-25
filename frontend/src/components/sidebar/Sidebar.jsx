import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaCog, FaUserAlt } from "react-icons/fa";
import Modal from "components/modal/Modal";
import Separator from "components/separator/Separator";
import Button from "components/button/Button";
import { useGroups } from "hooks/useGroups";
import { useCreateGroupModal } from "hooks/useCreateGroupModal";
import CreateGroupModal from "components/groups/CreateGroupModal";
import "./Sidebar.css";
import UserPreferencesModal from 'components/profile/UserPreferencesModal';
import { preferencesApi } from "utils/preferences";
import ProfileModal from 'components/profile/ProfileModal';
import { getProfile } from "utils/profile";

const NAV_ITEMS = [
  { path: "/home", label: "H" },
  { path: "/Favorites", label: "GD" },
  { path: "/calendar", label: "C" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [perfil, setPerfil] = useState(null);

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

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };
  
  useEffect(() => {
    getProfile()
      .then(setPerfil)
      .catch((err) => console.error("Error al traer perfil:", err));
  }, []);

  const handlePicUpdated = (nuevaRuta) => {
    setPerfil((prev) => ({ ...prev, profile_pic: nuevaRuta }));
  };
  
  const handleSavePreferences = async (data) => {
    try {
      const saved = await preferencesApi.savePreferences(data);
      setUserPreferences(saved);
      setIsPreferencesOpen(false);

      // Aplicar tema al instante
      const themeClass = saved.theme === "light" ? "" : saved.theme;
      document.body.className = themeClass;
      
    } catch (err) {
      alert("Error guardando preferencias: " + err.message);
    }
  };

  // Al cargar la app o el sidebar
  useEffect(() => {
    const fetchPrefs = async () => {
      const prefs = await preferencesApi.getPreferences();
      if (prefs) setUserPreferences(prefs);
    };
    fetchPrefs();
  }, []);

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
      <Separator />
      <div className="sidebar-item-wrapper">
        <Button onClick={() => setIsPreferencesOpen(true)}>
          <FaCog />
        </Button>
      </div>
      <div className="sidebar-item-wrapper">
        <Button onClick={() => setIsProfileOpen(true)}>
          <FaUserAlt />
        </Button>
      </div>

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
      <UserPreferencesModal
        isOpen={isPreferencesOpen}
        handleClose={() => setIsPreferencesOpen(false)}
        initialData={userPreferences}
        onSave={handleSavePreferences}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        perfil={perfil}
        onPicUpdated={handlePicUpdated}
        onLogout={logout}
      />
    </aside>
  );
};

export default Sidebar;