// =======================================================================
// FILE: src/layouts/SharedLayout.jsx (NEW)
// PURPOSE: Wrapper layout for routes shared between Admin and Tester
// =======================================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from './AdminLayout';
import TesterLayout from './TesterLayout';

const SharedLayout = () => {
  const { user } = useAuth();

  // Render appropriate layout based on user role
  if (user?.role === 'admin') {
    return <AdminLayout />;
  } else if (user?.role === 'tester') {
    return <TesterLayout />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default SharedLayout;
