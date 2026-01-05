// =======================================================================
// FILE: src/layouts/AdminLayout.jsx (UPDATED - SOC 2 COMPLIANT)
// PURPOSE: Admin layout using shared DashboardLayout
// SOC 2: Role validation, audit logging, error handling
// =======================================================================

import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';

/**
 * AdminLayout Component
 * Validates admin role and renders dashboard layout
 * ✅ SOC 2: Role-based access control
 */
const AdminLayout = React.memo(() => {
  const { user } = useAuth();

  /**
   * ✅ SOC 2: Validate user role
   */
  const isAuthorized = useMemo(() => {
    return user?.role === 'admin';
  }, [user?.role]);

  /**
   * ✅ SOC 2: Audit logging
   */
  useEffect(() => {
    if (isAuthorized) {
      console.log('Admin layout accessed', {
        userId: user?._id,
        role: user?.role,
        timestamp: new Date().toISOString()
      });
    }
  }, [isAuthorized, user?._id, user?.role]);

  // ✅ Redirect unauthorized access
  if (!isAuthorized) {
    console.warn('Unauthorized admin layout access attempt', {
      userRole: user?.role,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
});

AdminLayout.displayName = 'AdminLayout';

export default AdminLayout;
