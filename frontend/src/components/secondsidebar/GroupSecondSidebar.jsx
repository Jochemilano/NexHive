import React, { useEffect, useState } from "react";
import { fetchGroupDetails } from "utils/groups";
import Modal from "components/modal/Modal";
import CreateProjectModal from "components/groups/CreateProjectModal";
import { FaHashtag, FaVolumeUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGroup } from "context/GroupContext";

const GroupSecondSidebar = ({ groupId }) => {
  const [details, setDetails] = useState({ channels: [], projects: [] });
  const [isOpen, setIsOpen] = useState(false);
  const { selectedProjectId, setSelectedProjectId } = useGroup();
  const navigate = useNavigate();

  const loadDetails = async () => {
    if (!groupId) return;
    try {
      const data = await fetchGroupDetails(groupId);
      setDetails(data);
      if (data.projects?.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data.projects[0].id);
      }
    } catch (err) {
      console.error("Error cargando detalles del grupo:", err);
      setDetails({ channels: [], projects: [] });
    }
  };

  useEffect(() => {
    loadDetails();
  }, [groupId]);
  
  return (
    <>
      <div className="sidebar-content">
        {details.channels.map((c) => (
          <div key={c.id} className="channel-group">
            <h3>Canales</h3>
            <div
              className="user-item"
              onClick={() => navigate(`/groups/${groupId}/chat/${c.chat_room_id}`)}
            >
              <FaHashtag className="channel-icon" />
              <span>Mensajes</span>
            </div>
            <div
              className="user-item"
              onClick={() => navigate(`/groups/${groupId}/voice/${c.voice_room_id}`)}
            >
              <FaVolumeUp className="channel-icon" />
              <span>Sala de voz</span>
            </div>
          </div>
        ))}

        <div className="cont-sec">
          <h3>Proyectos</h3>
          <Modal.Button onClick={() => setIsOpen(true)}>+</Modal.Button>
        </div>

        <div className="project-list">
          {details.projects.length === 0 && (
            <span className="empty-activities">Sin proyectos</span>
          )}
          {details.projects.map((p) => (
            <div
              key={`project-${p.id}`}
              className={`user-item ${selectedProjectId === p.id ? "project-item--active" : ""}`}
              onClick={() => setSelectedProjectId(p.id)}
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>

      <CreateProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groupId={groupId}
        onCreated={(newProject) => {
          setDetails((prev) => ({
            ...prev,
            projects: [...prev.projects, newProject],
          }));
          setSelectedProjectId(newProject.id);
        }}
      />
    </>
  );
};

export default GroupSecondSidebar;