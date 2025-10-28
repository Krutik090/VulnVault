// =======================================================================
// FILE: src/components/Sidebar.jsx (FIXED COLLAPSE ANIMATION)
// PURPOSE: Fixed dropdown collapse with proper animations
// =======================================================================

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Icons (keep all your existing icons)
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const ProjectsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const TimeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);


const ToolsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Sidebar = () => {
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { theme, color } = useTheme();
  const location = useLocation();

  // Dropdown states
  const isUserManagementActive = location.pathname.startsWith('/manage-users') || location.pathname.startsWith('/user-tracker');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(isUserManagementActive);

  const isProjectManagementActive = location.pathname.startsWith('/project-records') ||
    location.pathname.startsWith('/add-client') ||
    location.pathname.startsWith('/clients/') ||
    location.pathname.startsWith('/projects/');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(isProjectManagementActive);

  const isVulnManagementActive = location.pathname.startsWith('/vulnerability-database') ||
    location.pathname.startsWith('/vulnerabilities/') ||
    location.pathname.startsWith('/project-vulnerabilities/');
  const [isVulnDropdownOpen, setIsVulnDropdownOpen] = useState(isVulnManagementActive);

  const isClientManagementActive = location.pathname.startsWith('/clients') || location.pathname.startsWith('/add-client');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(isClientManagementActive);

  const isToolsActive = location.pathname.startsWith('/subdomain-finder');
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(isToolsActive);

  // Auto-open dropdowns when navigating to their pages
  useEffect(() => {
    if (isUserManagementActive) setIsUserDropdownOpen(true);
  }, [isUserManagementActive]);

  useEffect(() => {
    if (isProjectManagementActive) setIsProjectDropdownOpen(true);
  }, [isProjectManagementActive]);

  useEffect(() => {
    if (isVulnManagementActive) setIsVulnDropdownOpen(true);
  }, [isVulnManagementActive]);
  useEffect(() => {
    if (isClientManagementActive) setIsClientDropdownOpen(true);
  }, [isClientManagementActive]);

  useEffect(() => {
    if (isToolsActive) setIsToolsDropdownOpen(true);
  }, [isToolsActive]);

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const linkClasses = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-lg mx-2 transition-all duration-200 group
    ${isActive
      ? 'bg-primary text-primary-foreground shadow-md font-semibold'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }
  `;

  const dropdownButtonClasses = (isActive) => `
    flex items-center justify-between w-full px-4 py-3 rounded-lg mx-2 transition-all duration-200 group
    ${isActive
      ? 'bg-primary/10 text-primary font-semibold'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }
  `;

  const subLinkClasses = ({ isActive }) => `
    flex items-center gap-3 py-2.5 pl-12 pr-4 mx-2 text-sm rounded-lg transition-all duration-200
    ${isActive
      ? 'text-primary font-medium bg-primary/5 border-l-4 border-primary'
      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border-l-4 border-transparent'
    }
  `;

  return (
    <>
      <aside
        className={`${theme} theme-${color} fixed lg:static inset-y-0 left-0 z-30 w-72 h-screen overflow-hidden bg-card border-r border-border flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <ShieldIcon className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-card-foreground">PenTest Pro</h2>
              <p className="text-xs text-muted-foreground capitalize">{user?.role} Panel</p>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-2">
          <div className="space-y-2">
            {/* Dashboard */}
            <NavLink
              to={`/${user?.role}/dashboard`}
              className={linkClasses}
              onClick={handleLinkClick}
            >
              <DashboardIcon />
              <span className="text-sm font-medium">Dashboard</span>
            </NavLink>

            {/* Admin-only sections */}
            {user?.role === 'admin' && (
              <>
                {/* User Management - ✅ FIXED COLLAPSE */}
                <div>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className={dropdownButtonClasses(isUserManagementActive)}
                  >
                    <div className="flex items-center gap-3">
                      <UsersIcon />
                      <span className="text-sm font-medium">User Management</span>
                    </div>
                    <div className={isUserDropdownOpen ? 'rotate-180' : ''}>
                      <ChevronDownIcon />
                    </div>
                  </button>

                  {/* ✅ FIXED: Proper collapse animation */}
                  {isUserDropdownOpen && (
                    <div className="mt-1 space-y-1 animate-slideIn">
                      <NavLink
                        to="/manage-users"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                      >
                        <UsersIcon />
                        <span>Manage Users</span>
                      </NavLink>
                      <NavLink
                        to="/user-tracker"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                      >
                        <EyeIcon />
                        <span>User Tracker</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Project Management - ✅ FIXED COLLAPSE */}
                <div>
                  <button
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className={dropdownButtonClasses(isProjectManagementActive)}
                  >
                    <div className="flex items-center gap-3">
                      <ProjectsIcon />
                      <span className="text-sm font-medium">Projects</span>
                    </div>
                    <div className={isProjectDropdownOpen ? 'rotate-180' : ''}>
                      <ChevronDownIcon />
                    </div>
                  </button>

                  {isProjectDropdownOpen && (
                    <div className="mt-1 space-y-1 animate-slideIn">
                      <NavLink
                        to="/active-projects"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                      >
                        <FolderIcon />
                        <span>Active Projects</span>
                      </NavLink>

                      <NavLink
                        to="/project-records"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                      >
                        <ProjectsIcon />
                        <span>Project Records</span>
                      </NavLink>
                      <NavLink
                        to="/add-client"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                      >
                        <PlusIcon />
                        <span>Add Client</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Client Management - Admin Only */}
                {user?.role === 'admin' && (
                  <div>
                    <button
                      onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                      className={dropdownButtonClasses(isClientManagementActive)}
                    >
                      <div className="flex items-center gap-3">
                        <UsersIcon />
                        <span className="text-sm font-medium">Client Management</span>
                      </div>
                      <div className={isClientDropdownOpen ? 'rotate-180' : ''}>
                        <ChevronDownIcon />
                      </div>
                    </button>

                    {isClientDropdownOpen && (
                      <div className="mt-1 space-y-1 animate-slideIn">
                        <NavLink
                          to="/clients"
                          className={subLinkClasses}
                          onClick={handleLinkClick}
                        >
                          <UsersIcon />
                          <span>All Clients</span>
                        </NavLink>
                        <NavLink
                          to="/add-client"
                          className={subLinkClasses}
                          onClick={handleLinkClick}
                        >
                          <PlusIcon />
                          <span>Add Client</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                )}

                {/* Vulnerability Management - ✅ FIXED COLLAPSE */}
                <div>
                  <button
                    onClick={() => setIsVulnDropdownOpen(!isVulnDropdownOpen)}
                    className={dropdownButtonClasses(isVulnManagementActive)}
                  >
                    <div className="flex items-center gap-3">
                      <DatabaseIcon />
                      <span className="text-sm font-medium">Vulnerabilities</span>
                    </div>
                    <div className={isVulnDropdownOpen ? 'rotate-180' : ''}>
                      <ChevronDownIcon />
                    </div>
                  </button>

                  {isVulnDropdownOpen && (
                    <div className="mt-1 space-y-1 animate-slideIn">
                      <NavLink
                        to="/vulnerability-database"
                        className={subLinkClasses}
                        onClick={handleLinkClick}
                      >
                        <DatabaseIcon />
                        <span>Vulnerability Database</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Tools Section - ✅ FIXED COLLAPSE */}
            <div>
              <button
                onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
                className={dropdownButtonClasses(isToolsActive)}
              >
                <div className="flex items-center gap-3">
                  <ToolsIcon />
                  <span className="text-sm font-medium">Security Tools</span>
                </div>
                <div className={isToolsDropdownOpen ? 'rotate-180' : ''}>
                  <ChevronDownIcon />
                </div>
              </button>

              {isToolsDropdownOpen && (
                <div className="mt-1 space-y-1 animate-slideIn">
                  <NavLink
                    to="/subdomain-finder"
                    className={subLinkClasses}
                    onClick={handleLinkClick}
                  >
                    <ToolsIcon />
                    <span>Subdomain Finder</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Tester-only sections */}
            {user?.role === 'tester' && (
              <NavLink
                to="/time-tracker"
                className={linkClasses}
                onClick={handleLinkClick}
              >
                <TimeIcon />
                <span className="text-sm font-medium">Time Tracker</span>
              </NavLink>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary uppercase">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
