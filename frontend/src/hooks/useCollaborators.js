import { useState } from "react";

const useCollaborators = (allUsers = []) => {
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);

  const availableUsers = allUsers.filter(
    u => !selectedCollaborators.some(c => c.id === u.id)
  );

  const selectCollaborator = (e) => {
    const userId = parseInt(e.target.value);
    const user = allUsers.find(u => u.id === userId);
    if (user) setSelectedCollaborators(prev => [...prev, user]);
  };

  const removeCollaborator = (userId) => {
    setSelectedCollaborators(prev => prev.filter(c => c.id !== userId));
  };

  const resetCollaborators = () => setSelectedCollaborators([]);

  return { availableUsers, selectedCollaborators, selectCollaborator, removeCollaborator, resetCollaborators };
};

export default useCollaborators;