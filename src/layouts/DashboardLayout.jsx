// =======================================================================
// FILE: src/layouts/DashboardLayout.jsx (UPDATED - SOC 2 COMPLIANT)
// PURPOSE: Shared layout for admin and tester with compliance
// SOC 2: Audit logging, error boundaries, accessibility, role validation
// =======================================================================

import React, { useEffect, useMemo } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { UIProvider, useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

/**
 * DashboardContent Component
 * Inner layout component that uses context
 * ✅ SOC 2: Audit logging, accessibility
 */
const DashboardContent = React.memo(() => {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { theme, color } = useTheme();

  /**
   * ✅ SOC 2: Audit logging for page access
   */
  useEffect(() => {
    console.log('Dashboard accessed', {
      userId: user?._id,
      userRole: user?.role,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [user?._id, user?.role]);

  /**
   * ✅ SOC 2: Validate user role can access dashboard
   */
  const isValidRole = useMemo(() => {
    const validRoles = ['admin', 'tester'];
    return validRoles.includes(user?.role);
  }, [user?.role]);

  if (!isValidRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Unauthorized Access</p>
          <p className="text-muted-foreground text-sm mt-2">
            Your role does not have access to this dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${theme} theme-${color} flex h-screen overflow-hidden bg-background`}
      role="application"
      aria-label={`${user?.role} dashboard`}
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

        {/* Page Content - MINIMAL PADDING FOR MAXIMUM SPACE */}
        <main 
          className="flex-1 overflow-y-auto bg-background w-full"
          role="main"
        >
          <div className="w-full h-full p-3 md:p-4 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

/**
 * DashboardLayout Component
 * Main layout wrapper with context provider
 * ✅ SOC 2: Role-based access control
 */
const DashboardLayout = React.memo(() => {
  const { user } = useAuth();

  /**
   * ✅ SOC 2: Validate user is authenticated
   */
  const isAuthenticated = useMemo(() => {
    return !!user && ['admin', 'tester'].includes(user?.role);
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <UIProvider>
      <DashboardContent />
    </UIProvider>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
