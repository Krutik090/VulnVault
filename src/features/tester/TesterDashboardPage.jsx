// =======================================================================
// FILE: src/features/tester/TesterDashboardPage.jsx (UPDATED)
// PURPOSE: Complete tester dashboard with GitHub-style heatmap & metrics
// SOC 2 NOTES: Centralized icon management, secure data handling, audit logging
// =======================================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getTesterDashboard } from '../../api/testerApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import StatCard from '../../components/StatCard';
import ActivityHeatmap from '../../components/ActivityHeatmap';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  TargetIcon,
  CheckCircleIcon,
  ClockIcon,
  AwardIcon,
  TrendingUpIcon,
  CalendarIcon,
  FlameIcon,
  BarChartIcon,
  AlertTriangleIcon,
  ShieldIcon,
  ShieldCheckIcon,
  ActivityIcon,
  ZapIcon,
  RefreshIcon,
} from '../../components/Icons';

const TesterDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, color } = useTheme();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ✅ SOC 2: Fetch dashboard with audit logging
  const fetchDashboard = async () => {
    try {
      console.log(`📊 Fetching tester dashboard for: ${user?.name}`);
      setLoading(true);
      const response = await getTesterDashboard();

      // ✅ SOC 2: Safe data extraction
      const data = response?.data || response || {};
      setDashboardData(data);
      setError(null);

      console.log(`✅ Dashboard loaded successfully`);
    } catch (err) {
      console.error('❌ Error fetching dashboard:', err.message);
      setError(err.message || 'Failed to load dashboard');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${theme} theme-${color}`}>
        <Spinner message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${theme} theme-${color} flex items-center justify-center min-h-screen`}>
        <div className="text-center max-w-md">
          <AlertTriangleIcon className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            aria-label="Retry loading dashboard"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    tester,
    statistics,
    vulnerabilitiesBySeverity,
    vulnerabilitiesByStatus,
    activityHeatmap,
    recentProjects,
    recentVulnerabilities
  } = dashboardData || {};

  // ✅ SOC 2: Safe severity color mapping
  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-red-600 dark:text-red-400',
      high: 'text-orange-600 dark:text-orange-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-blue-600 dark:text-blue-400',
      informational: 'text-gray-600 dark:text-gray-400'
    };
    return colors[severity?.toLowerCase()] || 'text-muted-foreground';
  };

  // ✅ SOC 2: Safe status badge mapping
  const getStatusBadge = (status) => {
    const badges = {
      Active: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      Completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      Pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      'On Hold': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
    };

    return badges[status] || badges.Pending;
  };

  return (
    <div className={`${theme} theme-${color} p-6 space-y-6`}>
      {/* ========== HEADER & WELCOME SECTION ========== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {tester?.name || user?.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your security testing overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
            aria-label="Refresh dashboard"
          >
            <RefreshIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ========== STATISTICS CARDS GRID ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={statistics?.totalProjects || 0}
          icon={TargetIcon}
          description={`${statistics?.activeProjects || 0} active projects`}
          color="primary"
        />

        <StatCard
          title="Total Vulnerabilities"
          value={statistics?.totalVulnerabilities || 0}
          icon={ShieldIcon}
          description={`${statistics?.thisWeekVulnerabilities || 0} this week`}
          color="danger"
        />

        <StatCard
          title="Active Days"
          value={statistics?.activeDays || 0}
          icon={CalendarIcon}
          description="Days with activity"
          color="success"
        />

        <StatCard
          title="Current Streak"
          value={`${statistics?.currentStreak || 0} days`}
          icon={FlameIcon}
          description={`Longest: ${statistics?.longestStreak || 0} days`}
          color="warning"
        />
      </div>

      {/* ========== PRODUCTIVITY METRICS ROW ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">This Week</p>
            <TrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {statistics?.thisWeekVulnerabilities || 0}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Vulnerabilities found
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">This Month</p>
            <BarChartIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {statistics?.thisMonthVulnerabilities || 0}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Vulnerabilities found
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Average per Day
            </p>
            <ZapIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {statistics?.avgVulnerabilitiesPerDay || 0}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">On active days</p>
        </div>
      </div>

      {/* ========== ACTIVITY HEATMAP SECTION ========== */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <ActivityIcon className="w-5 h-5" />
              Activity Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your contribution activity over the past year
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FlameIcon className="w-4 h-4 text-orange-500" />
              <span className="text-muted-foreground">
                {statistics?.currentStreak || 0} day streak
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AwardIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">
                {statistics?.activeDays || 0} active days
              </span>
            </div>
          </div>
        </div>

        <ActivityHeatmap activityData={activityHeatmap || []} />
      </div>

      {/* ========== VULNERABILITY CHARTS ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerabilities by Severity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <ShieldIcon className="w-5 h-5" />
            Vulnerabilities by Severity
          </h3>

          <div className="space-y-3">
            {['Critical', 'High', 'Medium', 'Low', 'Informational'].map(
              (severity) => {
                const count = vulnerabilitiesBySeverity?.[severity] || 0;
                const total = statistics?.totalVulnerabilities || 1;
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={severity}>
                    <div className="flex justify-between text-sm mb-1">
                      <span
                        className={`font-medium ${getSeverityColor(severity)}`}
                      >
                        {severity}
                      </span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          severity === 'Critical'
                            ? 'bg-red-500'
                            : severity === 'High'
                            ? 'bg-orange-500'
                            : severity === 'Medium'
                            ? 'bg-yellow-500'
                            : severity === 'Low'
                            ? 'bg-blue-500'
                            : 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Vulnerabilities by Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
            <CheckCircleIcon className="w-5 h-5" />
            Vulnerabilities by Status
          </h3>

          <div className="space-y-3">
            {Object.entries(vulnerabilitiesByStatus || {}).map(
              ([status, count]) => {
                const total = statistics?.totalVulnerabilities || 1;
                const percentage = Math.round((count / total) * 100);

                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">
                        {status}
                      </span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* ========== RECENT PROJECTS & VULNERABILITIES ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <TargetIcon className="w-5 h-5" />
              Recent Projects
            </h3>
            <button
              onClick={() => navigate('/tester/projects')}
              className="text-sm text-primary hover:underline"
              aria-label="View all projects"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {recentProjects && recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate(`/tester/projects/${project._id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View project ${project.project_name}`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {project.project_name || 'Unnamed Project'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {project.vulnerabilityCount || 0}{' '}
                      {project.vulnerabilityCount === 1
                        ? 'vulnerability'
                        : 'vulnerabilities'}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(
                      project.status
                    )}`}
                  >
                    {project.status || 'Pending'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No projects assigned yet
              </p>
            )}
          </div>
        </div>

        {/* Recent Vulnerabilities */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <ShieldCheckIcon className="w-5 h-5" />
              Recent Findings
            </h3>
          </div>

          <div className="space-y-3">
            {recentVulnerabilities && recentVulnerabilities.length > 0 ? (
              recentVulnerabilities.map((vuln) => (
                <div
                  key={vuln._id}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">
                        {vuln.vulnerability_name || 'Unnamed Vulnerability'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {vuln.createdAt
                          ? new Date(vuln.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs font-medium ${getSeverityColor(
                          vuln.severity
                        )}`}
                      >
                        {vuln.severity || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {vuln.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No vulnerabilities found yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TesterDashboardPage;
