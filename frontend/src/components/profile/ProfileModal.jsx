import React, { useRef } from "react";
import Modal from "components/modal/Modal";
import { FaCircle, FaTimesCircle, FaQuestionCircle, FaMinusCircle, FaCamera } from "react-icons/fa";
import { updateProfilePic } from "utils/profile";

const ROL_LABEL = { 1: "Owner", 2: "Admin", 3: "IT", 4: "Técnico" };

const StatusIcon = ({ status }) => {
  if (status === 1) return <><FaCircle className="icon activo" /> Activo</>;
  if (status === 2) return <><FaTimesCircle className="icon desactivado" /> Desactivado</>;
  if (status === 3) return <><FaMinusCircle className="icon no-molestar" /> No molestar</>;
  return <><FaQuestionCircle className="icon desconocido" /> Desconocido</>;
};

const ProfileModal = ({ isOpen, onClose, perfil, onPicUpdated, onLogout }) => {
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3001/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      await updateProfilePic(data.url);
      onPicUpdated?.(data.url);
    } catch (err) {
      console.error("Error subiendo foto:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Body>

        <div className="profile-pic-wrapper" onClick={() => fileRef.current.click()}>
          {perfil?.profile_pic ? (
            <img
              src={`http://localhost:3001${perfil.profile_pic}`}
              alt="Foto de perfil"
              className="profile-pic"
            />
          ) : (
            <div className="profile-pic-placeholder">
              {perfil?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <span className="profile-pic-overlay"><FaCamera /></span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <p>{perfil?.name}</p>
        <p>{perfil?.email}</p>
        <p>{ROL_LABEL[perfil?.rol] ?? "Invitado"}</p>
        <div className="status-container">
          <StatusIcon status={perfil?.status} />
        </div>
        <button className="log-out" onClick={onLogout}>Cerrar sesión</button>

      </Modal.Body>
    </Modal>
  );
};

export default ProfileModal;