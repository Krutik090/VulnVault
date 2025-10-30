// =======================================================================
// FILE: src/App.jsx (COMPLETELY REFACTORED)
// PURPOSE: Clean routing structure with shared routes
// =======================================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TesterLayout from './layouts/TesterLayout';
import AuthLayout from './layouts/AuthLayout';
import SharedLayout from './layouts/SharedLayout';

// Pages
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import ManageUsersPage from './features/admin/ManageUsersPage';
import UserTrackerPage from './features/admin/UserTrackerPage';
import ProjectRecordsPage from './features/projects/ProjectRecordsPage';
import Spinner from './components/Spinner';
import ProjectDetailsPage from './features/projects/ProjectDetailsPage';
import VulnerabilityInstancesPage from './features/vulnerabilities/VulnerabilityInstancesPage';
import VulnerabilityInstanceDetailsPage from './features/vulnerabilities/VulnerabilityInstanceDetailsPage';
import VulnerabilityDatabasePage from './features/vulnerabilities/VulnerabilityDatabasePage';
import SubdomainFinderPage from './features/tools/SubdomainFinderPage';
import ActiveProjectsPage from './features/projects/ActiveProjectsPage';
import AddProjectPage from './features/projects/AddProjectPage';
import ProjectConfigPage from './features/projects/ProjectConfigPage';
import AddVulnerabilityPage from './features/projects/AddVulnerabilityPage';
import StatisticsDashboardPage from './features/dashboard/StatisticsDashboardPage';

import ClientsPage from './features/clients/ClientsPage';
import ClientDetailsPage from './features/clients/ClientDetailsPage';
import ClientProjectsPage from './features/clients/ClientProjectsPage';
import ClientDashboardPage from './features/clients/ClientDashboardPage';

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
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route element={!user ? <AuthLayout /> : <Navigate to="/" replace />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* ==================== ROOT REDIRECT ==================== */}
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

          {/* ==================== SHARED ROUTES (Admin + Tester) ==================== */}
          <Route element={
            (user?.role === 'admin' || user?.role === 'tester')
              ? <SharedLayout />
              : <Navigate to="/login" replace />
          }>
            <Route path="/subdomain-finder" element={<SubdomainFinderPage />} />
          </Route>

          {/* ==================== TESTER ONLY ROUTES ==================== */}
          <Route element={user?.role === 'tester' ? <TesterLayout /> : <Navigate to="/login" replace />}>
            <Route path="/tester/dashboard" element={<DashboardPage />} />
            <Route path="/tester/profile" element={<ProfilePage />} />
          </Route>

          {/* ==================== ADMIN ONLY ROUTES ==================== */}
          <Route element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" replace />}>
            {/* Dashboard & Profile */}
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/profile" element={<ProfilePage />} />
            <Route path="/statistics" element={<StatisticsDashboardPage />} />

            {/* User Management */}
            <Route path="/manage-users" element={<ManageUsersPage />} />
            <Route path="/user-tracker" element={<UserTrackerPage />} />

            {/* Project Management */}
            <Route path="/active-projects" element={<ActiveProjectsPage />} />
            <Route path="/project-records" element={<ProjectRecordsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/add" element={<AddProjectPage />} />
            <Route path="/projects/:projectId/config" element={<ProjectConfigPage />} />
            <Route path="/projects/:projectId/add-vulnerability" element={<AddVulnerabilityPage />} />

            {/* Vulnerability Management */}
            <Route path="/ProjectVulnerabilities/instances/:vulnName" element={<VulnerabilityInstancesPage />} />
            <Route path="/ProjectVulnerabilities/instances/details/:vulnId" element={<VulnerabilityInstanceDetailsPage />} />
            <Route path="/vulnerability-database" element={<VulnerabilityDatabasePage />} />

            {/* Client Management */}
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="/clients/:clientId/projects" element={<ClientProjectsPage />} />
            <Route path="/client-dashboard" element={<ClientDashboardPage />} /> {/* For client role */}
            <Route path="/clients/:clientId/dashboard" element={<ClientDashboardPage />} />

          </Route>

          {/* ==================== 404 NOT FOUND ==================== */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-primary">404</h1>
                <p className="text-xl text-muted-foreground mt-4">Page Not Found</p>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
