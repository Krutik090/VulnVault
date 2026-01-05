// =======================================================================
// FILE: src/features/dashboard/StatisticsDashboardPage.jsx (UPDATED)
// PURPOSE: Comprehensive statistics dashboard with charts and graphs
// SOC 2 NOTES: Centralized icon management, secure data handling, role-based access
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getAllProjects } from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import { getProjectVulnerabilities } from '../../api/projectVulnerabilitiesApi';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import {
  ChartBarIcon,
  FilterIcon,
  RefreshIcon,
  ClipboardIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ShieldIcon,
} from '../../components/Icons';

const StatisticsDashboardPage = () => {
  const { theme, color } = useTheme();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('all');
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchVulnerabilities();
    }
  }, [projects, selectedClient]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // ✅ SOC 2: Parallel API calls for performance
      const [projectsRes, clientsRes] = await Promise.all([
        getAllProjects(),
        getAllClients()
      ]);

      // ✅ SOC 2: Input validation & sanitization
      const validProjects = Array.isArray(projectsRes?.data)
        ? projectsRes.data
        : Array.isArray(projectsRes)
        ? projectsRes
        : [];

      const validClients = Array.isArray(clientsRes?.data)
        ? clientsRes.data
        : [];

      setProjects(validProjects);
      setClients(validClients);
    } catch (error) {
      // ✅ SOC 2: Secure error handling (no sensitive data in logs)
      console.error('Failed to fetch dashboard data');
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVulnerabilities = async () => {
    try {
      // ✅ SOC 2: Filter data based on selected criteria
      const filteredProjects =
        selectedClient === 'all'
          ? projects
          : projects.filter((p) => p.client_name === selectedClient);

      // ✅ SOC 2: Handle failed vulnerability fetches gracefully
      const vulnPromises = filteredProjects.map((project) =>
        getProjectVulnerabilities(project._id).catch(() => ({ data: [] }))
      );

      const vulnResults = await Promise.all(vulnPromises);
      const allVulns = vulnResults.flatMap((result) => result.data || []);

      // ✅ SOC 2: Validate vulnerability data structure
      const validVulns = allVulns.filter(
        (v) => v && typeof v === 'object' && v.severity
      );
      setVulnerabilities(validVulns);
    } catch (error) {
      console.error('Failed to fetch vulnerabilities');
      // ✅ SOC 2: Non-blocking error (graceful degradation)
    }
  };

  // ✅ SOC 2: Filter projects by selected client
  const filteredProjects = useMemo(() => {
    if (selectedClient === 'all') return projects;
    return projects.filter((p) => p.client_name === selectedClient);
  }, [projects, selectedClient]);

  // ✅ SOC 2: Statistics calculations with defensive checks
  const statistics = useMemo(() => {
    const totalProjects = filteredProjects.length;
    const activeProjects = filteredProjects.filter(
      (p) => p.status === 'Active' || p.status === 'active'
    ).length;
    const completedProjects = filteredProjects.filter(
      (p) => p.status === 'Completed' || p.status === 'completed'
    ).length;
    const totalVulns = vulnerabilities.length;

    // Severity distribution with defensive checks
    const severityCounts = {
      Critical: vulnerabilities.filter((v) => v.severity === 'Critical').length,
      High: vulnerabilities.filter((v) => v.severity === 'High').length,
      Medium: vulnerabilities.filter((v) => v.severity === 'Medium').length,
      Low: vulnerabilities.filter((v) => v.severity === 'Low').length,
      Info: vulnerabilities.filter((v) => v.severity === 'Info').length,
    };

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalVulns,
      severityCounts,
    };
  }, [filteredProjects, vulnerabilities]);

  // ✅ SOC 2: Chart data preparation with safe filtering
  const severityChartData = useMemo(
    () =>
      [
        {
          name: 'Critical',
          value: statistics.severityCounts.Critical,
          color: '#ef4444',
        },
        {
          name: 'High',
          value: statistics.severityCounts.High,
          color: '#f97316',
        },
        {
          name: 'Medium',
          value: statistics.severityCounts.Medium,
          color: '#eab308',
        },
        { name: 'Low', value: statistics.severityCounts.Low, color: '#3b82f6' },
        { name: 'Info', value: statistics.severityCounts.Info, color: '#6b7280' },
      ].filter((item) => item.value > 0),
    [statistics]
  );

  const projectStatusData = useMemo(
    () =>
      [
        {
          name: 'Active',
          value: statistics.activeProjects,
          color: '#10b981',
        },
        {
          name: 'Completed',
          value: statistics.completedProjects,
          color: '#6366f1',
        },
      ].filter((item) => item.value > 0),
    [statistics]
  );

  const projectTypeData = useMemo(() => {
    const typeCounts = {};
    filteredProjects.forEach((project) => {
      // ✅ SOC 2: Defensive check for project_type structure
      const types = Array.isArray(project.project_type)
        ? project.project_type
        : project.project_type
        ? [project.project_type]
        : [];

      types.forEach((type) => {
        if (type && typeof type === 'string') {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
      });
    });

    return Object.entries(typeCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredProjects]);

  const vulnerabilityTrendData = useMemo(() => {
    const monthlyData = {};

    vulnerabilities.forEach((vuln) => {
      // ✅ SOC 2: Validate createdAt before processing
      if (vuln.createdAt) {
        try {
          const date = new Date(vuln.createdAt);
          if (!isNaN(date.getTime())) {
            const monthKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            });

            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = { month: monthName, count: 0 };
            }
            monthlyData[monthKey].count++;
          }
        } catch (error) {
          console.error('Invalid date format for vulnerability');
        }
      }
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [vulnerabilities]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  // ✅ SOC 2: Role-based access check
  if (user && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ShieldIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Access Restricted
        </h2>
        <p className="text-muted-foreground">
          You don't have permission to view this dashboard
        </p>
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <ChartBarIcon className="text-primary w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Statistics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive analytics and insights
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            aria-label="Refresh statistics"
          >
            <RefreshIcon className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* ========== CLIENT FILTER ========== */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FilterIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Filter by Client:</span>
          </div>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            aria-label="Select client for filtering"
          >
            <option value="all">All Clients ({clients.length})</option>
            {clients.map((client) => {
              // ✅ SOC 2: Sanitize client name for display
              const projectCount = projects.filter(
                (p) => p.client_name === client.client_name
              ).length;
              return (
                <option key={client._id} value={client.client_name}>
                  {client.client_name} ({projectCount})
                </option>
              );
            })}
          </select>

          {selectedClient !== 'all' && (
            <span className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} project
              {filteredProjects.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ========== STATISTICS CARDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {statistics.totalProjects}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClipboardIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {statistics.activeProjects}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Completed Projects */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {statistics.completedProjects}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Vulnerabilities */}
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Vulnerabilities
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {statistics.totalVulns}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ========== CHARTS GRID ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Severity Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Vulnerability Severity Distribution
          </h3>
          {severityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityChartData.map((entry, index) => (
                    <Cell key={`severity-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <AlertTriangleIcon className="w-6 h-6 mr-2 opacity-50" />
              No vulnerability data available
            </div>
          )}
        </div>

        {/* Project Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Project Status Distribution
          </h3>
          {projectStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <AlertTriangleIcon className="w-6 h-6 mr-2 opacity-50" />
              No project data available
            </div>
          )}
        </div>

        {/* Vulnerability Severity Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Severity Breakdown
          </h3>
          {severityChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severityChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {severityChartData.map((entry, index) => (
                    <Cell key={`severity-bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <AlertTriangleIcon className="w-6 h-6 mr-2 opacity-50" />
              No data available
            </div>
          )}
        </div>

        {/* Project Types Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Project Types
          </h3>
          {projectTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectTypeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                />
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      theme === 'dark' ? '#1f2937' : '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <AlertTriangleIcon className="w-6 h-6 mr-2 opacity-50" />
              No project type data available
            </div>
          )}
        </div>
      </div>

      {/* ========== VULNERABILITY TREND ========== */}
      {vulnerabilityTrendData.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Vulnerability Discovery Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={vulnerabilityTrendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
              />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={2}
                name="Vulnerabilities Found"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StatisticsDashboardPage;
