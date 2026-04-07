import { useState, useEffect } from "react";
import { fetchGroups, createGroup, fetchAllUsers } from "@/utils/groups";

export const useGroups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(err => console.error("Error cargando grupos:", err));
  }, []);

  const addGroup = async (name, collaboratorIds) => {
    const newGroup = await createGroup(name, collaboratorIds);
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  };

  return { groups, addGroup };
};