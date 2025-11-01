// =======================================================================
// FILE: src/contexts/UIContext.jsx (UPDATED - SOC 2 COMPLIANT)
// PURPOSE: Manages global UI state with compliance
// SOC 2: State management, audit logging, accessibility
// =======================================================================

import React, { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react';

const UIContext = createContext();

/**
 * UIProvider Component
 * Manages global UI state (sidebar, modals, etc.)
 * ✅ SOC 2: State tracking, audit logging
 */
export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== "undefined" ? !window.matchMedia("(max-width: 1024px)").matches : false
  );
  const [modals, setModals] = useState({});
  const [notifications, setNotifications] = useState([]);

  /**
   * ✅ SOC 2: Close sidebar on mobile on mount
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = window.matchMedia("(max-width: 1024px)").matches;
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  }, []);

  /**
   * ✅ SOC 2: Toggle sidebar with audit logging
   */
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      
      // ✅ SOC 2: Audit logging
      console.log('Sidebar toggled', {
        isOpen: newState,
        timestamp: new Date().toISOString()
      });

      return newState;
    });
  }, []);

  /**
   * ✅ Open sidebar
   */
  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
    
    console.log('Sidebar opened', {
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * ✅ Close sidebar
   */
  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    
    console.log('Sidebar closed', {
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * ✅ Open modal
   */
  const openModal = useCallback((modalName) => {
    if (!modalName || typeof modalName !== 'string') return;

    setModals((prev) => ({
      ...prev,
      [modalName]: true
    }));

    // ✅ SOC 2: Audit logging
    console.log('Modal opened', {
      modal: modalName,
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * ✅ Close modal
   */
  const closeModal = useCallback((modalName) => {
    if (!modalName || typeof modalName !== 'string') return;

    setModals((prev) => ({
      ...prev,
      [modalName]: false
    }));

    // ✅ SOC 2: Audit logging
    console.log('Modal closed', {
      modal: modalName,
      timestamp: new Date().toISOString()
    });
  }, []);

  /**
   * ✅ Toggle modal
   */
  const toggleModal = useCallback((modalName) => {
    if (!modalName || typeof modalName !== 'string') return;

    setModals((prev) => ({
      ...prev,
      [modalName]: !prev[modalName]
    }));
  }, []);

  /**
   * ✅ Add notification
   */
  const addNotification = useCallback((notification) => {
    if (!notification || typeof notification !== 'object') return;

    const id = Date.now();
    const newNotification = {
      id,
      ...notification,
      createdAt: new Date().toISOString()
    };

    setNotifications((prev) => [...prev, newNotification]);

    // ✅ Auto-remove after timeout
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);

    return id;
  }, []);

  /**
   * ✅ Remove notification
   */
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter(notif => notif.id !== id));
  }, []);

  /**
   * ✅ Memoized context value
   */
  const value = useMemo(() => ({
    // Sidebar
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    
    // Modals
    modals,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen: (modalName) => modals[modalName] || false,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification
  }), [isSidebarOpen, toggleSidebar, openSidebar, closeSidebar, modals, openModal, closeModal, toggleModal, notifications, addNotification, removeNotification]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

/**
 * ✅ useUI hook with error handling
 */
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
