import React, { useEffect, useRef, useState } from "react";
import { useCall } from "./CallContext";

const CallVideo = ({ expanded = true }) => {
  const {
    activeCall,
    callAccepted,
    isMinimized,
    setIsMinimized,
    localStreamRef,
    peerRef,
    remoteStream,
    expandCall,
    hangUp,
  } = useCall();

  const [isCameraOn, setIsCameraOn]       = useState(true);
  const [isMicOn, setIsMicOn]             = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);

  const localVidRef  = useRef(null);
  const remoteVidRef = useRef(null);

  useEffect(() => {
    if (localVidRef.current && localStreamRef.current) {
      localVidRef.current.srcObject = localStreamRef.current;
    }
  }, [activeCall, isMinimized]);

  useEffect(() => {
    if (remoteVidRef.current && remoteStream) {
      remoteVidRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callAccepted, isMinimized]);

  if (!activeCall) return null;

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsCameraOn(track.enabled); }
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setIsMicOn(track.enabled); }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack  = screenStream.getVideoTracks()[0];
      const sender = peerRef.current?._pc?.getSenders().find(s => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);
      if (localVidRef.current) localVidRef.current.srcObject = screenStream;
      setSharingScreen(true);
      screenTrack.onended = stopScreenShare;
    } catch (e) { console.error(e); }
  };

  const stopScreenShare = async () => {
    const originalTrack = localStreamRef.current?.originalVideoTrack;
    if (!originalTrack) return;
    const sender = peerRef.current?._pc?.getSenders().find(s => s.track?.kind === "video");
    if (sender) await sender.replaceTrack(originalTrack);
    if (localVidRef.current) localVidRef.current.srcObject = localStreamRef.current;
    setSharingScreen(false);
  };

  // Vista FLOTANTE
  if (!expanded || isMinimized) {
    return (
      <div className="floating-call">
        <span className="floating-name">📞 {activeCall.targetUserName}</span>
        <div className="floating-controls">
          <button onClick={expandCall}>⛶ Expandir</button>
          <button onClick={() => hangUp()}>Colgar</button>
        </div>
      </div>
    );
  }

  // Vista EXPANDIDA
  return (
    <div className="call-expanded">
      <div className="call-header">
        <span>
          {callAccepted
            ? `En llamada con ${activeCall.targetUserName}`
            : "Llamando..."}
        </span>
        <button onClick={() => setIsMinimized(true)}>⊟ Minimizar</button>
      </div>

      <div className="video-grid">
        <div className="video-wrapper">
          <video ref={localVidRef} autoPlay playsInline muted className="video-stream" />
          <div className="video-label">Tú {!isMicOn && "🔇"}</div>
        </div>
        {callAccepted && (
          <div className="video-wrapper">
            <video ref={remoteVidRef} autoPlay playsInline className="video-stream" />
            <div className="video-label">{activeCall.targetUserName}</div>
          </div>
        )}
      </div>

      <div className="call-controls">
        <button onClick={toggleMic} className={`control-btn ${isMicOn ? "on" : "off"}`}>
          {isMicOn ? "🎤" : "🎙️"}
        </button>
        <button onClick={toggleCamera} className={`control-btn ${isCameraOn ? "on" : "off"}`}>
          {isCameraOn ? "📹" : "📷"}
        </button>
        {callAccepted && (
          <button
            onClick={sharingScreen ? stopScreenShare : startScreenShare}
            className="control-btn warning"
          >
            {sharingScreen ? "Dejar de compartir" : "Pantalla"}
          </button>
        )}
        <button onClick={() => hangUp()} className="control-btn danger">
          Colgar
        </button>
      </div>
    </div>
  );
};

export default CallVideo;