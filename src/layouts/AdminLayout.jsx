
// =======================================================================
// FILE: src/layouts/AdminLayout.jsx
// PURPOSE: The main layout for all admin pages (replaces *ngIf logic).
// =======================================================================
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet /> {/* This renders the specific page component */}
      </main>
    </div>
  );
};

export default AdminLayout;