// =======================================================================
// FILE: src/layouts/DashboardLayout.jsx (UPDATED)
// PURPOSE: A shared layout component for all dashboard pages.
// =======================================================================
import { Outlet } from 'react-router-dom';
import { UIProvider, useUI } from '../contexts/UIContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

// Inner component to access context provided by UIProvider
const DashboardContent = () => {
    const { isSidebarOpen, toggleSidebar } = useUI();
    return (
        <div className="relative min-h-screen bg-gray-100">
            <Sidebar />
            {/* Main content area with a smooth transition on its margin */}
            <div className={`relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Backdrop for mobile, appears when sidebar is open */}
                <div 
                    onClick={toggleSidebar} 
                    className={`fixed inset-0 z-20 bg-black opacity-50 transition-opacity lg:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
                ></div>
                <Navbar />
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};


const DashboardLayout = () => {
    return (
        <UIProvider>
            <DashboardContent />
        </UIProvider>
    );
};

export default DashboardLayout;