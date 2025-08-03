// =======================================================================
// FILE: src/App.jsx (UPDATED)
// PURPOSE: Add the new route for the add client page.
// =======================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TesterLayout from './layouts/TesterLayout';
import AuthLayout from './layouts/AuthLayout';
import PMOLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import ManageUsersPage from './features/admin/ManageUsersPage';
import UserTrackerPage from './features/admin/UserTrackerPage';
import ProjectRecordsPage from './features/projects/ProjectRecordsPage';
import AddClientPage from './features/clients/AddClientPage'; // Import the new page
import TimeTrackerPage from './features/tracker/TimeTrackerPage';
import Spinner from './components/Spinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={!user ? <AuthLayout /> : <Navigate to="/" />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={user && user.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/manage-users" element={<ManageUsersPage />} />
          <Route path="/user-tracker" element={<UserTrackerPage />} />
          <Route path="/project-records" element={<ProjectRecordsPage />} />
          <Route path="/add-client" element={<AddClientPage />} /> {/* ADDED ROUTE */}
        </Route>

        <Route element={user && user.role === 'tester' ? <TesterLayout /> : <Navigate to="/login" />}>
          <Route path="/tester/dashboard" element={<div>Tester Dashboard</div>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/time-tracker" element={<TimeTrackerPage />} />
        </Route>

        <Route element={user && user.role === 'pmo' ? <PMOLayout /> : <Navigate to="/login" />}>
            <Route path="/pmo-dashboard" element={<div>PMO Dashboard</div>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/time-tracker" element={<TimeTrackerPage />} />
        </Route>

        <Route 
          path="/" 
          element={
            user 
            ? <Navigate to={
                user.role === 'admin' ? '/dashboard' :
                user.role === 'tester' ? '/tester/dashboard' :
                user.role === 'pmo' ? '/pmo-dashboard' :
                '/login'
              } replace /> 
            : <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;