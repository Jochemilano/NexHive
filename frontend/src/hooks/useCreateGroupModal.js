import { useState, useEffect } from "react";
import { fetchAllUsers } from "@/utils/groups";

export const useCreateGroupModal = (isOpen) => {
  const [name, setName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchAllUsers()
      .then(users => {
        setAllUsers(users);
        setCurrentUserId(parseInt(localStorage.getItem("userId")) || null);
      })
      .catch(err => console.error("Error cargando usuarios:", err));
  }, [isOpen]);

  const availableUsers = allUsers.filter(
    user => user.id !== currentUserId && !selectedCollaborators.find(c => c.id === user.id)
  );

  const selectCollaborator = (e) => {
    const userId = parseInt(e.target.value);
    if (!userId) return;
    const user = allUsers.find(u => u.id === userId);
    if (user) setSelectedCollaborators(prev => [...prev, user]);
    e.target.value = "";
  };

  const removeCollaborator = (userId) =>
    setSelectedCollaborators(prev => prev.filter(c => c.id !== userId));

  const reset = () => {
    setName("");
    setSelectedCollaborators([]);
  };

  return {
    name, setName,
    availableUsers,
    selectedCollaborators,
    selectCollaborator,
    removeCollaborator,
    reset,
  };
};