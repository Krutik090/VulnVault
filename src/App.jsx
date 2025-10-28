// =======================================================================
// FILE: src/App.jsx
// PURPOSE: Add dark/light/multi-color theme + clean up shared routes
// =======================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

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
import Spinner from './components/Spinner';
import ClientProjectsPage from './features/clients/ClientProjectsPage';
import ProjectDetailsPage from './features/projects/ProjectDetailsPage';
import VulnerabilityInstancesPage from './features/vulnerabilities/VulnerabilityInstancesPage';
import VulnerabilityInstanceDetailsPage from './features/vulnerabilities/VulnerabilityInstanceDetailsPage';
import VulnerabilityDatabasePage from './features/vulnerabilities/VulnerabilityDatabasePage';
import SubdomainFinderPage from './features/tools/SubdomainFinderPage';
import ActiveProjectsPage from './features/projects/ActiveProjectsPage';
import ClientsPage from './features/clients/ClientsPage';
import ClientDetailsPage from './features/clients/ClientDetailsPage';
import AddProjectPage from './features/projects/AddProjectPage';
import ProjectConfigPage from './features/projects/ProjectConfigPage';
import AddVulnerabilityPage from './features/projects/AddVulnerabilityPage';

function App() {
  const { user, loading } = useAuth();
  const { theme, color } = useTheme();

  if (loading) {
    return <Spinner fullPage />;
  }

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background text-foreground`}>
      <BrowserRouter>
        <Routes>
          {/* Public / Auth */}
          <Route element={!user ? <AuthLayout /> : <Navigate to="/" replace />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Redirect root based on role */}
          <Route
            path="/"
            element={
              user
                ? user.role === 'admin'
                  ? <Navigate to="/admin/dashboard" replace />
                  : user.role === 'tester'
                    ? <Navigate to="/tester/dashboard" replace />
                    : <Navigate to="/login" replace />
                : <Navigate to="/login" replace />
            }
          />

          {/* Tester */}
          <Route element={user?.role === 'tester' ? <TesterLayout /> : <Navigate to="/login" replace />}>
            <Route path="/tester/dashboard" element={<DashboardPage />} />
            <Route path="/tester/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin */}
          <Route element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" replace />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/manage-users" element={<ManageUsersPage />} />
            <Route path="/user-tracker" element={<UserTrackerPage />} />
            <Route path="/active-projects" element={<ActiveProjectsPage />} />
            <Route path="/project-records" element={<ProjectRecordsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/add" element={<AddProjectPage />} />
            <Route path="/projects/:projectId/config" element={<ProjectConfigPage />} />
            <Route path="/projects/:projectId/add-vulnerability" element={<AddVulnerabilityPage />} />

            <Route path="/ProjectVulnerabilities/instances/:vulnName" element={<VulnerabilityInstancesPage />} />
            <Route path="/ProjectVulnerabilities/instances/details/:vulnId" element={<VulnerabilityInstanceDetailsPage />} />
            <Route path="/vulnerability-database" element={<VulnerabilityDatabasePage />} />
            // Client Management Routes
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="/clients/:clientId/projects" element={<ClientProjectsPage />} />

          </Route>

          {/* Shared between admin & tester */}
          {(user?.role === 'admin' || user?.role === 'tester') && (
            <Route path="/subdomain-finder" element={<SubdomainFinderPage />} />
          )}

          {/* 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
