// =======================================================================
// FILE: src/components/Sidebar.jsx (UPDATED)
// PURPOSE: A responsive and collapsible sidebar.
// =======================================================================
import { NavLink } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';

// Placeholder icons
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0112 13a5.995 5.995 0 01-3 5.197z"></path></svg>;

const Sidebar = () => {
    const { isSidebarOpen } = useUI();

    const linkClasses = "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 transition-colors duration-200";
    const activeLinkClasses = "bg-pink-100 text-pink-600 border-r-4 border-pink-500 font-semibold";

    return (
        <aside className={`fixed inset-y-0 left-0 bg-white shadow-lg z-30 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
            <div className="h-16 flex items-center justify-center border-b">
                 <img src="/default/logo.svg" alt="logo" className={`transition-all duration-300 ${isSidebarOpen ? 'h-8' : 'h-10'}`} />
            </div>
            <nav className="mt-4">
                <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                    <DashboardIcon />
                    <span className={`mx-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Dashboard</span>
                </NavLink>
                <NavLink 
                    to="/manage-users" 
                    className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                    <UsersIcon />
                    <span className={`mx-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Manage Users</span>
                </NavLink>
                {/* Add more sidebar links here */}
            </nav>
        </aside>
    );
};

export default Sidebar;