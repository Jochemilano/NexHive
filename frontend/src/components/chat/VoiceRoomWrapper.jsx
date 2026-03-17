import { useParams } from "react-router-dom";
import VoiceRoom from "./Voiceroom";

export default function VoiceRoomWrapper() {
  const { groupId, voiceRoomId } = useParams();
  return <VoiceRoom voiceRoomId={voiceRoomId} groupId={groupId} />;
}