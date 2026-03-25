import Modal from "components/modal/Modal";
import Input from "components/input/Input";
import CollaboratorPicker from "components/input/CollaboratorPicker";

const CreateGroupModal = ({
  isOpen,
  handleClose,
  name,
  setName,
  availableUsers,
  selectedCollaborators,
  selectCollaborator,
  removeCollaborator,
  handleCreate
}) => {
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header onClose={handleClose}>Crea un grupo</Modal.Header>
      <Modal.Body>
        <Input
          label="Nombre del grupo"
          type="text"
          placeholder="Dinos el nombre del grupo"
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
      <Modal.Footer onClose={handleClose}>
        <Modal.AcceptButton onClick={handleCreate}>Crear</Modal.AcceptButton>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGroupModal;