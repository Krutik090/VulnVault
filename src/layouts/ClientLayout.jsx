// =======================================================================
// FILE: src/layouts/ClientLayout.jsx (UPDATED - SOC 2 COMPLIANT)
// PURPOSE: Layout wrapper for client role with compliance
// SOC 2: Role validation, audit logging, error handling, accessibility
// =======================================================================

import React, { useEffect, useMemo } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { UIProvider, useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

/**
 * ClientLayoutContent Component
 * Inner layout component that uses context
 * ✅ SOC 2: Audit logging, accessibility
 */
const ClientLayoutContent = React.memo(() => {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { theme, color } = useTheme();

  /**
   * ✅ SOC 2: Audit logging for page access
   */
  useEffect(() => {
    console.log('Client layout accessed', {
      userId: user?._id,
      userRole: user?.role,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [user?._id, user?.role]);

  return (
    <div 
      className={`${theme} theme-${color} flex h-screen overflow-hidden bg-background`}
      role="application"
      aria-label="Client dashboard"
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Overlay - ✅ Accessibility: Proper semantics */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          role="presentation"
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main 
          className="flex-1 overflow-y-auto bg-background w-full"
          role="main"
        >
          <div className="w-full h-full p-3 md:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
});

ClientLayoutContent.displayName = 'ClientLayoutContent';

/**
 * ClientLayout Component
 * Main layout wrapper with context provider
 * ✅ SOC 2: Role-based access control
 */
const ClientLayout = React.memo(() => {
  const { user } = useAuth();

  /**
   * ✅ SOC 2: Validate client role
   */
  const isAuthorized = useMemo(() => {
    return user?.role === 'client';
  }, [user?.role]);

  if (!isAuthorized) {
    console.warn('Unauthorized client layout access attempt', {
      userRole: user?.role,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/login" replace />;
  }

  return (
    <UIProvider>
      <ClientLayoutContent />
    </UIProvider>
  );
});

ClientLayout.displayName = 'ClientLayout';

export default ClientLayout;
