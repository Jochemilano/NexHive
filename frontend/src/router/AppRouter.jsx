import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "utils/protected-route";
import Layout from "components/layout/Layout";
import Calendar from "pages/Calendar";
import Login from "pages/Login";
import Saved from "pages/Saved";
import GroupPage from "pages/GroupPage";
import Home from "pages/Home";
import ChatWrapper from "components/chat/ChatWrapper";
import VoiceRoomWrapper from "components/chat/VoiceRoomWrapper";
import GroupCall from "components/chat/GroupCall";
import { CallProvider } from "components/chat/CallContext";
import IncomingCallModal from "components/chat/IncomingCallModal";
import FloatingCall from "components/chat/Floatingcall";

export default function AppRouter() {
  return (
    <CallProvider>
      {/* Visible en CUALQUIER página */}
      <IncomingCallModal />
      <FloatingCall />

      <Routes>
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/home"                                        element={<Home />} />
          <Route path="/saved"                                       element={<Saved />} />
          <Route path="/calendar"                                    element={<Calendar />} />
          <Route path="groups/:groupId"                              element={<GroupPage />} />
          <Route path="/groups/:groupId/chat/:chatRoomId"            element={<ChatWrapper />} />
          <Route path="/groups/:groupId/voice/:voiceRoomId"          element={<VoiceRoomWrapper />} />
          <Route path="/chat/:chatRoomId"                            element={<ChatWrapper />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Routes>
    </CallProvider>
  );
}