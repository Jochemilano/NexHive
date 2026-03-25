import { FaTimes } from "react-icons/fa";
import "./CollaboratorPicker.css";

const CollaboratorPicker = ({ availableUsers = [], selectedCollaborators = [], onSelect, onRemove }) => {
  return (
    <div className="collaborator-picker">
      <div className="collaborator-picker__select-wrapper">
        <label className="input-label">Agregar colaboradores</label>
        <select
          className="input-field"
          onChange={onSelect}
          value=""
        >
          <option value="" disabled>
            {availableUsers.length > 0
              ? ""
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
        <div className="collaborator-picker__list-wrapper">
          <p className="collaborator-picker__list-title">
            Colaboradores seleccionados ({selectedCollaborators.length}):
          </p>
          <ul className="collaborator-picker__list">
            {selectedCollaborators.map(c => (
              <li key={c.id} className="collaborator-picker__item">
                <span>{c.name || c.username || `Usuario ${c.id}`}</span>
                <button
                  type="button"
                  onClick={() => onRemove(c.id)}
                  className="collaborator-picker__remove-btn"
                >
                  <FaTimes />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CollaboratorPicker;