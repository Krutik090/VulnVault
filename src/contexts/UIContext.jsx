// =======================================================================
// FILE: src/contexts/UIContext.jsx (NEW FILE)
// PURPOSE: Manages global UI state, such as the sidebar's visibility.
// =======================================================================
import { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const value = { isSidebarOpen, toggleSidebar };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  return useContext(UIContext);
};
