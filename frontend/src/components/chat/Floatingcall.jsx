import React from "react";
import { useCall } from "./CallContext";
import CallVideo from "./Callvideo";

// Se renderiza en AppRouter para que flote en toda la app.
// Solo visible cuando hay llamada activa Y el usuario salió del chat (isMinimized=true)
const FloatingCall = () => {
  const { activeCall, isMinimized } = useCall();

  if (!activeCall || !isMinimized) return null;

  return <CallVideo expanded={false} />;
};

export default FloatingCall;