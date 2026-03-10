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
export const fetchGroupDetails = (groupId) =>
apiFetch(`groups/${groupId}/details`).then(data => ({
  ...data,
  projects: data.projects.map(p => ({ ...p, activities: p.activities || [] }))
}));

export const fetchAllUsers = () => apiFetch("allusers");