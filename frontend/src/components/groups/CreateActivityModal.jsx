// components/groups/CreateActivityModal
import React, { useState } from "react";
import Modal from "@/components/modal/Modal";
import { Input, Textarea, Select } from "@/components/input/Input";

const CreateActivityModal = ({ isOpen, onClose, currentProjectId, onCreated }) => {
  const [activityName, setActivityName] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [activityStatus, setActivityStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleCreate = async () => {
    if (!activityName.trim() || !currentProjectId) return;

    try {
      const { createActivity } = await import("@/utils/activities");
      const newActivity = await createActivity({
        name: activityName,
        description: activityDescription,
        status: activityStatus,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        projectId: currentProjectId
      });

      onCreated(newActivity); // Pasamos la actividad al padre
      setActivityName("");
      setActivityDescription("");
      setActivityStatus("");
      setStartDate("");
      setDeadline("");
      onClose();
    } catch (err) {
      console.error("Error creando actividad:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>Crear Actividad</Modal.Header>
      <Modal.Body>
        <Input
          label="Nombre de la actividad"
          type="text"
          placeholder="¿Qué vas a hacer?"
          value={activityName}
          onChange={e => setActivityName(e.target.value)}
        />
        <Textarea
          label="Descripción de la actividad"
          placeholder="¿Cómo lo vas a hacer?, ¿Algo más que comentar?"
          value={activityDescription}
          onChange={e => setActivityDescription(e.target.value)}
        />
        <Select
          label="Estado de la actividad"
          value={activityStatus}
          onChange={e => setActivityStatus(e.target.value)}
          options={[
            { value: "in_progress", label: "In progress" },
            { value: "done", label: "Done" },
            { value: "pending", label: "Pending" },
          ]}
        />
        <Input
          label="Fecha de inicio"
          type="datetime-local"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <Input
          label="Fecha de entrega"
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer onClose={onClose}>
        <Modal.AcceptButton type="button" onClick={handleCreate}>Crear</Modal.AcceptButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateActivityModal;