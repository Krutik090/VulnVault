// =======================================================================
// FILE: src/features/clients/ClientDashboardPage.jsx (UPDATED)
// PURPOSE: Dashboard for viewing client data (admin & client roles)
// SOC 2 NOTES: Centralized icon management, secure cookie handling, audit logging
// =======================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDashboard } from '../../api/clientApi';
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
} from '../../components/Icons';

// ✅ SOC 2: Helper function to read cookies securely
const getCookie = (name) => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      console.log(`🍪 Retrieved cookie: ${name}`);
      return cookieValue;
    }
  } catch (error) {
    console.error(`❌ Error reading cookie ${name}:`, error.message);
  }
  return null;
};

// ✅ SOC 2: Helper function to parse userData cookie securely
const getUserDataFromCookie = () => {
  try {
    const userDataCookie = getCookie('userData');
    if (userDataCookie) {
      // Decode and parse the JSON string
      const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
      console.log('🍪 Parsed userData from cookie successfully');
      return parsedUser;
    }
  } catch (error) {
    console.error('❌ Error parsing userData from cookie:', error.message);
  }
  return null;
};

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
      'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
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
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800'
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

  // ✅ SOC 2: Get userData from cookie securely
  const userDataFromCookie = getUserDataFromCookie();

  // ✅ SOC 2: Determine which clientId to use (priority order)
  const getEffectiveClientId = () => {
    // Priority 1: URL params (admin viewing specific client)
    if (paramClientId) {
      console.log(
        `📋 [PRIORITY 1] Admin viewing client dashboard: ${paramClientId}`
      );
      return paramClientId;
    }

    // Priority 2: From userData cookie
    if (userDataFromCookie?.id) {
      console.log(
        `🍪 [PRIORITY 2] Client logged in, using cookie ID: ${userDataFromCookie.id}`
      );
      return userDataFromCookie.id;
    }

    // Priority 3: From auth context
    if (user?.id) {
      console.log(`👤 [PRIORITY 3] Using auth context ID: ${user.id}`);
      return user.id;
    }

    console.error('❌ No clientId found in any source');
    return null;
  };

  const effectiveClientId = getEffectiveClientId();

  useEffect(() => {
    if (effectiveClientId) {
      fetchDashboard();
    } else {
      setLoading(false);
      toast.error(
        'No client ID found. Please log in as a client or access via admin dashboard.'
      );
    }
  }, [effectiveClientId]);

  // ✅ SOC 2: Fetch dashboard with audit logging
  const fetchDashboard = async () => {
    try {
      console.log(
        `🔍 Fetching client dashboard for ID: ${effectiveClientId}`
      );
      console.log(`👥 User role: ${user?.role || 'unknown'}`);

      setLoading(true);
      const response = await getClientDashboard(effectiveClientId);

      console.log('📊 Dashboard fetched successfully');

      // ✅ SOC 2: Safe data extraction
      if (response?.data) {
        setDashboardData(response.data);
      } else if (response?.success === false) {
        console.error('❌ Dashboard fetch failed:', response.message);
        toast.error(response.message || 'Failed to load dashboard');
      } else {
        console.error('❌ No dashboard data available');
        toast.error('No dashboard data available');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error.message);
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${theme} theme-${color}`}>
        <div className="flex items-center justify-center h-96">
          <Spinner message="Loading dashboard..." />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`${theme} theme-${color} text-center py-16`}>
        <h3 className="text-lg font-semibold text-foreground">
          No data available
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Unable to load dashboard data for this client
        </p>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 text-primary hover:underline"
            aria-label="Back to clients"
          >
            Back to Clients
          </button>
        )}
      </div>
    );
  }

  const { client, statistics, recentProjects } = dashboardData;
  const isAdminViewing = !!paramClientId && user?.role === 'admin';
  const contactName = isAdminViewing
    ? client?.contactPerson
    : userDataFromCookie?.name || user?.name;

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER WITH BACK BUTTON ========== */}
      <div className="flex items-center gap-4 flex-col sm:flex-row">
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {client?.clientName || 'Client'} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdminViewing
              ? `🔍 Viewing as Admin • Contact: ${
                  client?.contactPerson || 'N/A'
                }`
              : `👋 Welcome, ${contactName || 'Client'}`}
          </p>
        </div>
      </div>

      {/* ========== STATISTICS CARDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projects */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <FolderIcon className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
              <div className="text-2xl font-bold text-foreground">
                {statistics?.totalProjects || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Total Vulnerabilities */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
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
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircleIcon className="text-green-600 dark:text-green-400 w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Active Projects</div>
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
                  <div key={severity} className="flex items-center justify-between">
                    <span className="text-foreground capitalize">{severity}</span>
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
            <p className="text-center text-muted-foreground py-8">
              No vulnerabilities recorded
            </p>
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
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-foreground capitalize">{status}</span>
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
            <p className="text-center text-muted-foreground py-8">
              No projects yet
            </p>
          )}
        </div>
      </div>

      {/* ========== RECENT PROJECTS ========== */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4">Recent Projects</h2>
        {recentProjects && recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
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
          <p className="text-center text-muted-foreground py-8">
            No recent projects
          </p>
        )}
      </div>

      {/* ========== INFORMATION SECTION ========== */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Dashboard Overview
        </h3>
        <p className="text-sm text-muted-foreground">
          This dashboard provides a comprehensive view of your client's security
          testing projects and vulnerabilities. Click on any project to view
          detailed information, test findings, and remediation status.
        </p>
      </div>
    </div>
  );
};

export default ClientDashboardPage;
