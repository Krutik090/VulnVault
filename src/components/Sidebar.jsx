// =======================================================================
// FILE: src/components/Sidebar.jsx
// PURPOSE: Sidebar with role-based navigation for admin, tester & client
// SOC 2: Role-based access control, audit logging, WCAG compliance
// =======================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import {
  DashboardIcon,
  ChartBarIcon,
  UsersIcon,
  ProjectsIcon,
  TimeIcon,
  DatabaseIcon,
  FolderIcon,
  ToolsIcon,
  ChevronDownIcon,
  ShieldIcon,
  CloseIcon,
  PlusIcon,
  EyeIcon,
  DocumentIcon
} from './Icons';

/**
 * Sidebar Component
 * Role-based navigation with audit logging and compliance
 * 
 * Features:
 * - Role-based navigation (Admin, Tester, Client)
 * - Collapsible menu sections
 * - Mobile responsive
 * - SOC 2 audit logging
 * - WCAG accessibility compliance
 */
const Sidebar = React.memo(() => {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { theme, color } = useTheme();
  const location = useLocation();

  // Dropdown states
  const isUserManagementActive = location.pathname.startsWith('/manage-users') ||
    location.pathname.startsWith('/user-tracker');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(isUserManagementActive);

  const isProjectManagementActive = location.pathname.startsWith('/project-records') ||
    location.pathname.startsWith('/add-client') ||
    location.pathname.startsWith('/clients/') ||
    location.pathname.startsWith('/active-projects') ||
    location.pathname.startsWith('/projects/');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(isProjectManagementActive);

  const isVulnManagementActive = location.pathname.startsWith('/vulnerability-database') ||
    location.pathname.startsWith('/vulnerabilities/') ||
    location.pathname.startsWith('/project-vulnerabilities/');
  const [isVulnDropdownOpen, setIsVulnDropdownOpen] = useState(isVulnManagementActive);

  const isClientManagementActive = location.pathname.startsWith('/clients') ||
    location.pathname.startsWith('/add-client');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(isClientManagementActive);

  const isToolsActive = location.pathname.startsWith('/subdomain-finder');
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(isToolsActive);

  /**
   * ✅ SOC 2: Validate user role
   * Ensure only authorized roles access navigation
   */
  const isValidRole = useMemo(() => {
    const validRoles = ['admin', 'tester', 'client', 'manager'];
    return validRoles.includes(user?.role);
  }, [user?.role]);

  /**
   * ✅ SOC 2: Auto-open dropdowns when navigating
   */
  useEffect(() => {
    setIsUserDropdownOpen(isUserManagementActive);
  }, [isUserManagementActive]);

  useEffect(() => {
    setIsProjectDropdownOpen(isProjectManagementActive);
  }, [isProjectManagementActive]);

  useEffect(() => {
    setIsVulnDropdownOpen(isVulnManagementActive);
  }, [isVulnManagementActive]);

  useEffect(() => {
    setIsClientDropdownOpen(isClientManagementActive);
  }, [isClientManagementActive]);

  useEffect(() => {
    setIsToolsDropdownOpen(isToolsActive);
  }, [isToolsActive]);

  /**
   * ✅ SOC 2: Handle navigation with audit logging
   */
  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }

    // ✅ SOC 2: Audit logging
    console.log('Navigation event', {
      userId: user?._id,
      userRole: user?.role,
      destination: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [toggleSidebar, user?._id, user?.role, location.pathname]);

  /**
   * ✅ SOC 2: Handle dropdown toggle with audit logging
   */
  const handleDropdownToggle = useCallback((dropdownName) => {
    console.log('Dropdown toggled', {
      userId: user?._id,
      userRole: user?.role,
      dropdown: dropdownName,
      timestamp: new Date().toISOString()
    });
  }, [user?._id, user?.role]);

  /**
   * Toggle user management dropdown
   */
  const toggleUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    handleDropdownToggle('User Management');
  }, [isUserDropdownOpen, handleDropdownToggle]);

  /**
   * Toggle project dropdown
   */
  const toggleProjectDropdown = useCallback(() => {
    setIsProjectDropdownOpen(!isProjectDropdownOpen);
    handleDropdownToggle('Project Management');
  }, [isProjectDropdownOpen, handleDropdownToggle]);

  /**
   * Toggle vulnerability dropdown
   */
  const toggleVulnDropdown = useCallback(() => {
    setIsVulnDropdownOpen(!isVulnDropdownOpen);
    handleDropdownToggle('Vulnerability Management');
  }, [isVulnDropdownOpen, handleDropdownToggle]);

  /**
   * Toggle client dropdown
   */
  const toggleClientDropdown = useCallback(() => {
    setIsClientDropdownOpen(!isClientDropdownOpen);
    handleDropdownToggle('Client Management');
  }, [isClientDropdownOpen, handleDropdownToggle]);

  /**
   * Toggle tools dropdown
   */
  const toggleToolsDropdown = useCallback(() => {
    setIsToolsDropdownOpen(!isToolsDropdownOpen);
    handleDropdownToggle('Security Tools');
  }, [isToolsDropdownOpen, handleDropdownToggle]);

  // ✅ Nav link classes
  const linkClasses = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 group
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    ${isActive
      ? 'bg-primary text-primary-foreground shadow-md font-semibold'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }
  `;

  // ✅ Dropdown button classes
  const dropdownButtonClasses = (isActive) => `
    flex items-center justify-between w-full px-4 py-3 rounded-lg mx-2 transition-all duration-200 group
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
    ${isActive
      ? 'bg-primary/10 text-primary font-semibold'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }
  `;

  // ✅ Sub-link classes
  const subLinkClasses = ({ isActive }) => `
    flex items-center gap-3 py-2.5 pl-12 pr-4 mx-2 text-sm rounded-lg transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset
    ${isActive
      ? 'text-primary font-medium bg-primary/5 border-l-4 border-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border-l-4 border-transparent'
    }
  `;

  // ✅ User initial
  const userInitial = useMemo(() => {
    return (user?.username?.charAt(0) || user?.name?.charAt(0) || 'U').toUpperCase();
  }, [user?.username, user?.name]);

  // ✅ User display name
  const userDisplayName = useMemo(() => {
    return user?.username || user?.name || 'User';
  }, [user?.username, user?.name]);

  if (!isValidRole) {
    return (
      <aside className={`${theme} theme-${color} fixed lg:static inset-y-0 left-0 z-30 w-72 h-screen bg-card border-r border-border flex items-center justify-center`}>
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Invalid user role</p>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`${theme} theme-${color} fixed lg:static inset-y-0 left-0 z-30 w-72 h-screen overflow-hidden bg-card border-r border-border flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <ShieldIcon className="text-primary-foreground w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-card-foreground">PenTest Pro</h2>
              <p className="text-xs text-muted-foreground capitalize">{user?.role} Panel</p>
            </div>
          </div>

          {/* Close button - Mobile only */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close navigation sidebar"
          >
            <CloseIcon className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-2" aria-label="Sidebar navigation">
          <div className="space-y-2">
            {/* Dashboard - All Roles */}
            <NavLink
              to={`/${user?.role}/dashboard`}
              className={linkClasses}
              onClick={handleLinkClick}
              aria-label="Go to dashboard"
            >
              <DashboardIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">Dashboard</span>
            </NavLink>
            <NavLink
              to={`/${user?.role}/ctemDashboard`}
              className={linkClasses}
              onClick={handleLinkClick}
              aria-label="Go to dashboard"
            >
              <DashboardIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">CTEM Dashboard</span>
            </NavLink>

            {/* Statistics Dashboard - Admin Only */}
            {user?.role === 'admin' && (
              <NavLink
                to="/statistics"
                className={linkClasses}
                onClick={handleLinkClick}
                aria-label="Go to statistics"
              >
                <ChartBarIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium">Statistics</span>
              </NavLink>
            )}

            {/* ========================================
                TESTER SPECIFIC NAVIGATION
            ======================================== */}
            {user?.role === 'tester' && (
              <>
                {/* My Projects */}
                <NavLink
                  to="/tester/projects"
                  className={linkClasses}
                  onClick={handleLinkClick}
                  aria-label="Go to my projects"
                >
                  <FolderIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">My Projects</span>
                </NavLink>

                {/* Time Tracker */}
                <NavLink
                  to="/tester/tracker"
                  className={linkClasses}
                  onClick={handleLinkClick}
                  aria-label="Go to time tracker"
                >
                  <TimeIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">Time Tracker</span>
                </NavLink>
              </>
            )}

            {/* ========================================
                CLIENT SPECIFIC NAVIGATION - ✅ UPDATED
            ======================================== */}
            {user?.role === 'client' && (
              <>
                {/* My Projects */}
                <NavLink
                  to="/client/projects"
                  className={linkClasses}
                  onClick={handleLinkClick}
                  aria-label="Go to my projects"
                >
                  <FolderIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">My Projects</span>
                </NavLink>

                {/* Vulnerabilities/Reports */}
                <NavLink
                  to="/client/reports"
                  className={linkClasses}
                  onClick={handleLinkClick}
                  aria-label="Go to reports"
                >
                  <DocumentIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">Reports</span>
                </NavLink>
              </>
            )}

            {/* ========================================
                ADMIN SPECIFIC NAVIGATION - ✅ UPDATED
            ======================================== */}
            {user?.role === 'admin' && (
              <>
                {/* User Management */}
                <div>
                  <button
                    onClick={toggleUserDropdown}
                    className={dropdownButtonClasses(isUserManagementActive)}
                    aria-expanded={isUserDropdownOpen}
                    aria-controls="user-management-menu"
                  >
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium">User Management</span>
                    </div>
                    <div className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </button>

                  {isUserDropdownOpen && (
                    <div className="mt-1 space-y-1 animate-slideIn" id="user-management-menu">
                      <NavLink
                        to="/manage-users"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                        aria-label="Go to manage users"
                      >
                        <UsersIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>Manage Users</span>
                      </NavLink>
                      <NavLink
                        to="/user-tracker"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                        aria-label="Go to user tracker"
                      >
                        <EyeIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>User Tracker</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Project Management */}
                <div>
                  <button
                    onClick={toggleProjectDropdown}
                    className={dropdownButtonClasses(isProjectManagementActive)}
                    aria-expanded={isProjectDropdownOpen}
                    aria-controls="project-management-menu"
                  >
                    <div className="flex items-center gap-3">
                      <ProjectsIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium">Projects</span>
                    </div>
                    <div className={`transition-transform duration-200 ${isProjectDropdownOpen ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="mt-1 space-y-1 animate-slideIn" id="project-management-menu">
                      <NavLink
                        to="/active-projects"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                        aria-label="Go to active projects"
                      >
                        <FolderIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>Active Projects</span>
                      </NavLink>

                      <NavLink
                        to="/project-records"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                        aria-label="Go to project records"
                      >
                        <ProjectsIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>Project Records</span>
                      </NavLink>

                      <NavLink
                        to="/projects/add"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                        aria-label="Go to add project"
                      >
                        <PlusIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>Add Project</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Client Management */}
                <div>
                  <button
                    onClick={toggleClientDropdown}
                    className={dropdownButtonClasses(isClientManagementActive)}
                    aria-expanded={isClientDropdownOpen}
                    aria-controls="client-management-menu"
                  >
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium">Client Management</span>
                    </div>
                    <div className={`transition-transform duration-200 ${isClientDropdownOpen ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </button>

                  {isClientDropdownOpen && (
                    <div className="mt-1 space-y-1 animate-slideIn" id="client-management-menu">
                      <NavLink
                        to="/clients"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                        aria-label="Go to all clients"
                      >
                        <UsersIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>All Clients</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Vulnerability Management */}
                <div>
                  <button
                    onClick={toggleVulnDropdown}
                    className={dropdownButtonClasses(isVulnManagementActive)}
                    aria-expanded={isVulnDropdownOpen}
                    aria-controls="vulnerability-management-menu"
                  >
                    <div className="flex items-center gap-3">
                      <DatabaseIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-sm font-medium">Vulnerabilities</span>
                    </div>
                    <div className={`transition-transform duration-200 ${isVulnDropdownOpen ? 'rotate-180' : ''}`}>
                      <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </button>

                  {isVulnDropdownOpen && (
                    <div className="mt-1 space-y-1 animate-slideIn" id="vulnerability-management-menu">
                      <NavLink
                        to="/vulnerability-database"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                        aria-label="Go to vulnerability database"
                      >
                        <DatabaseIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span>Vulnerability Database</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tools Section - Admin & Tester */}
            {(user?.role === 'admin' || user?.role === 'tester') && (
              <div>
                <button
                  onClick={toggleToolsDropdown}
                  className={dropdownButtonClasses(isToolsActive)}
                  aria-expanded={isToolsDropdownOpen}
                  aria-controls="tools-menu"
                >
                  <div className="flex items-center gap-3">
                    <ToolsIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">Security Tools</span>
                  </div>
                  <div className={`transition-transform duration-200 ${isToolsDropdownOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
                  </div>
                </button>

                {isToolsDropdownOpen && (
                  <div className="mt-1 space-y-1 animate-slideIn" id="tools-menu">
                    <NavLink
                      to="/subdomain-finder"
                      className={subLinkClasses}
                      onClick={handleLinkClick}
                      aria-label="Go to subdomain finder"
                    >
                      <ToolsIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      <span>Subdomain Finder</span>
                    </NavLink>
                  </div>
                )}
              </div>
            )}
          </div>
           
        </nav>

        {/* Footer - User Info */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card">
            <div
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
              aria-label={`${userDisplayName} avatar`}
            >
              <span className="text-sm font-bold text-primary uppercase">
                {userInitial}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {userDisplayName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
});

// ✅ Display name for debugging
Sidebar.displayName = 'Sidebar';

export default Sidebar;
