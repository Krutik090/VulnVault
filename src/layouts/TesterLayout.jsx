// =======================================================================
// FILE: src/layouts/TesterLayout.jsx (UPDATED)
// PURPOSE: The main layout for all tester pages.
// =======================================================================
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Sidebar'; // Re-using the same sidebar for now

const TesterLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TesterLayout;