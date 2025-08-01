// =======================================================================
// FILE: src/components/Navbar.jsx (UPDATED)
// PURPOSE: The top navigation bar inside the dashboard.
// =======================================================================
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons for the user dropdown
const UserCircleIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const LogoutIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>;

const Navbar = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const pageClickEvent = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        if (dropdownOpen) {
            window.addEventListener('click', pageClickEvent);
        }
        return () => {
            window.removeEventListener('click', pageClickEvent);
        }
    }, [dropdownOpen]);

    return (
        <header className="bg-white shadow-sm h-16 flex justify-between items-center px-6 flex-shrink-0">
            {/* Left side - can be used for search or breadcrumbs later */}
            <div>
                <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>
            </div>

            {/* Right side - User menu */}
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)} 
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
                >
                    {/* Placeholder for profile image */}
                    <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block font-medium text-gray-700">{user?.name}</span>
                    <svg className="w-5 h-5 text-gray-500 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20">
                        <div className="px-4 py-3 border-b">
                            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                           <UserCircleIcon /> Profile
                        </Link>
                        <button 
                            onClick={() => {
                                logout();
                                setDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                            <LogoutIcon /> Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};
export default Navbar;
