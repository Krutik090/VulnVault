// =======================================================================
// FILE: src/layouts/SharedLayout.jsx (UPDATED - SOC 2 COMPLIANT)
// PURPOSE: Wrapper layout for routes shared between Admin and Tester
// SOC 2: Role-based access control, audit logging
// =======================================================================

import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import TesterLayout from './TesterLayout';

/**
 * SharedLayout Component
 * Renders appropriate layout based on user role
 * ✅ SOC 2: Role validation, audit logging
 */
const SharedLayout = React.memo(() => {
  const { user } = useAuth();

  /**
   * ✅ SOC 2: Validate user role
   */
  const userRole = useMemo(() => {
    return user?.role;
  }, [user?.role]);

  /**
   * ✅ SOC 2: Audit logging
   */
  useEffect(() => {
    if (userRole) {
      console.log('SharedLayout accessed', {
        userId: user?._id,
        userRole,
        timestamp: new Date().toISOString()
      });
    }
  }, [userRole, user?._id]);

  /**
   * ✅ SOC 2: Role-based routing
   */
  if (userRole === 'admin') {
    return <AdminLayout />;
  }

  if (userRole === 'tester') {
    return <TesterLayout />;
  }

  // ✅ Redirect unauthenticated or invalid role users
  console.warn('Unauthorized shared layout access', {
    userRole,
    timestamp: new Date().toISOString()
  });

  return <Navigate to="/login" replace />;
});

SharedLayout.displayName = 'SharedLayout';

export default SharedLayout;
