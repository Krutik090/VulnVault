import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // You might create a different TesterNavbar later

const TesterLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default TesterLayout;