const BASE_URL = "http://localhost:3001/api";

export const apiFetch = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      let errorData = {};
      try { errorData = await res.json(); } catch (e) {}
      throw new Error(errorData.message || "Error en la API");
    }

    return await res.json();
  } catch (err) {
    console.error("API Fetch Error:", err);
    throw err;
  }
};