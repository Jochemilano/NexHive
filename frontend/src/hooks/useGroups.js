import { useState, useEffect } from "react";
import { fetchGroups, createGroup, fetchAllUsers } from "@/utils/groups";

export const useGroups = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(err => console.error("Error cargando grupos:", err));
  }, []);

  const addGroup = (group) => {
    setGroups(prev => [...prev, group]);
  };

  return { groups, addGroup };
};