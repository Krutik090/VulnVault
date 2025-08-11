// =======================================================================
// FILE: src/components/Navbar.jsx (UPDATED)
// PURPOSE: Advanced navigation bar with theme switching, user menu, and responsive design.
// =======================================================================
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useTheme } from '../contexts/ThemeContext';

// Icons
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const UserCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUI();
  const { theme, color, toggleTheme, setColor, COLOR_THEMES } = useTheme();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const pageClickEvent = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };

    if (dropdownOpen || themeDropdownOpen) {
      window.addEventListener('click', pageClickEvent);
    }

    return () => window.removeEventListener('click', pageClickEvent);
  }, [dropdownOpen, themeDropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const getColorPreview = (colorName) => {
    const colorMap = {
      blue: 'bg-blue-500',
      rose: 'bg-rose-500',
      emerald: 'bg-emerald-500',
      violet: 'bg-violet-500',
      amber: 'bg-amber-500',
      teal: 'bg-teal-500',
      orange: 'bg-orange-500',
    };
    return colorMap[colorName] || 'bg-blue-500';
  };

  return (
    <nav className={`${theme} theme-${color} bg-card border-b border-border`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Sidebar Toggle & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
            
            {/* App Logo/Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PT</span>
              </div>
              <span className="font-semibold text-card-foreground hidden sm:block">
                PenTest Pro
              </span>
            </div>
          </div>

          {/* Right Section - Theme Controls & User Menu */}
          <div className="flex items-center gap-2">
            {/* Theme Controls */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                aria-label="Theme settings"
              >
                <SettingsIcon />
                <span className="hidden md:inline">Theme</span>
                <ChevronDownIcon />
              </button>

              {/* Theme Dropdown */}
              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 p-4">
                  <div className="space-y-4">
                    {/* Dark/Light Mode Toggle */}
                    <div>
                      <label className="text-sm font-medium text-card-foreground mb-2 block">
                        Appearance
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleTheme}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                            ${theme === 'light' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          <SunIcon />
                          <span className="text-sm">Light</span>
                        </button>
                        <button
                          onClick={toggleTheme}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                            ${theme === 'dark' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          <MoonIcon />
                          <span className="text-sm">Dark</span>
                        </button>
                      </div>
                    </div>

                    {/* Color Theme Selection */}
                    <div>
                      <label className="text-sm font-medium text-card-foreground mb-2 block">
                        Color Theme
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_THEMES.map((colorTheme) => (
                          <button
                            key={colorTheme}
                            onClick={() => setColor(colorTheme)}
                            className={`
                              flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200
                              ${color === colorTheme 
                                ? 'bg-primary/10 ring-2 ring-primary text-primary' 
                                : 'hover:bg-accent hover:text-accent-foreground'
                              }
                            `}
                          >
                            <div className={`w-6 h-6 ${getColorPreview(colorTheme)} rounded-full`} />
                            <span className="text-xs capitalize">{colorTheme}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* User Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                aria-label="User menu"
              >
                <UserCircleIcon />
                <span className="hidden md:inline text-sm font-medium">
                  {user?.name || 'User'}
                </span>
                <ChevronDownIcon />
              </button>

              {/* User Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <p className="text-sm font-medium text-card-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role} Account</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserCircleIcon />
                      Profile Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogoutIcon />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
