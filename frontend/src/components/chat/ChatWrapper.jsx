import { useParams } from "react-router-dom";
import Chat from "./chat";

export default function ChatWrapper() {
  const { groupId, chatRoomId } = useParams();
  const userId = parseInt(localStorage.getItem("userId"));

  if (!chatRoomId) return <p>Chat no encontrado</p>;

  return <Chat roomId={chatRoomId} userId={userId} />;
}