import React from "react";
import { useCall } from "../../context/CallContext";
import { FaPhone } from "react-icons/fa";

const IncomingCallModal = () => {
  const { incomingCall, acceptCall, declineCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div className="incoming-call-overlay">
      <div className="incoming-call-modal">
        <h3><FaPhone /> Llamada entrante</h3>
        <p>{incomingCall.fromUserName} te está llamando...</p>
        <div className="incoming-actions">
          <button onClick={acceptCall} className="control-btn success">Aceptar</button>
          <button onClick={declineCall} className="control-btn danger">Declinar</button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;