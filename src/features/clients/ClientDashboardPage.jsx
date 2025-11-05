/**
 * =======================================================================
 * FILE: src/features/clients/ClientDashboardPage.jsx (COMPLETELY UPDATED)
 * PURPOSE: Dashboard for viewing client data (admin & client roles)
 * FIXES:
 * - Proper role-based API calls (client users use /my-dashboard)
 * - Removed cookie parsing (handled by backend)
 * - Better error handling and loading states
 * - Cleaner code structure
 * SOC 2 NOTES: Centralized icon management, secure API handling, audit logging
 * =======================================================================
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDashboard, getMyDashboard } from '../../api/clientApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  FolderIcon,
  BugIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  AlertTriangleIcon,
} from '../../components/Icons';

// ✅ SOC 2: Severity badge color mapping
const getSeverityBadgeColor = (severity) => {
  const colors = {
    critical:
      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    medium:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    informational:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };
  return (
    colors[severity?.toLowerCase()] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
  );
};

// ✅ SOC 2: Status badge color mapping
const getStatusBadgeColor = (status) => {
  const colors = {
    Active:
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
    Completed:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    'In Progress':
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  };
  return (
    colors[status] ||
    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
  );
};

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const { theme, color } = useTheme();
  const navigate = useNavigate();
  const { clientId: paramClientId } = useParams();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // ✅ FIXED: Determine if admin is viewing a specific client
  const isAdminViewing = !!paramClientId && user?.role === 'admin';

  useEffect(() => {
    fetchDashboard();
  }, [user?.role, paramClientId]);

  /**
   * ✅ FIXED: Fetch dashboard with proper role-based logic
   */
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      // ✅ FIXED: Use different endpoints based on role and context
      if (user?.role === 'client') {
        // ✅ Client users always use /my-dashboard
        console.log('🔍 Fetching dashboard for current client user');
        response = await getMyDashboard();
      } else if (user?.role === 'admin' && paramClientId) {
        // ✅ Admins viewing specific client dashboard
        console.log(`🔍 Admin viewing client dashboard: ${paramClientId}`);
        response = await getClientDashboard(paramClientId);
      } else {
        // ✅ Invalid state
        throw new Error(
          'Invalid access: Please provide a client ID or log in as a client'
        );
      }

      console.log('📊 Dashboard fetched successfully');

      // ✅ SOC 2: Safe data extraction
      if (response?.data) {
        setDashboardData(response.data);
      } else if (response?.success === false) {
        throw new Error(response.message || 'Failed to load dashboard');
      } else {
        throw new Error('No dashboard data available');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error.message);
      setError(error.message);
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className={`${theme} theme-${color}`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="large" message="Loading dashboard..." />
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className={`${theme} theme-${color}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <AlertTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md">
            {error}
          </p>
          <div className="flex gap-3">
            <button
              onClick={fetchDashboard}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              aria-label="Retry loading dashboard"
            >
              Try Again
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/clients')}
                className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-accent transition-colors"
                aria-label="Back to clients"
              >
                Back to Clients
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ✅ No data state
  if (!dashboardData) {
    return (
      <div className={`${theme} theme-${color}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No Data Available
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unable to load dashboard data
          </p>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/clients')}
              className="text-primary hover:underline"
              aria-label="Back to clients"
            >
              Back to Clients
            </button>
          )}
        </div>
      </div>
    );
  }

  const { client, statistics, recentProjects } = dashboardData;

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER WITH BACK BUTTON ========== */}
      <div className="flex items-center gap-4">
        {isAdminViewing && (
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            title="Back to Clients"
            aria-label="Go back to clients list"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {client?.clientName || 'Client'} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdminViewing ? (
              <>
                🔍 Viewing as Admin •{' '}
                <span className="font-medium">
                  Contact: {client?.contactPerson || 'N/A'}
                </span>
              </>
            ) : (
              <>👋 Welcome, {user?.name || 'Client'}</>
            )}
          </p>
        </div>
      </div>

      {/* ========== STATISTICS CARDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projects */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <FolderIcon className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Total Projects
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statistics?.totalProjects || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Total Vulnerabilities */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <BugIcon className="text-red-600 dark:text-red-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Total Vulnerabilities
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statistics?.totalVulnerabilities || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircleIcon className="text-green-600 dark:text-green-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Active Projects
              </div>
              <div className="text-2xl font-bold text-foreground">
                {statistics?.activeProjects || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== VULNERABILITY & PROJECT BREAKDOWN ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vulnerabilities by Severity */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Vulnerabilities by Severity
          </h2>
          {statistics?.vulnerabilitiesBySeverity &&
          Object.keys(statistics.vulnerabilitiesBySeverity).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(statistics.vulnerabilitiesBySeverity).map(
                ([severity, count]) => (
                  <div
                    key={severity}
                    className="flex items-center justify-between"
                  >
                    <span className="text-foreground capitalize font-medium">
                      {severity}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityBadgeColor(
                        severity
                      )}`}
                    >
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                No vulnerabilities recorded
              </p>
            </div>
          )}
        </div>

        {/* Projects by Status */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Projects by Status
          </h2>
          {statistics?.projectsByStatus &&
          Object.keys(statistics.projectsByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(statistics.projectsByStatus).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-foreground font-medium">
                      {status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(
                        status
                      )}`}
                    >
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No projects yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ========== RECENT PROJECTS ========== */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Recent Projects
        </h2>
        {recentProjects && recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/projects/${project._id}`);
                  }
                }}
                className="p-4 rounded-lg border border-border hover:bg-muted hover:shadow-sm transition-all cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`View project ${project.project_name}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {project.project_name || 'Unnamed Project'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {Array.isArray(project.project_type)
                        ? project.project_type.join(', ')
                        : project.project_type || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusBadgeColor(
                      project.status
                    )}`}
                  >
                    {project.status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No recent projects</p>
          </div>
        )}
      </div>

      {/* ========== INFORMATION SECTION ========== */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          📊 Dashboard Overview
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This dashboard provides a comprehensive view of{' '}
          {isAdminViewing ? 'the client\'s' : 'your'} security testing projects
          and vulnerabilities. Click on any project to view detailed
          information, test findings, and remediation status.
        </p>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
