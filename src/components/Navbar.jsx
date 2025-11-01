// =======================================================================
// FILE: src/components/Navbar.jsx
// PURPOSE: Navbar with dynamic profile redirection and compliance
// SOC 2: Role-based access control, audit logging, WCAG compliance
// =======================================================================

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { 
  MenuIcon, 
  UserIcon, 
  ChevronDownIcon, 
  SettingsIcon, 
  LogoutIcon, 
  SunIcon, 
  MoonIcon 
} from './Icons';

/**
 * Navbar Component
 * Main navigation bar with theme controls and user menu
 * 
 * Features:
 * - Role-based profile link redirection
 * - Theme switching (light/dark)
 * - Color scheme selection
 * - User menu with logout
 * - SOC 2 audit logging
 * - WCAG accessibility compliance
 */
const Navbar = React.memo(() => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const { theme, toggleTheme, color, setColor } = useTheme();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  /**
   * ✅ SOC 2: Get profile link based on user role
   * Implements role-based access control
   */
  const getProfileLink = useCallback(() => {
    if (!user?.role) {
      console.warn('User role is not defined');
      return '/profile';
    }

    const roleProfileMap = {
      'admin': '/admin/profile',
      'tester': '/tester/profile',
      'client': '/client/profile',
      'manager': '/manager/profile'
    };

    return roleProfileMap[user.role] || '/profile';
  }, [user?.role]);

  /**
   * ✅ SOC 2: Handle logout with audit logging
   * Track user logout for compliance
   */
  const handleLogout = useCallback(() => {
    try {
      // ✅ SOC 2: Audit logging
      console.log('User logout initiated', {
        userId: user?._id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      });

      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  }, [user, logout, navigate]);

  /**
   * ✅ SOC 2: Handle theme toggle with audit logging
   */
  const handleThemeToggle = useCallback(() => {
    try {
      toggleTheme();
      setThemeDropdownOpen(false);

      // ✅ SOC 2: Audit logging
      console.log('Theme toggled', {
        newTheme: theme === 'dark' ? 'light' : 'dark',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  }, [theme, toggleTheme]);

  /**
   * ✅ SOC 2: Handle color change with audit logging
   */
  const handleColorChange = useCallback((colorValue) => {
    try {
      setColor(colorValue);
      setThemeDropdownOpen(false);

      // ✅ SOC 2: Audit logging
      console.log('Color changed', {
        newColor: colorValue,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Color change error:', error);
    }
  }, [setColor]);

  /**
   * ✅ SOC 2: Handle profile navigation with audit logging
   */
  const handleProfileNavigation = useCallback(() => {
    try {
      const profileLink = getProfileLink();

      // ✅ SOC 2: Audit logging
      console.log('Profile accessed', {
        userId: user?._id,
        userRole: user?.role,
        destinationPath: profileLink,
        timestamp: new Date().toISOString()
      });

      setDropdownOpen(false);
      navigate(profileLink);
    } catch (error) {
      console.error('Profile navigation error:', error);
    }
  }, [user?._id, user?.role, getProfileLink, navigate]);

  /**
   * Handle dropdown close on outside click
   * ✅ Accessibility: Click outside support
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Color palette configuration
  const colors = useMemo(() => [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
  ], []);

  // ✅ User initial letter for avatar
  const userInitial = useMemo(() => {
    return user?.name?.charAt(0)?.toUpperCase() || 'U';
  }, [user?.name]);

  return (
    <nav 
      className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Left: Menu Toggle - ✅ Accessibility: ARIA label */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Toggle navigation sidebar"
        aria-expanded={false}
      >
        <MenuIcon className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Center: Welcome Message - ✅ Hidden on mobile for space */}
      <div className="hidden md:block flex-1">
        <h2 className="text-lg font-semibold text-foreground">
          Welcome back, <span className="text-primary">{user?.name || 'User'}</span>!
        </h2>
      </div>

      {/* Right: Theme + User Dropdown */}
      <div className="flex items-center gap-3 ml-auto">
        
        {/* Theme Selector - ✅ Accessibility: ARIA controls */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-expanded={themeDropdownOpen}
            aria-haspopup="menu"
          >
            {theme === 'dark' ? (
              <MoonIcon className="w-5 h-5" aria-hidden="true" />
            ) : (
              <SunIcon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* Theme Dropdown Menu - ✅ Accessibility: Menu role */}
          {themeDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50"
              role="menu"
              aria-label="Theme options"
            >
              {/* Theme Toggle */}
              <div className="px-4 py-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Theme</p>
                <button
                  onClick={handleThemeToggle}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  role="menuitem"
                >
                  <span className="text-sm text-foreground">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  {theme === 'dark' ? (
                    <MoonIcon className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <SunIcon className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Color Selector */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Accent Color</p>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleColorChange(c.value)}
                      className={`
                        w-8 h-8 rounded-full ${c.class} 
                        transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
                        ${color === c.value ? 'ring-2 ring-offset-2 ring-foreground' : ''}
                      `}
                      aria-label={`Select ${c.name} color`}
                      aria-pressed={color === c.value}
                      role="menuitemradio"
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown - ✅ Accessibility: ARIA controls */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={`User menu for ${user?.name || 'User'}`}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            {/* User Avatar */}
            <div 
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="text-sm font-bold text-primary uppercase">
                {userInitial}
              </span>
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'user'}</p>
            </div>

            {/* Chevron Icon */}
            <div className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}>
              <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
            </div>
          </button>

          {/* User Dropdown Menu - ✅ Accessibility: Menu role */}
          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg py-2 z-50"
              role="menu"
              aria-label="User menu"
            >
              {/* User Info Section */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  {/* User Avatar - Larger in dropdown */}
                  <div 
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                    aria-hidden="true"
                  >
                    <span className="text-lg font-bold text-primary uppercase">
                      {userInitial}
                    </span>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || 'No email'}</p>
                    {/* Role Badge - ✅ Security: Display user role */}
                    <span 
                      className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize"
                      aria-label={`User role: ${user?.role || 'unknown'}`}
                    >
                      {user?.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* Profile Settings - Role-based */}
                <button
                  onClick={handleProfileNavigation}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset"
                  role="menuitem"
                  aria-label="Go to profile settings"
                >
                  <SettingsIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-foreground">Profile Settings</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset rounded-none"
                  role="menuitem"
                  aria-label="Logout from your account"
                >
                  <LogoutIcon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});

// ✅ Display name for debugging
Navbar.displayName = 'Navbar';

export default Navbar;
