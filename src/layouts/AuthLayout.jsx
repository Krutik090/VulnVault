import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    // Added a subtle gradient background for a more professional feel
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
