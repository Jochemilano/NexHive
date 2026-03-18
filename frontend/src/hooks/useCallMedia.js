import { useState } from "react";

export const useCallMedia = (localStreamRef, peerRef, localVidRef) => {
  const [isCameraOn,    setIsCameraOn]    = useState(true);
  const [isMicOn,       setIsMicOn]       = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);

  const toggleTrack = (kind, setter) => {
    const track = localStreamRef.current?.[kind === "audio" ? "getAudioTracks" : "getVideoTracks"]()[0];
    if (track) { track.enabled = !track.enabled; setter(track.enabled); }
  };

  const toggleMic    = () => toggleTrack("audio", setIsMicOn);
  const toggleCamera = () => toggleTrack("video", setIsCameraOn);

  const replaceVideoTrack = async (track) => {
    const sender = peerRef.current?._pc?.getSenders().find(s => s.track?.kind === "video");
    if (sender) await sender.replaceTrack(track);
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack  = screenStream.getVideoTracks()[0];
      await replaceVideoTrack(screenTrack);
      if (localVidRef.current) localVidRef.current.srcObject = screenStream;
      setSharingScreen(true);
      screenTrack.onended = stopScreenShare;
    } catch (e) { console.error(e); }
  };

  const stopScreenShare = async () => {
    const original = localStreamRef.current?.originalVideoTrack;
    if (!original) return;
    await replaceVideoTrack(original);
    if (localVidRef.current) localVidRef.current.srcObject = localStreamRef.current;
    setSharingScreen(false);
  };

  return { isCameraOn, isMicOn, sharingScreen, toggleMic, toggleCamera, startScreenShare, stopScreenShare };
};