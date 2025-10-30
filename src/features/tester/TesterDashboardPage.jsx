// =======================================================================
// FILE: src/features/tester/TesterDashboardPage.jsx (COMPLETE - ALL PARTS)
// PURPOSE: Complete tester dashboard with GitHub-style heatmap & metrics
// =======================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getTesterDashboard } from '../../api/testerApi';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  Award,
  TrendingUp,
  Calendar,
  Flame,
  BarChart3,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Zap
} from 'lucide-react';
import Spinner from '../../components/Spinner';
import StatCard from '../../components/StatCard';
import ActivityHeatmap from '../../components/ActivityHeatmap';

const TesterDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getTesterDashboard();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner fullPage />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      case 'informational': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Active': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Completed': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Pending': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'On Hold': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    
    return badges[status] || badges['Pending'];
  };

  return (
    <div className="p-6 space-y-6">
      {/* ========================================
          STEP 5: HEADER & WELCOME SECTION
      ======================================== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {tester?.name}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            Here's your security testing overview
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-card border rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ========================================
          STEP 6: STATISTICS CARDS GRID
      ======================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={statistics?.totalProjects || 0}
          icon={Target}
          description={`${statistics?.activeProjects || 0} active projects`}
          color="primary"
        />
        
        <StatCard
          title="Total Vulnerabilities"
          value={statistics?.totalVulnerabilities || 0}
          icon={Shield}
          description={`${statistics?.thisWeekVulnerabilities || 0} this week`}
          color="danger"
        />
        
        <StatCard
          title="Active Days"
          value={statistics?.activeDays || 0}
          icon={Calendar}
          description="Days with activity"
          color="success"
        />
        
        <StatCard
          title="Current Streak"
          value={`${statistics?.currentStreak || 0} days`}
          icon={Flame}
          description={`Longest: ${statistics?.longestStreak || 0} days`}
          color="warning"
        />
      </div>

      {/* ========================================
          PRODUCTIVITY METRICS ROW
      ======================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">This Week</p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold">{statistics?.thisWeekVulnerabilities || 0}</h3>
          <p className="text-xs text-muted-foreground mt-1">Vulnerabilities found</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">This Month</p>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold">{statistics?.thisMonthVulnerabilities || 0}</h3>
          <p className="text-xs text-muted-foreground mt-1">Vulnerabilities found</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">Average per Day</p>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold">{statistics?.avgVulnerabilitiesPerDay || 0}</h3>
          <p className="text-xs text-muted-foreground mt-1">On active days</p>
        </div>
      </div>

      {/* ========================================
          STEP 7: ACTIVITY HEATMAP SECTION
      ======================================== */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your contribution activity over the past year
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-muted-foreground">
                {statistics?.currentStreak || 0} day streak
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">
                {statistics?.activeDays || 0} active days
              </span>
            </div>
          </div>
        </div>
        
        <ActivityHeatmap activityData={activityHeatmap || []} />
      </div>

      {/* ========================================
          STEP 8: VULNERABILITY CHARTS
      ======================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerabilities by Severity */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Vulnerabilities by Severity
          </h3>
          
          <div className="space-y-3">
            {['Critical', 'High', 'Medium', 'Low', 'Informational'].map((severity) => {
              const count = vulnerabilitiesBySeverity?.[severity] || 0;
              const total = statistics?.totalVulnerabilities || 1;
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={severity}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${getSeverityColor(severity)}`}>
                      {severity}
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        severity === 'Critical' ? 'bg-red-500' :
                        severity === 'High' ? 'bg-orange-500' :
                        severity === 'Medium' ? 'bg-yellow-500' :
                        severity === 'Low' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vulnerabilities by Status */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Vulnerabilities by Status
          </h3>
          
          <div className="space-y-3">
            {Object.entries(vulnerabilitiesByStatus || {}).map(([status, count]) => {
              const total = statistics?.totalVulnerabilities || 1;
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{status}</span>
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
            })}
          </div>
        </div>
      </div>

      {/* ========================================
          STEP 9: RECENT PROJECTS & VULNERABILITIES
      ======================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recent Projects
            </h3>
            <button
              onClick={() => navigate('/tester/projects')}
              className="text-sm text-primary hover:underline"
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
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{project.project_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.vulnerabilityCount} {project.vulnerabilityCount === 1 ? 'vulnerability' : 'vulnerabilities'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(project.status)}`}>
                    {project.status}
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
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
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
                      <h4 className="font-medium text-sm">{vuln.vulnerability_name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(vuln.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {vuln.status}
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
