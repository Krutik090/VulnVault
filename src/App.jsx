
// =======================================================================
// FILE: src/App.jsx
// PURPOSE: Defines all application routes (replaces app-routing.module.ts).
// =======================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TesterLayout from './layouts/TesterLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import Spinner from './components/Spinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes are only accessible if the user is NOT logged in */}
        <Route element={!user ? <AuthLayout /> : <Navigate to="/" />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={user && user.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Add other admin routes here */}
        </Route>

        {/* Protected Tester Routes */}
        <Route element={user && user.role === 'tester' ? <TesterLayout /> : <Navigate to="/login" />}>
          <Route path="/tester/dashboard" element={<div>Tester Dashboard</div>} />
          {/* Add other tester routes here */}
        </Route>

        {/* Fallback route to redirect to the correct dashboard or login */}
        <Route 
          path="/" 
          element={
            user 
            ? <Navigate to={user.role === 'admin' ? '/dashboard' : '/tester/dashboard'} replace /> 
            : <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;