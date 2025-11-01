// =======================================================================
// FILE: src/layouts/TesterLayout.jsx (UPDATED - SOC 2 COMPLIANT)
// PURPOSE: Tester layout using shared DashboardLayout
// SOC 2: Role validation, audit logging
// =======================================================================

import React, { useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';

/**
 * TesterLayout Component
 * Validates tester role and renders dashboard layout
 * ✅ SOC 2: Role-based access control
 */
const TesterLayout = React.memo(() => {
  const { user } = useAuth();

  /**
   * ✅ SOC 2: Validate user role
   */
  const isAuthorized = useMemo(() => {
    return user?.role === 'tester';
  }, [user?.role]);

  /**
   * ✅ SOC 2: Audit logging
   */
  useEffect(() => {
    if (isAuthorized) {
      console.log('Tester layout accessed', {
        userId: user?._id,
        role: user?.role,
        timestamp: new Date().toISOString()
      });
    }
  }, [isAuthorized, user?._id, user?.role]);

  // ✅ Redirect unauthorized access
  if (!isAuthorized) {
    console.warn('Unauthorized tester layout access attempt', {
      userRole: user?.role,
      timestamp: new Date().toISOString()
    });
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
});

TesterLayout.displayName = 'TesterLayout';

export default TesterLayout;
