import { useParams } from "react-router-dom";
import VoiceRoom from "./call"; // tu componente de llamadas

export default function VoiceRoomWrapper() {
  const { groupId, voiceRoomId } = useParams();

  return <VoiceRoom roomId={voiceRoomId} groupId={groupId} />;
}
