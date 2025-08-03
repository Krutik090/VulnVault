// =======================================================================
// FILE: src/components/Sidebar.jsx (FIXED)
// =======================================================================
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';

// Icons
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0112 13a5.995 5.995 0 01-3 5.197z"></path></svg>;
const ProjectsIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>;
const TimeIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const ChevronDownIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

const Sidebar = () => {
    const { user } = useAuth();
    const { isSidebarOpen } = useUI();
    const location = useLocation();
    
    const isUserManagementActive = location.pathname.startsWith('/manage-users') || location.pathname.startsWith('/user-tracker');
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(isUserManagementActive);

    const isProjectManagementActive = location.pathname.startsWith('/project-records') || location.pathname.startsWith('/add-client');
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(isProjectManagementActive);

    useEffect(() => {
        if (isUserManagementActive) {
            setIsUserDropdownOpen(true);
        }
    }, [location.pathname, isUserManagementActive]);

    useEffect(() => {
        if (isProjectManagementActive) {
            setIsProjectDropdownOpen(true);
        }
    }, [location.pathname, isProjectManagementActive]);
    
    const linkClasses = "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 transition-colors duration-200";
    const activeLinkClasses = "bg-pink-100 text-pink-600 border-r-4 border-pink-500 font-semibold";
    const subLinkClasses = "flex items-center py-2 pl-16 pr-6 text-gray-600 hover:bg-gray-100 text-sm";
    const activeSubLinkClasses = "text-pink-600 font-bold";

    return (
        <aside className={`fixed inset-y-0 left-0 bg-white shadow-lg z-30 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'}`}>
            <div className="h-16 flex items-center justify-center border-b">
                 <img src="/default/logo.svg" alt="logo" className={`transition-all duration-300 ${isSidebarOpen ? 'h-8' : 'h-10'}`} />
            </div>
            <nav className="mt-4">
                <NavLink to="/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <DashboardIcon />
                    <span className={`mx-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Dashboard</span>
                </NavLink>

                {user?.role !== 'admin' && (
                     <NavLink to="/time-tracker" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                        <TimeIcon />
                        <span className={`mx-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Time Tracker</span>
                    </NavLink>
                )}

                {user?.role === 'admin' && (
                    <>
                        {/* Project Management Dropdown */}
                        <div>
                            <button onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)} className={`${linkClasses} w-full justify-between ${isProjectManagementActive ? 'bg-gray-100' : ''}`}>
                                <div className="flex items-center">
                                    <ProjectsIcon />
                                    <span className={`mx-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Manage Projects</span>
                                </div>
                                <ChevronDownIcon className={`transition-transform duration-300 ${isProjectDropdownOpen && 'rotate-180'} ${!isSidebarOpen && 'hidden'}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isProjectDropdownOpen ? 'max-h-40' : 'max-h-0'}`}>
                                <NavLink to="/add-client" className={({ isActive }) => `${subLinkClasses} ${isActive ? activeSubLinkClasses : ''}`}>
                                     <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Add Client</span>
                                </NavLink>
                                <NavLink to="/project-records" className={({ isActive }) => `${subLinkClasses} ${isActive ? activeSubLinkClasses : ''}`}>
                                     <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Project Records</span>
                                </NavLink>
                            </div>
                        </div>

                        {/* User Management Dropdown */}
                        <div>
                            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className={`${linkClasses} w-full justify-between ${isUserManagementActive ? 'bg-gray-100' : ''}`}>
                                <div className="flex items-center">
                                    <UsersIcon />
                                    <span className={`mx-4 font-medium whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>User Management</span>
                                </div>
                                <ChevronDownIcon className={`transition-transform duration-300 ${isUserDropdownOpen && 'rotate-180'} ${!isSidebarOpen && 'hidden'}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isUserDropdownOpen ? 'max-h-40' : 'max-h-0'}`}>
                                <NavLink to="/manage-users" className={({ isActive }) => `${subLinkClasses} ${isActive ? activeSubLinkClasses : ''}`}>
                                     <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>User List</span>
                                </NavLink>
                                <NavLink to="/user-tracker" className={({ isActive }) => `${subLinkClasses} ${isActive ? activeSubLinkClasses : ''}`}>
                                    <span className={`whitespace-nowrap transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Track Activities</span>
                                </NavLink>
                            </div>
                        </div>
                    </>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;