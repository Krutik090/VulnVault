
// =======================================================================
// FILE: src/components/Navbar.jsx (Placeholder)
// =======================================================================
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { logout } = useAuth();
    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0 text-xl font-bold">VulnVault</div>
                    <button 
                        onClick={logout}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;