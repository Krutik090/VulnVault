// =======================================================================
// FILE: src/layouts/DashboardLayout.jsx (UPDATED)
// PURPOSE: A shared layout component for all dashboard pages with theme support.
// =======================================================================
import { Outlet } from 'react-router-dom';
import { UIProvider, useUI } from '../contexts/UIContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Inner component to access context provided by UIProvider
const DashboardContent = () => {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { theme, color } = useTheme();

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
        `}>
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <header className="bg-card border-b border-border shadow-sm">
            <Navbar />
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
            <div className="container mx-auto px-6 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Main component with UIProvider wrapper
const DashboardLayout = () => {
  return (
    <UIProvider>
      <DashboardContent />
    </UIProvider>
  );
};

export default DashboardLayout;
