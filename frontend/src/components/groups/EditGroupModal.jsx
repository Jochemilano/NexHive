import { useState, useEffect } from "react";
import { fetchAllUsers, fetchGroupUsers } from "@/utils/groups";
import Modal from "@/components/modal/Modal";
import Input from "@/components/input/Input";
import CollaboratorPicker from "@/components/input/CollaboratorPicker";
import "./GroupModal.css";

const EditGroupModal = ({ isOpen, group, onClose, onUpdated }) => {
  const [name, setName]                           = useState("");
  const [allUsers, setAllUsers]                   = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [currentUserId, setCurrentUserId]         = useState(null);
  const [imageFile, setImageFile]                 = useState(null);
  const [imagePreview, setImagePreview]           = useState(null);

  useEffect(() => {
    if (!isOpen || !group) return;
    setName(group.name || "");
    setImagePreview(group.image_url || null);
    setImageFile(null);

    const uid = parseInt(localStorage.getItem("userId")) || null;
    setCurrentUserId(uid);

    fetchAllUsers()
      .then(users => {
        setAllUsers(users);
        // pre-seleccionar integrantes actuales menos el usuario mismo
        fetchGroupUsers(group.id)
          .then(members => {
            setSelectedCollaborators(members.filter(m => m.id !== uid));
          })
          .catch(() => setSelectedCollaborators([]));
      })
      .catch(err => console.error("Error cargando usuarios:", err));
  }, [isOpen, group]);

  const availableUsers = allUsers.filter(
    u => u.id !== currentUserId && !selectedCollaborators.find(c => c.id === u.id)
  );

  const selectCollaborator = (e) => {
    const userId = parseInt(e.target.value);
    if (!userId) return;
    const user = allUsers.find(u => u.id === userId);
    if (user) setSelectedCollaborators(prev => [...prev, user]);
    e.target.value = "";
  };

  const removeCollaborator = (userId) =>
    setSelectedCollaborators(prev => prev.filter(c => c.id !== userId));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("El nombre no puede estar vacío");
    try {
      await onUpdated(group.id, name, selectedCollaborators.map(c => c.id), imageFile);
    } catch {
      alert("Error al actualizar el grupo");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>Editar grupo</Modal.Header>
      <Modal.Body>
        <div className="group-image-picker">
          <label className="group-image-label" htmlFor="edit-group-image-input">
            {imagePreview
              ? <img src={imagePreview} alt="preview" className="group-image-preview" />
              : <span className="group-image-placeholder">+</span>
            }
          </label>
          <input
            id="edit-group-image-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </div>
        <Input
          label="Nombre del grupo"
          type="text"
          placeholder="Nombre del grupo"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <CollaboratorPicker
          availableUsers={availableUsers}
          selectedCollaborators={selectedCollaborators}
          onSelect={selectCollaborator}
          onRemove={removeCollaborator}
        />
      </Modal.Body>
      <Modal.Footer onClose={onClose}>
        <Modal.AcceptButton onClick={handleSave}>Guardar</Modal.AcceptButton>
      </Modal.Footer>
    </Modal>
  );
};

export default EditGroupModal;