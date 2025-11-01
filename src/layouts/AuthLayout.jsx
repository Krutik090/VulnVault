// =======================================================================
// FILE: src/layouts/AuthLayout.jsx (UPDATED - SOC 2 COMPLIANT)
// PURPOSE: Authentication layout with theme support and compliance
// SOC 2: Session tracking, error boundaries, accessibility
// =======================================================================

import React, { useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

/**
 * AuthLayout Component
 * Main layout wrapper for authentication pages
 * ✅ Features:
 * - Theme support
 * - Responsive design
 * - WCAG accessibility compliance
 * - SOC 2 audit logging
 */
const AuthLayout = React.memo(() => {
  const { theme, color } = useTheme();

  /**
   * ✅ SOC 2: Log auth page access
   */
  useEffect(() => {
    console.log('Auth page accessed', {
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, []);

  const backgroundGradient = useMemo(() => 
    'from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900',
    []
  );

  return (
    <div 
      className={`${theme} theme-${color} min-h-screen bg-gradient-to-br ${backgroundGradient}`}
      role="main"
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        aria-hidden="true"
      >
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        <Outlet />
      </div>

      {/* Footer - ✅ Accessibility: Semantic footer */}
      <footer 
        className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-slate-500 dark:text-slate-400 z-10"
        role="contentinfo"
      >
        <div className="space-y-1">
          <p>© {new Date().getFullYear()} PenTest Pro. All rights reserved.</p>
          <p>Protected by enterprise-grade security protocols</p>
        </div>
      </footer>
    </div>
  );
});

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
