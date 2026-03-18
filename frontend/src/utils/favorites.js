import { apiFetch } from "./apiClient";

// ── Obtener favoritos de un usuario
export const getUserFavorites = async (userId) => {
  return apiFetch(`users/${userId}/favorites`);
};

// ── Función opcional para formatear fechas (UI)
export const formatDate = (dateString) =>
  new Date(dateString).toLocaleString();