// =======================================================================
// FILE: src/features/dashboard/DashboardPage.jsx (NEW - REAL DASHBOARD)
// PURPOSE: Analytics dashboard with stats, charts, and recent activity
// =======================================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveProjects } from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const ChartBarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.924-1.333-3.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { theme, color } = useTheme();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalClients: 0,
    criticalVulns: 0,
    highVulns: 0,
    totalVulns: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [projectsResponse, clientsResponse] = await Promise.all([
        getActiveProjects(),
        getAllClients(), // ✅ Updated: Now returns { success: true, count: X, data: [...] }
      ]);

      const projectData = Array.isArray(projectsResponse) ? projectsResponse : projectsResponse.data || [];
      const clientData = clientsResponse.data || []; // ✅ Changed: Access .data property

      setProjects(projectData);
      setClients(clientData);

      // Calculate stats
      const activeProjects = projectData.filter(p => p.status === 'Active').length;
      const completedProjects = projectData.filter(p => p.status === 'Completed').length;

      let criticalCount = 0;
      let highCount = 0;
      let totalVulnCount = 0;

      projectData.forEach(project => {
        if (project.vulnerabilityCounts) {
          criticalCount += project.vulnerabilityCounts.Critical || 0;
          highCount += project.vulnerabilityCounts.High || 0;
          totalVulnCount += (project.vulnerabilityCounts.Critical || 0) +
            (project.vulnerabilityCounts.High || 0) +
            (project.vulnerabilityCounts.Medium || 0) +
            (project.vulnerabilityCounts.Low || 0) +
            (project.vulnerabilityCounts.Info || 0);
        }
      });

      setStats({
        totalProjects: projectData.length,
        activeProjects,
        completedProjects,
        totalClients: clientData.length,
        criticalVulns: criticalCount,
        highVulns: highCount,
        totalVulns: totalVulnCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  // Recent projects (last 5)
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className={`${theme} theme-${color} space-y-6`}>

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's what's happening with your penetration testing projects today
            </p>
          </div>
          <div className="hidden md:block">
            <ChartBarIcon className="text-primary opacity-20 w-20 h-20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FolderIcon className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUpIcon className="w-3 h-3" />
              {stats.activeProjects} Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">{stats.totalProjects}</h3>
          <p className="text-sm text-muted-foreground mt-1">Total Projects</p>
          <Link
            to="/active-projects"
            className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            View all <ArrowRightIcon />
          </Link>
        </div>

        {/* Total Clients */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UsersIcon className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {stats.completedProjects} Completed
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">{stats.totalClients}</h3>
          <p className="text-sm text-muted-foreground mt-1">Active Clients</p>
          <Link
            to="/project-records"
            className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            Manage clients <ArrowRightIcon />
          </Link>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangleIcon className="text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              {stats.highVulns} High
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">{stats.criticalVulns}</h3>
          <p className="text-sm text-muted-foreground mt-1">Critical Issues</p>
          <Link
            to="/vulnerability-database"
            className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            View vulnerabilities <ArrowRightIcon />
          </Link>
        </div>

        {/* Total Vulnerabilities */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              All Severity
            </span>
          </div>
          <h3 className="text-2xl font-bold text-foreground">{stats.totalVulns}</h3>
          <p className="text-sm text-muted-foreground mt-1">Total Findings</p>
          <Link
            to="/vulnerability-database"
            className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
          >
            View database <ArrowRightIcon />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
              <Link
                to="/active-projects"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                View all <ArrowRightIcon />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-border">
            {recentProjects.length === 0 ? (
              <div className="p-8 text-center">
                <FolderIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No projects yet</p>
              </div>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="flex items-center justify-between p-4 hover:bg-accent transition-colors group"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {project.project_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.client_name || 'No client'} • {project.project_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                      {project.status}
                    </span>
                    <ArrowRightIcon className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          </div>

          <div className="p-4 space-y-3">
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/projects/add"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">New Project</h3>
                    <p className="text-xs text-muted-foreground">Create a new assessment</p>
                  </div>
                </Link>

                <Link
                  to="/add-client"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <UsersIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Add Client</h3>
                    <p className="text-xs text-muted-foreground">Register new client</p>
                  </div>
                </Link>

                <Link
                  to="/vulnerability-database"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors group"
                >
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Vuln Database</h3>
                    <p className="text-xs text-muted-foreground">Manage vulnerabilities</p>
                  </div>
                </Link>
              </>
            )}

            <Link
              to={user?.role === 'tester' ? '/time-tracker' : '/project-records'}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent hover:border-primary transition-colors group"
            >
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  {user?.role === 'tester' ? 'Time Tracker' : 'All Projects'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'tester' ? 'Log your work hours' : 'View all projects'}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Project Status Overview */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Project Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeProjects}</div>
            <div className="text-sm text-muted-foreground mt-1">Active</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedProjects}</div>
            <div className="text-sm text-muted-foreground mt-1">Completed</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {projects.filter(p => p.status === 'Retest').length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Retest</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {projects.filter(p => p.status === 'Not Started').length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Not Started</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
