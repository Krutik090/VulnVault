// =======================================================================
// FILE: src/layouts/ClientLayout.jsx (UPDATED - FOLLOWING DASHBOARD PATTERN)
// PURPOSE: Layout wrapper for client role with navbar and sidebar
// =======================================================================

import { Outlet } from 'react-router-dom';
import { UIProvider, useUI } from '../contexts/UIContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Inner component to access context provided by UIProvider
const ClientLayoutContent = () => {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const { theme, color } = useTheme();

  return (
    <div className={`${theme} theme-${color} flex h-screen overflow-hidden bg-background`}>
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        {/* Navbar */}
        <Navbar />

        {/* Page Content - MINIMAL PADDING FOR MAXIMUM SPACE */}
        <main className="flex-1 overflow-y-auto bg-background w-full">
          {/* Reduced padding: p-3 on mobile, p-4 on desktop */}
          <div className="w-full h-full p-3 md:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// Main component that provides context
const ClientLayout = () => {
  return (
    <UIProvider>
      <ClientLayoutContent />
    </UIProvider>
  );
};

export default ClientLayout;
