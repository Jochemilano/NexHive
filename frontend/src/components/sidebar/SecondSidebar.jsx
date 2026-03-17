import { useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import "./SecondSidebar.css";
import GroupSecondSidebar from "./GroupSecondSidebar";
import HomeSecondSidebar from "./HomeSecondSidebar";
import CalendarSecondSidebar from "./CalendarSecondSidebar";

const SecondSidebar = () => {
  const location = useLocation();
  const { groupId } = useParams();
  const [minimized, setMinimized] = useState(false);

  const renderContent = () => {
    if (location.pathname.startsWith("/groups")) return <GroupSecondSidebar groupId={groupId} />;
    if (location.pathname.startsWith("/home")) return <HomeSecondSidebar />;
    if (location.pathname.startsWith("/chat")) return <HomeSecondSidebar />;
    if (location.pathname.startsWith("/calendar")) return <CalendarSecondSidebar />;
    return null;
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <aside className={`second-sidebar ${minimized ? "minimized" : ""}`}>
      <div className="retract-button">
        <button
          onClick={() => setMinimized(!minimized)}
          aria-label={minimized ? "Expand sidebar" : "Minimize sidebar"}
        >
          ❮
        </button>
      </div>
      <div className="sidebar-content">
        {content}
      </div>
    </aside>
  );
};

export default SecondSidebar;