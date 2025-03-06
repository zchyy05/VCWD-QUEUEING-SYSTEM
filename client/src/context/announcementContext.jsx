import React, { createContext, useContext, useState } from "react";

const AnnouncementContext = createContext();

export const AnnouncementProvider = ({ children }) => {
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const value = {
    isAnnouncing,
    setIsAnnouncing,
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error(
      "useAnnouncement must be used within an AnnouncementProvider"
    );
  }
  return context;
};
