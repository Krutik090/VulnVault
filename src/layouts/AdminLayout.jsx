// =======================================================================
// FILE: src/layouts/AdminLayout.jsx (UPDATED)
// PURPOSE: The main layout for all admin pages.
// =======================================================================
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          <Outlet /> {/* This renders the specific page component */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;