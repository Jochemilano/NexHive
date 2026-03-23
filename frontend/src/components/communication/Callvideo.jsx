import React, { useEffect, useRef } from "react";
import { useCall } from "context/CallContext";
import { useCallMedia } from "hooks/useCallMedia";
import { FaExpand, FaPhone, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaDesktop, FaTimes } from "react-icons/fa";
const CallVideo = ({ expanded = true }) => {
  const {
    activeCall, callAccepted,
    isMinimized, setIsMinimized,
    localStreamRef, peerRef,
    remoteStream, expandCall, hangUp,
  } = useCall();

  const localVidRef  = useRef(null);
  const remoteVidRef = useRef(null);

  const {
    isCameraOn, isMicOn, sharingScreen,
    toggleMic, toggleCamera,
    startScreenShare, stopScreenShare,
  } = useCallMedia(localStreamRef, peerRef, localVidRef);

  // Asignar streams
  useEffect(() => {
    if (localVidRef.current && localStreamRef.current)
      localVidRef.current.srcObject = localStreamRef.current;
  }, [activeCall, isMinimized]);

  useEffect(() => {
    if (remoteVidRef.current && remoteStream)
      remoteVidRef.current.srcObject = remoteStream;
  }, [remoteStream, callAccepted, isMinimized]);

  if (!activeCall) return null;

  // Vista FLOTANTE (Chiquita)
if (!expanded || isMinimized) return (
  <div className="floating-call">
    <div className="floating-header">
      <span className="floating-name">
        <FaPhone /> {activeCall.targetUserName}
      </span>
      <div className="floating-buttons">
        <button
        onClick={() => setIsMinimized(false)}
        className="floating-btn"
        title="Maximizar"
        >
          <FaExpand />
        </button>
        <button onClick={hangUp} className="floating-btn danger">
          <FaTimes />
        </button>
      </div>
    </div>

    <div className="floating-video">
      <video
        ref={localVidRef}
        autoPlay
        playsInline
        muted
        className="video-stream"
      />
      <div className="video-label">Tú {!isMicOn && "🔇"}</div>
    </div>
  </div>
);

  // Vista EXPANDIDA
   return (
    <div className="call-extended-floating">
      <div className="call-header">
        <span>{callAccepted ? `En llamada con ${activeCall.targetUserName}` : "Llamando..."}</span>
        <button
          className="minimize-btn"
          onClick={() => setIsMinimized(true)}
          title="Minimizar"
        >
          ⏷
        </button>
      </div>

      <div className="video-grid">
        <div className="video-wrapper">
          <video ref={localVidRef} autoPlay playsInline muted className="video-stream" />
          <div className="video-label">
            Tú {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
            {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
          </div>
        </div>

        {callAccepted && (
          <div className="video-wrapper">
            <video ref={remoteVidRef} autoPlay playsInline className="video-stream" />
            <div className="video-label">{activeCall.targetUserName}</div>
          </div>
        )}
      </div>

      <div className="call-controls-floating">
        <button onClick={toggleMic} className={`control-btn ${isMicOn ? "on" : "off"}`}>
          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        <button onClick={toggleCamera} className={`control-btn ${isCameraOn ? "on" : "off"}`}>
          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
        </button>
        {callAccepted && (
          <button onClick={sharingScreen ? stopScreenShare : startScreenShare} className="control-btn warning">
            {sharingScreen ? <FaTimes /> : <FaDesktop />}
          </button>
        )}
        <button onClick={hangUp} className="control-btn danger"><FaTimes /></button>
      </div>
    </div>
  );
};

export default CallVideo;