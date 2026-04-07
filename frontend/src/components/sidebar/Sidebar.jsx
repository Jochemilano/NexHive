import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPlus, FaCog, FaUserAlt } from "react-icons/fa";
import Modal from "@/components/modal/Modal";
import Separator from "@/components/separator/Separator";
import Button from "@/components/button/Button";
import { useGroups } from "@/hooks/useGroups";
import { useCreateGroupModal } from "@/hooks/useCreateGroupModal";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import "./Sidebar.css";
import UserPreferencesModal from '@/components/profile/UserPreferencesModal';
import { preferencesApi } from "@/utils/preferences";
import ProfileModal from '@/components/profile/ProfileModal';
import { getProfile } from "@/utils/profile";

const NAV_ITEMS = [
  { path: "/home",      label: "H",  tooltip: "Home" },
  { path: "/Favorites", label: "GD", tooltip: "Favoritos" },
  { path: "/calendar",  label: "C",  tooltip: "Calendario" },
];

const SidebarItem = ({ label, tooltip, isActive, onClick, children }) => {
  const [show, setShow] = useState(false);
  const [y, setY] = useState(0);
  const ref = useRef(null);

  const handleMouseEnter = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setY(rect.top + rect.height / 2);
    setShow(true);
  };

  return (
    <div
      ref={ref}
      className={`sidebar-item-wrapper ${isActive ? "active" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      <div className="pill" />
      {children ? (
        children
      ) : (
        <Button className="button-general" text={label} onClick={onClick} />
      )}
      {tooltip && (
        <div
          className={`sidebar-tooltip ${show ? "visible" : ""}`}
          style={{ top: y, transform: `translateY(-50%) translateX(${show ? "0px" : "-4px"})` }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

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
      const themeClass = saved.theme === "light" ? "" : saved.theme;
      document.body.className = themeClass;
    } catch (err) {
      alert("Error guardando preferencias: " + err.message);
    }
  };

  useEffect(() => {
    const fetchPrefs = async () => {
      const prefs = await preferencesApi.getPreferences();
      if (prefs) setUserPreferences(prefs);
    };
    fetchPrefs();
  }, []);

  return (
    <aside className="sidebar">

      {/* ── HEADER FIJO: nav items ── */}
      <div className="sidebar-header">
        {NAV_ITEMS.map(({ path, label, tooltip }) => (
          <SidebarItem
            key={path}
            label={label}
            tooltip={tooltip}
            isActive={location.pathname === path}
            onClick={() => navigate(path)}
          />
        ))}
        <Separator />
      </div>

      {/* ── GRUPOS CON SCROLL ── */}
      <div className="sidebar-groups">
        <SidebarItem tooltip="Nuevo grupo">
          <Modal.Button className="modal-button" onClick={() => setIsOpen(true)}>
            <FaPlus />
          </Modal.Button>
        </SidebarItem>

        {groups.map(group => (
          <SidebarItem
            key={group.id}
            label={group.name[0].toUpperCase()}
            tooltip={group.name}
            isActive={location.pathname === `/groups/${group.id}`}
            onClick={() => navigate(`/groups/${group.id}`)}
          />
        ))}
      </div>

      {/* ── FOOTER FIJO: config y perfil ── */}
      <div className="sidebar-footer">
        <Separator />
        <SidebarItem tooltip="Preferencias">
          <Button onClick={() => setIsPreferencesOpen(true)}>
            <FaCog />
          </Button>
        </SidebarItem>
        <SidebarItem tooltip="Perfil">
          <Button onClick={() => setIsProfileOpen(true)}>
            <FaUserAlt />
          </Button>
        </SidebarItem>
      </div>

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