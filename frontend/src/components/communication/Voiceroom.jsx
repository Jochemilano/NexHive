import React, { useEffect, useRef } from "react";
import { useVoiceRoom } from "hooks/usevoiceroom";
import {
  FaMicrophone, FaMicrophoneSlash,
  FaVideo, FaVideoSlash,
  FaDesktop, FaSignOutAlt,
} from "react-icons/fa";

// ── Tile de participante remoto ───────────────────────────
const RemoteTile = ({ participant }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream)
      videoRef.current.srcObject = participant.stream;
  }, [participant.stream]);

  return (
    <div className="voice-tile">
      <video ref={videoRef} autoPlay playsInline className="voice-video" />
      <div className="voice-tile-label">{participant.userName}</div>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────
const VoiceRoom = ({ voiceRoomId }) => {
  const localVideoRef = useRef(null);

  const {
    localStreamRef,
    participants,
    isMicOn,
    isCameraOn,
    sharingScreen,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    leaveRoom,
  } = useVoiceRoom(voiceRoomId);

  // Apuntar el video local al stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current)
      localVideoRef.current.srcObject = localStreamRef.current;
  }, [localStreamRef.current]);

  const handleScreenShare = async () => {
    if (sharingScreen) {
      const stream = stopScreenShare();
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } else {
      const stream = await startScreenShare();
      if (localVideoRef.current && stream) localVideoRef.current.srcObject = stream;
    }
  };

  const totalParticipants = participants.length + 1;

  return (
    <div className="voice-room-container">
      <div className="voice-room-header">
        <h3>Sala de Voz</h3>
        <span>{totalParticipants} participante{totalParticipants !== 1 ? "s" : ""}</span>
      </div>

      <div className={`voice-video-grid participants-${totalParticipants}`}>
        <div className="voice-tile">
          <video ref={localVideoRef} autoPlay playsInline muted className="voice-video" />
          <div className="voice-tile-label">
            Tú {!isMicOn && <FaMicrophoneSlash />}
          </div>
        </div>
        {participants.map(p => <RemoteTile key={p.userId} participant={p} />)}
      </div>

      <div className="voice-controls">
        <button onClick={toggleMic} className={`control-btn ${isMicOn ? "on" : "off"}`}>
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={toggleCamera} className={`control-btn ${isCameraOn ? "on" : "off"}`}>
          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
        <button onClick={handleScreenShare} className="control-btn warning">
          <FaDesktop /> {sharingScreen ? "Compartiendo" : "Pantalla"}
        </button>
        <button onClick={leaveRoom} className="control-btn danger">
          <FaSignOutAlt /> Salir
        </button>
      </div>
    </div>
  );
};

export default VoiceRoom;