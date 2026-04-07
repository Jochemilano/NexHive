import Sidebar from "@/components/sidebar/Sidebar";
import TopBar from "@/components/topBar/TopBar";
import SecondSidebar from "@/components/secondsidebar/SecondSidebar";
import { Outlet } from "react-router-dom";
import { GroupProvider } from "@/context/GroupContext";
import "./Layout.css";

export default function Layout() {
  return (
    <GroupProvider>
      <div className="layout">
        <Sidebar />
        <SecondSidebar />
        <div className="content-area">
          <TopBar />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </GroupProvider>
  );
}