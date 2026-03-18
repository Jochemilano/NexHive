import React, { useState } from "react";
import Modal from "components/modal/Modal";
import { Input, Textarea } from "components/input/Input";
import { createProject } from "utils/projects";

const CreateProjectModal = ({ isOpen, onClose, groupId, onCreated }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreate = async () => {
    if (!projectName.trim()) return;

    try {
      const newProject = await createProject(projectName, projectDescription, groupId);
      onCreated(newProject); // Pasamos el proyecto al padre
      setProjectName("");
      setProjectDescription("");
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
      </Modal.Body>
      <Modal.Footer onClose={onClose}>
        <Modal.AcceptButton type="button" onClick={handleCreate}>Crear</Modal.AcceptButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateProjectModal;