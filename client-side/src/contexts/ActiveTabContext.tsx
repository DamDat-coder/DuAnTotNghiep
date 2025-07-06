import React, { createContext, useState, useContext } from "react";

// Create a context for active tab
const ActiveTabContext = createContext<{
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}>({
  activeTab: "main", // Default tab
  setActiveTab: () => {}, // Empty function for initialization
});

// Provider component to wrap your app with
export const ActiveTabProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>("main");

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
};

export const useActiveTab = () => useContext(ActiveTabContext);
