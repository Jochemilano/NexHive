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
apiFetch(`groups/${groupId}/details`).then(data => {
  // Map para agrupar proyectos y sus actividades
  const projectsMap = {};

  data.projects.forEach(row => {
    // Si no existe el proyecto en el map, lo creamos
    if (!projectsMap[row.project_id]) {
      projectsMap[row.project_id] = {
        id: row.project_id,
        name: row.project_name,
        activities: []
      };
    }

    // Si hay actividad en la fila, la agregamos al proyecto
    if (row.activity_id) {
      projectsMap[row.project_id].activities.push({
        id: row.activity_id,
        name: row.activity_name,
        description: row.activity_description,
        status: row.activity_status,
        start_date: row.start_date ? new Date(row.start_date) : null,
        deadline: row.deadline ? new Date(row.deadline) : null
      });
    }
  });

  return {
    channels: data.channels,
    projects: Object.values(projectsMap)
  };
});

export const fetchAllUsers = () => apiFetch("allusers");