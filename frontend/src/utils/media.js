import { CONFIG } from "./config";

export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith("http")) return avatarPath;

  const path = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
  return `${CONFIG.BASE_URL}${path}`;
};