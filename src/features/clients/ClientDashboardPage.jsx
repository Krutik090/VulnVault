// =======================================================================
// FILE: src/features/clients/ClientDashboardPage.jsx (FIXED)
// PURPOSE: Dashboard for viewing client data (works for both admin & client roles)
// =======================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDashboard } from '../../api/clientApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// Icons
const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const BugIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const { color } = useTheme();
  const navigate = useNavigate();
  const { clientId } = useParams(); // ✅ Get from URL for admins
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // ✅ FIX: Determine which clientId to use
  const effectiveClientId = clientId || user?.clientId;

  useEffect(() => {
    if (effectiveClientId) {
      fetchDashboard();
    } else {
      setLoading(false);
      toast.error('No client ID found');
    }
  }, [effectiveClientId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching dashboard for clientId:', effectiveClientId);
      const response = await getClientDashboard(effectiveClientId);
      console.log('📊 Dashboard Response:', response);
      
      // ✅ FIX: Handle response correctly
      if (response.data) {
        setDashboardData(response.data);
      } else {
        toast.error('No dashboard data available');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard:', error);
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="large" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-foreground">No data available</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Unable to load dashboard data for this client
        </p>
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/clients')}
            className="mt-4 text-primary hover:underline"
          >
            Back to Clients
          </button>
        )}
      </div>
    );
  }

  const { client, statistics, recentProjects } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header with Back Button for Admins */}
      <div className="flex items-center gap-4">
        {user?.role === 'admin' && clientId && (
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Back to Clients"
          >
            <ArrowLeftIcon />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {client?.clientName || 'Client'} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'admin' 
              ? `Viewing as Admin • Contact: ${client?.contactPerson || 'N/A'}`
              : `Welcome, ${client?.contactPerson || 'User'}`
            }
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <FolderIcon />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
              <div className="text-2xl font-bold text-foreground">
                {statistics?.totalProjects || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900">
              <BugIcon />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Vulnerabilities</div>
              <div className="text-2xl font-bold text-foreground">
                {statistics?.totalVulnerabilities || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <CheckIcon />
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

      {/* Vulnerability Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">Vulnerabilities by Severity</h2>
          {statistics?.vulnerabilitiesBySeverity && Object.keys(statistics.vulnerabilitiesBySeverity).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(statistics.vulnerabilitiesBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <span className="text-foreground capitalize">{severity}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    severity.toLowerCase() === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    severity.toLowerCase() === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    severity.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                    severity.toLowerCase() === 'low' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No vulnerabilities recorded</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-4">Projects by Status</h2>
          {statistics?.projectsByStatus && Object.keys(statistics.projectsByStatus).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(statistics.projectsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-foreground capitalize">{status}</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No projects yet</p>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Projects</h2>
        {recentProjects && recentProjects.length > 0 ? (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{project.project_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {Array.isArray(project.project_type) 
                        ? project.project_type.join(', ') 
                        : project.project_type || 'N/A'
                      }
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    project.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No recent projects</p>
        )}
      </div>
    </div>
  );
};

export default ClientDashboardPage;
