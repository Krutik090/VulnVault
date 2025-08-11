// =======================================================================
// FILE: src/App.jsx (UPDATED FOR THEMING & REMOVED PMO)
// PURPOSE: Add dark/light/multi-color theme + clean up routes for tester
// =======================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext'; // Theme Context

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TesterLayout from './layouts/TesterLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import ManageUsersPage from './features/admin/ManageUsersPage';
import UserTrackerPage from './features/admin/UserTrackerPage';
import ProjectRecordsPage from './features/projects/ProjectRecordsPage';
import AddClientPage from './features/clients/AddClientPage';
import TimeTrackerPage from './features/tracker/TimeTrackerPage';
import Spinner from './components/Spinner';
import ClientProjectsPage from './features/clients/ClientProjectsPage';
import ProjectDetailsPage from './features/projects/ProjectDetailsPage';
import VulnerabilityInstancesPage from './features/vulnerabilities/VulnerabilityInstancesPage';
import VulnerabilityInstanceDetailsPage from './features/vulnerabilities/VulnerabilityInstanceDetailsPage';
import VulnerabilityDatabasePage from './features/vulnerabilities/VulnerabilityDatabasePage';
import SubdomainFinderPage from './features/tools/SubdomainFinderPage';

function App() {
  const { user, loading } = useAuth();
  const { theme, color } = useTheme(); // Dark/light & color theme

  if (loading) {
    return <Spinner fullPage />;
  }

  return (
    // Apply selected theme & color variables
    <div className={`${theme} theme-${color} min-h-screen bg-background text-foreground`}>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth Routes */}
          <Route element={!user ? <AuthLayout /> : <Navigate to="/" />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={user && user.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/manage-users" element={<ManageUsersPage />} />
            <Route path="/user-tracker" element={<UserTrackerPage />} />
            <Route path="/project-records" element={<ProjectRecordsPage />} />
            <Route path="/add-client" element={<AddClientPage />} />
            <Route path="/clients/:clientId/projects" element={<ClientProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/vulnerabilities/:vulnName" element={<VulnerabilityInstancesPage />} />
            <Route path="/vulnerabilities/instance/:vulnId" element={<VulnerabilityInstanceDetailsPage />} />
            <Route path="/vulnerability-database" element={<VulnerabilityDatabasePage />} />
            <Route path="/subdomain-finder" element={<SubdomainFinderPage />} />
          </Route>

          {/* Tester Routes - ONLY THESE THREE */}
          <Route element={user && user.role === 'tester' ? <TesterLayout /> : <Navigate to="/login" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subdomain-finder" element={<SubdomainFinderPage />} />
          </Route>

          {/* Redirect based on role */}
          <Route
            path="/"
            element={
              user
                ? <Navigate to={
                    user.role === 'admin' ? '/dashboard' :
                    user.role === 'tester' ? '/dashboard' :
                    '/login'
                  } replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
