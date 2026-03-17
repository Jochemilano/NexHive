import React, { useEffect, useState } from "react";
import { fetchGroupDetails } from "utils/groups";
import { createProject } from "utils/projects";
import Modal from "components/modal/Modal";
import { createActivity } from "utils/activities";
import EditActivityModal from "components/sidebar/EditActivityModal";
import CreateActivityModal from "components/sidebar/CreateActivityModal";
import CreateProjectModal from "components/sidebar/CreateProjectModal";
import { useNavigate } from "react-router-dom";

import { FaHashtag, FaVolumeUp } from "react-icons/fa";

const GroupSecondSidebar = ({ groupId }) => {
  const [details, setDetails] = useState({ channels: [], projects: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isEditActivityOpen, setIsEditActivityOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const navigate = useNavigate();

  const loadDetails = async () => {
    if (!groupId) return;
    try {
      const data = await fetchGroupDetails(groupId);
      setDetails(data);
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
          {details.channels.map(c => (
          <div key={c.id} className="channel-group" style={{ padding: "0 0.5rem", marginBottom: "1rem" }}>
            <h3>Canales</h3>
            
            <div 
              className="user-item" 
              onClick={() => navigate(`/groups/${groupId}/chat/${c.chat_room_id}`)}
            >
              <FaHashtag style={{ marginRight: "8px", fontSize: "0.8rem" }} />
              <span>Mensajes</span>
            </div>

            <div 
              className="user-item" 
              onClick={() => navigate(`/groups/${groupId}/voice/${c.voice_room_id}`)}
            >
              <FaVolumeUp style={{ marginRight: "8px", fontSize: "0.8rem" }} />
              <span>Sala de voz</span>
            </div>
          </div>
        ))}

          <div className="cont-sec">
            <h3>Proyectos</h3>
            <Modal.Button onClick={() => setIsOpen(true)}>+</Modal.Button>
          </div>

          {details.projects.map(p => (
            <div key={`project-${p.id}`} className="project-item">
              <div className="project-header">
                {p.name}
                <button
                  className="add-activity-btn"
                  onClick={() => {
                    setCurrentProjectId(p.id);
                    setIsActivityOpen(true);
                  }}
                >+</button>
              </div>

              <div className="project-activities">
                {p.activities?.length > 0
                  ? p.activities.map(a => (
                      <div
                        key={`activity-${a.id ?? Math.random()}`}
                        className="activity-item"
                        onClick={() => {
                          setCurrentProjectId(p.id);
                          setEditingActivityId(a.id);
                          setIsEditActivityOpen(true);
                        }}
                      >
                        {a.name || "Sin nombre"}
                      </div>
                    ))
                  : <span className="empty-activities">Sin actividades</span>}
              </div>
            </div>
          ))}
        </div>

      <CreateProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groupId={groupId}
        onCreated={(newProject) => {
          setDetails(prev => ({
            ...prev,
            projects: [...prev.projects, newProject]
          }));
        }}
      />
      <CreateActivityModal
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        currentProjectId={currentProjectId}
        onCreated={(newActivity) => {
          setDetails(prev => ({
            ...prev,
            projects: prev.projects.map(p =>
              p.id === currentProjectId
                ? { ...p, activities: [...(p.activities || []), newActivity] }
                : p
            )
          }));
        }}
      />
      <EditActivityModal
        isOpen={isEditActivityOpen}
        onClose={() => setIsEditActivityOpen(false)}
        activityId={editingActivityId}
        onUpdated={() => loadDetails()}
      />
    </>
  );
};

export default GroupSecondSidebar;