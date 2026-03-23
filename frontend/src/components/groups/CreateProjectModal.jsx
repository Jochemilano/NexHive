import React, { useState } from "react";
import Modal from "components/modal/Modal";
import { Input, Textarea } from "components/input/Input";
import { createProject } from "utils/projects";
import { FaTimes } from "react-icons/fa";

const CreateProjectModal = ({
  isOpen,
  onClose,
  groupId,
  availableUsers = [],
  onCreated
}) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  const selectCollaborator = (e) => {
    const userId = parseInt(e.target.value);
    const user = availableUsers.find(u => u.id === userId);
    if (user && !selectedCollaborators.some(c => c.id === userId)) {
      setSelectedCollaborators([...selectedCollaborators, user]);
    }
  };

  const removeCollaborator = (userId) => {
    setSelectedCollaborators(selectedCollaborators.filter(c => c.id !== userId));
  };

  const handleCreate = async () => {
    if (!projectName.trim()) return;

    try {
      const newProject = await createProject(
        projectName,
        projectDescription,
        groupId,
        startDate || null,
        deadline || null,
        selectedCollaborators.map(c => c.id)
      );
      onCreated(newProject);
      // reset
      setProjectName("");
      setProjectDescription("");
      setStartDate("");
      setDeadline("");
      setSelectedCollaborators([]);
      onClose();
    } catch (err) {
      console.error("Error creando proyecto:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>Crear Proyecto</Modal.Header>
      <Modal.Body>
        <Input
          label="Nombre del proyecto"
          type="text"
          placeholder="Escribe el nombre de tu proyecto"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
        />
        <Textarea
          label="Descripción del proyecto"
          placeholder="Danos una breve descripción de tu proyecto"
          value={projectDescription}
          onChange={e => setProjectDescription(e.target.value)}
        />
        <Input
          label="Fecha de inicio"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <Input
          label="Fecha límite"
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />

        {/* Colaboradores */}
        <div style={{ marginTop: "20px" }}>
          <label
            htmlFor="collaborator-select"
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            Agregar colaboradores
          </label>
          <select
            id="collaborator-select"
            onChange={selectCollaborator}
            defaultValue=""
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "14px"
            }}
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

        {selectedCollaborators.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <p style={{ marginBottom: "10px", fontWeight: "500", fontSize: "14px" }}>
              Colaboradores seleccionados ({selectedCollaborators.length}):
            </p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {selectedCollaborators.map(c => (
                <li
                  key={c.id}
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
                  <span>{c.name || c.username || `Usuario ${c.id}`}</span>
                  <button
                    type="button"
                    onClick={() => removeCollaborator(c.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#e74c3c",
                      cursor: "pointer"
                    }}
                  >
                    <FaTimes />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer onClose={onClose}>
        <Modal.AcceptButton type="button" onClick={handleCreate}>
          Crear
        </Modal.AcceptButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateProjectModal;