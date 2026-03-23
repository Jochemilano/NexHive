import { apiFetch } from "./apiClient";

// Traer grupos del usuario
export const fetchGroups = () => apiFetch("groups");

// Crear un grupo nuevo
export const createGroup = (name, collaboratorIds = []) => {
  if (!name.trim()) throw new Error("Nombre vacío");

  return apiFetch("groups", {
    method: "POST",
    body: JSON.stringify({
      name,
      collaborators: collaboratorIds,
    }),
  });
};

// Traer detalles de un grupo (canales + proyectos)
export const fetchGroupDetails = (groupId) =>
  apiFetch(`groups/${groupId}/details`);

// Traer todos los usuarios de un grupo
export const fetchGroupUsers = (groupId) =>
  apiFetch(`groups/${groupId}/users`);

export const fetchAllUsers = () => apiFetch("allusers");