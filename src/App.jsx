// =======================================================================
// FILE: src/App.jsx (FIXED - PROPER ROUTE ORGANIZATION)
// PURPOSE: Clean routing structure with role-based access control
//          Fixed: Client route navigation now works properly
// =======================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// ========================================
// LAYOUTS
// ========================================
import AdminLayout from './layouts/AdminLayout';
import TesterLayout from './layouts/TesterLayout';
import ClientLayout from './layouts/ClientLayout';
import AuthLayout from './layouts/AuthLayout';

// ========================================
// AUTH PAGES
// ========================================
import LoginPage from './features/auth/LoginPage';

// ========================================
// DASHBOARD & PROFILE (Shared)
// ========================================
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import StatisticsDashboardPage from './features/dashboard/StatisticsDashboardPage';
import SubdomainFinderPage from './features/tools/SubdomainFinderPage';

// ========================================
// PROJECT & VULNERABILITY (Shared across layouts)
// ========================================
import ProjectDetailsPage from './features/projects/ProjectDetailsPage';
import VulnerabilityInstanceDetailsPage from './features/vulnerabilities/VulnerabilityInstanceDetailsPage';
import VulnerabilityInstancesPage from './features/vulnerabilities/VulnerabilityInstancesPage';

// ========================================
// ADMIN ONLY PAGES
// ========================================
import ManageUsersPage from './features/admin/ManageUsersPage';
import UserTrackerPage from './features/admin/UserTrackerPage';
import ActiveProjectsPage from './features/projects/ActiveProjectsPage';
import ProjectRecordsPage from './features/projects/ProjectRecordsPage';
import AddProjectPage from './features/projects/AddProjectPage';
import ProjectConfigPage from './features/projects/ProjectConfigPage';
import AddVulnerabilityPage from './features/projects/AddVulnerabilityPage';
import VulnerabilityDatabasePage from './features/vulnerabilities/VulnerabilityDatabasePage';
import ClientsPage from './features/clients/ClientsPage';
import ClientDetailsPage from './features/clients/ClientDetailsPage';
import ClientProjectsPage from './features/clients/ClientProjectsPage';

// ========================================
// TESTER ONLY PAGES
// ========================================
import TesterDashboardPage from './features/tester/TesterDashboardPage';
import TesterProjectsPage from './features/tester/TesterProjectsPage';

// ========================================
// CLIENT ONLY PAGES
// ========================================
import ClientDashboardPage from './features/clients/ClientDashboardPage';

// ========================================
// COMPONENTS
// ========================================
import Spinner from './components/Spinner';

// ========================================
// HELPER COMPONENTS
// ========================================
const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl text-muted-foreground mt-4">Page Not Found</p>
    </div>
  </div>
);

const RoleRedirect = ({ user }) => {
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'tester':
      return <Navigate to="/tester/dashboard" replace />;
    case 'client':
      return <Navigate to="/client/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

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
          <Route path="/" element={<RoleRedirect user={user} />} />

          {/* ==================== TESTER ROUTES ==================== */}
          <Route
            element={
              user?.role === 'tester' || user?.role === 'admin'
                ? <TesterLayout />
                : <Navigate to="/login" replace />
            }
          >
            <Route path="/tester/dashboard" element={<TesterDashboardPage />} />
            <Route path="/tester/projects" element={<TesterProjectsPage />} />
            <Route path="/tester/profile" element={<ProfilePage />} />

            {/* Tester Specific - Projects & Vulnerabilities */}
            <Route path="/statistics" element={<StatisticsDashboardPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/projects/:projectId/add-vulnerability" element={<AddVulnerabilityPage />} />
            <Route path="/ProjectVulnerabilities/instances/details/:vulnId" element={<VulnerabilityInstanceDetailsPage />} />
            <Route path="/subdomain-finder" element={<SubdomainFinderPage />} />
          </Route>

          {/* ==================== ADMIN ROUTES ==================== */}
          <Route
            element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" replace />}
          >
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
            <Route path="/projects/add" element={<AddProjectPage />} />
            {/* ✅ FIXED: Use /admin/projects/:projectId to avoid conflicts */}
            <Route path="/admin/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/admin/projects/:projectId/config" element={<ProjectConfigPage />} />
            <Route path="/admin/projects/:projectId/add-vulnerability" element={<AddVulnerabilityPage />} />
            <Route path="/admin/projects/:projectId/edit" element={<AddProjectPage isEdit={true} />} />

            {/* Vulnerability Management */}
            <Route path="/vulnerability-database" element={<VulnerabilityDatabasePage />} />
            <Route path="/admin/ProjectVulnerabilities/instances/:vulnName" element={<VulnerabilityInstancesPage />} />
            <Route path="/admin/ProjectVulnerabilities/instances/details/:vulnId" element={<VulnerabilityInstanceDetailsPage />} />

            {/* Client Management */}
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:clientId" element={<ClientDetailsPage />} />
            <Route path="/clients/:clientId/projects" element={<ClientProjectsPage />} />
            <Route path="/clients/:clientId/dashboard" element={<ClientDashboardPage />} />

            {/* Tools */}
            <Route path="/subdomain-finder" element={<SubdomainFinderPage />} />
          </Route>

          {/* ==================== CLIENT ROUTES ==================== */}
          <Route
            element={user?.role === 'client' ? <ClientLayout /> : <Navigate to="/login" replace />}
          >
            {/* Client Dashboard & Profile */}
            <Route path="/client/dashboard" element={<ClientDashboardPage />} />
            <Route path="/client/profile" element={<ProfilePage />} />
            <Route path="/client/projects" element={<ClientProjectsPage />} />

            {/* ✅ FIXED: Client can view project details */}
            {/* Using /client/projects/:projectId instead of /projects/:projectId */}
            <Route path="/client/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/client/projects/:projectId/vulnerabilities/:vulnName" element={<VulnerabilityInstancesPage />} />
            <Route path="/client/projects/:projectId/vulnerabilities/details/:vulnId" element={<VulnerabilityInstanceDetailsPage />} />

            {/* Alternative: Also support /projects/:projectId for backward compatibility */}
            <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
            <Route path="/ProjectVulnerabilities/instances/:vulnName" element={<VulnerabilityInstancesPage />} />
            <Route path="/ProjectVulnerabilities/instances/details/:vulnId" element={<VulnerabilityInstanceDetailsPage />} />
          </Route>

          {/* ==================== 404 NOT FOUND ==================== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
