import { apiFetch } from "@/utils/apiClient";
import { CONFIG } from "./config";

// ── URLs ─────────────────────────────
export const getFileUrl = (path) => {
  if (!path) return "";
  return `${CONFIG.BASE_URL}${path}`;
};

// ── Mensajes ─────────────────────────
export const toggleFavoriteMessage = async (messageId) => {
  return apiFetch(`messages/${messageId}/favorite`, {
    method: "POST",
  });
};

// ── Helpers ──────────────────────────
export const getFileName = (path) => path?.split("/").pop() || "";

export const isMine = (msg, userId) =>
  Number(msg.sender_id) === Number(userId);