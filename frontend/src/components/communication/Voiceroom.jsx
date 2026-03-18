import React, { useEffect, useRef, useState } from "react";
import { socket } from "utils/socket";
import Peer from "simple-peer";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaSignOutAlt } from "react-icons/fa";

const VoiceRoom = ({ voiceRoomId, groupId }) => {
  const localStreamRef  = useRef(null);
  const localVideoRef   = useRef(null);
  const peersRef        = useRef({});
  const joinedRef       = useRef(false); // ← evita doble join en StrictMode

  const [participants, setParticipants] = useState([]);
  const [isMicOn, setIsMicOn]           = useState(true);
  const [isCameraOn, setIsCameraOn]     = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);

  useEffect(() => {
    if (joinedRef.current) return; // StrictMode monta dos veces, ignorar el segundo
    joinedRef.current = true;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.originalVideoTrack = stream.getVideoTracks()[0];
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        socket.emit("join-voice-room", { voiceRoomId });
      } catch (err) {
        console.error("Error de media:", err);
      }
    };

    init();

    // Quiénes ya están → nosotros somos initiator hacia cada uno
    socket.on("voice-room-users", ({ users }) => {
      users.forEach(({ userId, userName }) => {
        if (!peersRef.current[userId]) createPeer(userId, userName, true);
      });
    });

    // Alguien nuevo entró → ellos son initiator, nosotros receiver
    socket.on("voice-user-joined", ({ userId, userName }) => {
      if (!peersRef.current[userId]) createPeer(userId, userName, false);
    });

    // Señal WebRTC
    socket.on("voice-signal", ({ fromUserId, signal }) => {
      peersRef.current[fromUserId]?.signal(signal);
    });

    // Alguien se fue
    socket.on("voice-user-left", ({ userId }) => removePeer(userId));

    return () => {
      leaveRoom();
      socket.off("voice-room-users");
      socket.off("voice-user-joined");
      socket.off("voice-signal");
      socket.off("voice-user-left");
      joinedRef.current = false;
    };
  }, [voiceRoomId]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, []);

  const createPeer = (userId, userName, initiator) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStreamRef.current,
    });

    peer.on("signal", signal => socket.emit("voice-signal", { toUserId: userId, signal }));

    peer.on("stream", stream => {
      setParticipants(prev => {
        const exists = prev.find(p => p.userId === userId);
        if (exists) return prev.map(p => p.userId === userId ? { ...p, stream } : p);
        return [...prev, { userId, userName, stream }];
      });
    });

    peer.on("error", err => console.error(`Peer error con ${userId}:`, err));

    peersRef.current[userId] = peer;

    setParticipants(prev => {
      if (prev.find(p => p.userId === userId)) return prev;
      return [...prev, { userId, userName, stream: null }];
    });
  };

  const removePeer = (userId) => {
    peersRef.current[userId]?.destroy();
    delete peersRef.current[userId];
    setParticipants(prev => prev.filter(p => p.userId !== userId));
  };

  const leaveRoom = () => {
    socket.emit("leave-voice-room", { voiceRoomId });
    Object.values(peersRef.current).forEach(p => p.destroy());
    peersRef.current = {};
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsCameraOn(track.enabled); }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack  = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer._pc?.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setSharingScreen(true);
      screenTrack.onended = stopScreenShare;
    } catch (err) { console.error(err); }
  };

  const stopScreenShare = () => {
    const original = localStreamRef.current?.originalVideoTrack;
    if (!original) return;
    Object.values(peersRef.current).forEach(peer => {
      const sender = peer._pc?.getSenders().find(s => s.track?.kind === "video");
      if (sender) sender.replaceTrack(original);
    });
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    setSharingScreen(false);
  };

  return (
    <div className="voice-room-container">
      <div className="voice-room-header">
        <h3>Sala de Voz</h3>
        <span>{participants.length + 1} participante{participants.length !== 0 ? "s" : ""}</span>
      </div>

      <div className={`voice-video-grid participants-${participants.length + 1}`}>
        <div className="voice-tile">
          <video ref={localVideoRef} autoPlay playsInline muted className="voice-video" />
          <div className="voice-tile-label">
            Tú {!isMicOn && <FaMicrophoneSlash />}
          </div>
        </div>

        {participants.map(p => (
          <RemoteTile key={p.userId} participant={p} />
        ))}
      </div>

      <div className="voice-controls">
        <button onClick={toggleMic} className={`control-btn ${isMicOn ? "on" : "off"}`}>
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={toggleCamera} className={`control-btn ${isCameraOn ? "on" : "off"}`}>
          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
        <button onClick={sharingScreen ? stopScreenShare : startScreenShare} className="control-btn warning">
          <FaDesktop /> {sharingScreen ? "Compartiendo" : "Pantalla"}
        </button>
        <button onClick={leaveRoom} className="control-btn danger">
          <FaSignOutAlt /> Salir
        </button>
      </div>
    </div>
  );
};

const RemoteTile = ({ participant }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  return (
    <div className="voice-tile">
      <video ref={videoRef} autoPlay playsInline className="voice-video" />
      <div className="voice-tile-label">{participant.userName}</div>
    </div>
  );
};

export default VoiceRoom;