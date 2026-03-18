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

// Traer detalles de un grupo
// El backend ya devuelve { channels, projects } con projects agrupados:
// projects: [{ id, name, activities: [...] }]
export const fetchGroupDetails = (groupId) =>
  apiFetch(`groups/${groupId}/details`);

export const fetchAllUsers = () => apiFetch("allusers");