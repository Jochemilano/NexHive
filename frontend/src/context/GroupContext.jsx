import { createContext, useContext, useState } from "react";

const GroupContext = createContext(null);

export const GroupProvider = ({ children }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  return (
    <GroupContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => useContext(GroupContext);