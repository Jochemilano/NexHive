import { apiFetch } from "./apiClient";

export const preferencesApi = {
  getPreferences: async () => {
    try {
      const res = await apiFetch("preferences", { method: "GET" });
      return res.preferences || null;
    } catch (err) {
      console.error("Error cargando preferencias:", err);
      return null;
    }
  },

  savePreferences: async (data) => {
    try {
      const res = await apiFetch("preferences", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.preferences;
    } catch (err) {
      console.error("Error guardando preferencias:", err);
      throw err;
    }
  },
};