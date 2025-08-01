
// =======================================================================
// FILE: src/components/Sidebar.jsx (NEW FILE)
// PURPOSE: The main sidebar navigation for the dashboard.
// =======================================================================
import { Link } from 'react-router-dom';

// Placeholder icons
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;
const UsersIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0112 13a5.995 5.995 0 01-3 5.197z"></path></svg>;

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white shadow-md flex-shrink-0">
            <div className="h-16 flex items-center justify-center border-b">
                 <img src="/default/logo.svg" alt="logo" className="h-8" />
            </div>
            <nav className="mt-4">
                <Link to="/dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200">
                    <DashboardIcon />
                    <span className="mx-4 font-medium">Dashboard</span>
                </Link>
                <Link to="/manage-users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-200">
                    <UsersIcon />
                    <span className="mx-4 font-medium">Manage Users</span>
                </Link>
                {/* Add more sidebar links here */}
            </nav>
        </aside>
    );
};

export default Sidebar;