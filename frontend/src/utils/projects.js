import { apiFetch } from "./apiClient";

export const createProject = (name, description, groupId, start_date = null, deadline = null, collaborators = []) =>
  apiFetch("projects", {
    method: "POST",
    body: JSON.stringify({ 
      name, 
      description, 
      groupId, 
      start_date, 
      deadline, 
      collaborators 
    }),
  });

export const getProjects = (groupId) =>
  apiFetch(`api/groups/${groupId}/projects`);