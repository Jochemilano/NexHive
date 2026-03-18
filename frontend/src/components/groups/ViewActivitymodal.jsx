import React, { useEffect, useState } from "react";
import Modal from "components/modal/Modal";

const STATUS_LABELS = {
  pending: "Pendiente",
  "in-progress": "En progreso",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const fetchActivity = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/activities/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener actividad");
  return res.json();
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const ViewActivityModal = ({ isOpen, onClose, activityId }) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !activityId) return;
    setLoading(true);
    fetchActivity(activityId)
      .then(setActivity)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, activityId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header onClose={onClose}>Detalle de actividad</Modal.Header>
      <Modal.Body>
        {loading && <p className="modal-loading">Cargando...</p>}
        {!loading && activity && (
          <div className="activity-detail">
            <div className="activity-detail__field">
              <span className="activity-detail__label">Nombre</span>
              <span className="activity-detail__value">{activity.name}</span>
            </div>
            <div className="activity-detail__field">
              <span className="activity-detail__label">Descripción</span>
              <span className="activity-detail__value">
                {activity.description || "Sin descripción"}
              </span>
            </div>
            <div className="activity-detail__field">
              <span className="activity-detail__label">Responsable</span>
              <span className="activity-detail__value">
                {activity.created_by_name || "—"}
              </span>
            </div>
            <div className="activity-detail__row">
              <div className="activity-detail__field">
                <span className="activity-detail__label">Fecha inicio</span>
                <span className="activity-detail__value">{formatDate(activity.start_date)}</span>
              </div>
              <div className="activity-detail__field">
                <span className="activity-detail__label">Fecha límite</span>
                <span className="activity-detail__value">{formatDate(activity.deadline)}</span>
              </div>
            </div>
            <div className="activity-detail__field">
              <span className="activity-detail__label">Estado</span>
              <span className={`activity-status activity-status--${activity.status}`}>
                {STATUS_LABELS[activity.status] ?? activity.status}
              </span>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer onClose={onClose} />
    </Modal>
  );
};

export default ViewActivityModal;