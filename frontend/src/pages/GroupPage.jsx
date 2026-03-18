import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGroupDetails } from "utils/groups";
import CreateActivityModal from "components/groups/CreateActivityModal";
import EditActivityModal from "components/groups/EditActivityModal";
import ViewActivityModal from "components/groups/ViewActivityModal";
import Modal from "components/modal/Modal";
import { BsThreeDots } from "react-icons/bs";
import { useGroup } from "context/GroupContext";

const STATUS_LABELS = {
  pending: "Pendiente",
  "in-progress": "En progreso",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const GroupPage = () => {
  const { groupId } = useParams();
  const { selectedProjectId } = useGroup();
  const [projects, setProjects] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, activityId: null });
  const [viewModal, setViewModal] = useState({ open: false, activityId: null });
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadDetails = async () => {
    if (!groupId) return;
    try {
      const data = await fetchGroupDetails(groupId);
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Error cargando grupo:", err);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [groupId]);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const activities = selectedProject?.activities || [];

  const handleDelete = (activity) => {
    const confirmed = window.confirm(`¿Eliminar la actividad "${activity.name}"?`);
    if (confirmed) {
      // TODO: llamar endpoint DELETE cuando esté disponible en backend
      console.log("Eliminar actividad:", activity.id);
    }
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="group-page">
      <div className="main-content">
        <div className="group-page__header">
          <div>
            <h1 className="group-page__title">
              {selectedProject?.name ?? "Selecciona un proyecto"}
            </h1>
            {selectedProject && (
              <p className="group-page__subtitle">{activities.length} actividades</p>
            )}
          </div>
          {selectedProject && (
            <Modal.Button onClick={() => setCreateModal(true)}>
              + Nueva actividad
            </Modal.Button>
          )}
        </div>

        {selectedProject && (
          <>
            <div className="group-page__filters">
              <input
                type="text"
                placeholder="Buscar actividad..."
                className="group-page__search"
              />
              <select className="group-page__filter">
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="activity-table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Inicio</th>
                    <th>Fecha límite</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="activity-table__empty">
                        Este proyecto no tiene actividades aún.
                      </td>
                    </tr>
                  ) : (
                    activities.map((a) => (
                      <tr key={`activity-${a.id}`}>
                        <td>{a.name || "Sin nombre"}</td>
                        <td>{a.created_by_name || "—"}</td>
                        <td>
                          <span className={`activity-status activity-status--${a.status}`}>
                            {STATUS_LABELS[a.status] ?? "—"}
                          </span>
                        </td>
                        <td>{formatDate(a.start_date)}</td>
                        <td>{formatDate(a.deadline)}</td>
                        <td className="activity-table__actions">
                          <div className="activity-menu">
                            <button
                              className="activity-menu__trigger"
                              onClick={(e) => toggleMenu(e, a.id)}
                            >
                              <BsThreeDots />
                            </button>
                            {openMenuId === a.id && (
                              <div
                                className="activity-menu__dropdown"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="activity-menu__item"
                                  onClick={() => {
                                    setViewModal({ open: true, activityId: a.id });
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Ver detalles
                                </button>
                                <button
                                  className="activity-menu__item"
                                  onClick={() => {
                                    setEditModal({ open: true, activityId: a.id });
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Editar
                                </button>
                                <button
                                  className="activity-menu__item activity-menu__item--danger"
                                  onClick={() => {
                                    handleDelete(a);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!selectedProject && projects.length === 0 && (
          <p className="group-page__empty">No hay proyectos en este grupo todavía.</p>
        )}
      </div>

      <CreateActivityModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        currentProjectId={selectedProjectId}
        onCreated={(newActivity) => {
          setProjects((prev) =>
            prev.map((p) =>
              p.id === selectedProjectId
                ? { ...p, activities: [...(p.activities || []), newActivity] }
                : p
            )
          );
        }}
      />

      <EditActivityModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, activityId: null })}
        activityId={editModal.activityId}
        onUpdated={loadDetails}
      />

      <ViewActivityModal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, activityId: null })}
        activityId={viewModal.activityId}
      />
    </div>
  );
};

export default GroupPage;