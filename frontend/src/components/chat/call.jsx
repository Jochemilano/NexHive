import React, { useEffect, useRef, useState } from "react";
import { socket } from "socket";
import Peer from "simple-peer";
import "./call.css"; // ✅ Todo el estilo vive aquí ahora

const Call = ({ userId, targetUserId, onClose }) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const localStreamRef = useRef();
  const isInitiatorRef = useRef(false);

  const [callIncoming, setCallIncoming] = useState(false);
  const [caller, setCaller] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMediaReady, setIsMediaReady] = useState(false);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
      
      localStreamRef.current.originalVideoTrack = stream.getVideoTracks()[0];
      localStreamRef.current.originalAudioTrack = stream.getAudioTracks()[0];
      
      setIsCameraOn(true);
      setIsMicOn(true);
      setIsMediaReady(true);
      return stream;
    } catch (err) {
      console.error("❌ Error media:", err);
      setIsMediaReady(false);
      return null;
    }
  };

  useEffect(() => {
    initializeMedia();
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      if (peerRef.current) peerRef.current.destroy();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsCameraOn(track.enabled); }
  };

  const toggleMicrophone = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
  };

  const handleIncomingCall = ({ fromUserId, fromUserName, offer }) => {
    setCaller({ fromUserId, fromUserName, offer });
    setCallIncoming(true);
    isInitiatorRef.current = false;
  };

  const answerCall = () => {
    if (peerRef.current) return;
    isInitiatorRef.current = false;
    const peer = new Peer({ initiator: false, trickle: false, stream: localStreamRef.current });
    peer.on("signal", answer => socket.emit("call-accepted", { toUserId: caller.fromUserId, answer }));
    peer.on("stream", remoteStream => {
      remoteVideoRef.current.srcObject = remoteStream;
    });
    peer.signal(caller.offer);
    peerRef.current = peer;
    setCallIncoming(false);
    setCallAccepted(true);
  };

  const callUser = () => {
    if (!targetUserId || peerRef.current || !isMediaReady) return;
    isInitiatorRef.current = true;
    const peer = new Peer({ initiator: true, trickle: false, stream: localStreamRef.current });
    peer.on("signal", offer => socket.emit("call-user", { toUserId: targetUserId, offer }));
    peer.on("stream", remoteStream => {
      remoteVideoRef.current.srcObject = remoteStream;
    });
    peerRef.current = peer;
  };

  const handleCallAccepted = ({ fromUserId, answer }) => {
    if (!isInitiatorRef.current || !peerRef.current || callAccepted) return;
    peerRef.current.signal(answer);
    setCallAccepted(true);
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setSharingScreen(true);
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerRef.current?._pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
      localVideoRef.current.srcObject = screenStream;
      screenTrack.onended = stopScreenShare;
    } catch (err) { console.error(err); }
  };

  const stopScreenShare = () => {
    const originalTrack = localStreamRef.current.originalVideoTrack;
    const sender = peerRef.current?._pc.getSenders().find(s => s.track?.kind === 'video');
    if (sender) sender.replaceTrack(originalTrack);
    localVideoRef.current.srcObject = localStreamRef.current;
    setSharingScreen(false);
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.destroy();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setCallAccepted(false);
    setCallIncoming(false);
    setSharingScreen(false);
    onClose?.();
  };

  return (
    <div className="call-container theme-purple">
      <div className="call-header">
        <h3>
          {callIncoming && !callAccepted
            ? `Llamada entrante de ${caller?.fromUserName || 'Usuario'}`
            : callAccepted ? "Conexión Establecida" : "Sala de Voz"}
        </h3>
      </div>

      <div className="video-grid">
        <div className="video-wrapper">
          <video ref={localVideoRef} autoPlay playsInline className="video-stream" />
          <div className="video-label">Tú {!isMicOn && "🔇"}</div>
        </div>
        
        {callAccepted && (
          <div className="video-wrapper">
            <video ref={remoteVideoRef} autoPlay playsInline className="video-stream" />
            <div className="video-label">Remoto</div>
          </div>
        )}
      </div>

      <div className="call-controls">
        {/* Controles de Multimedia */}
        <button onClick={toggleMicrophone} className={`control-btn ${!isMicOn ? 'off' : 'on'}`}>
          {isMicOn ? "🎤" : "🎙️"}
        </button>
        <button onClick={toggleCamera} className={`control-btn ${!isCameraOn ? 'off' : 'on'}`}>
          {isCameraOn ? "📹" : "📷"}
        </button>

        {/* Lógica de botones de acción */}
        {!callAccepted && !callIncoming && targetUserId && (
          <button onClick={callUser} disabled={!isMediaReady} className="control-btn primary">
            Llamar
          </button>
        )}

        {callIncoming && !callAccepted && (
          <div className="incoming-actions">
            <button onClick={answerCall} className="control-btn success">Aceptar</button>
            <button onClick={endCall} className="control-btn danger">Rechazar</button>
          </div>
        )}

        {callAccepted && (
          <>
            <button onClick={sharingScreen ? stopScreenShare : startScreenShare} className="control-btn warning">
              {sharingScreen ? "Detener" : "Compartir"}
            </button>
            <button onClick={endCall} className="control-btn danger">
              Colgar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Call;