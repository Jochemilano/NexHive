import { useEffect, useState } from "react";
import { socket } from "@/utils/socket";
import { getAvatarUrl } from "@/utils/media";
import "./Home.css"

export default function Home() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const currentUserId = parseInt(localStorage.getItem("userId"));

  useEffect(() => {
    socket.on("usuarios:lista", (lista) => {
      // filtra al usuario actual
      setOnlineUsers(lista.filter((u) => u.id !== currentUserId));
    });

    return () => socket.off("usuarios:lista");
  }, []);

  return (
    <div className="online-users">
      <h3>Conectados ({onlineUsers.length})</h3>
      <ul>
        {onlineUsers.map((u) => {
          const avatarUrl = getAvatarUrl(u.profile_pic);
          return (
            <li key={u.id} className="online-user-item">
              <div className="avatar-wrapper">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={u.name} className="avatar" />
                ) : (
                  <div className="avatar avatar--fallback">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="online-dot" />
              </div>
              <span className="user-name">{u.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}