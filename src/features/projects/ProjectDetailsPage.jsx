// =======================================================================
// FILE: src/features/projects/ProjectDetailsPage.jsx (UPDATED - NO MODALS)
// PURPOSE: Project details page with vulnerability summary and config display
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById } from '../../api/projectApi';
import { getProjectConfig } from '../../api/projectDetailsApi';
import { getProjectVulnerabilities } from '../../api/projectVulnerabilitiesApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ConfigIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, color } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [config, setConfig] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const [projectResponse, configResponse, vulnResponse] = await Promise.all([
        getProjectById(projectId),
        getProjectConfig(projectId).catch(() => ({ data: null })),
        getProjectVulnerabilities(projectId)
      ]);

      const projectData = projectResponse.data || projectResponse;
      setProject(projectData);
      
      setConfig(configResponse.data || null);
      
      const vulnData = vulnResponse.data || vulnResponse || [];
      setVulnerabilities(vulnData);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
      navigate('/active-projects');
    } finally {
      setLoading(false);
    }
  };

  // Calculate vulnerability statistics
  const vulnStats = useMemo(() => {
    const stats = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Info: 0,
      total: vulnerabilities.length
    };

    vulnerabilities.forEach(vuln => {
      if (stats.hasOwnProperty(vuln.severity)) {
        stats[vuln.severity]++;
      }
    });

    return stats;
  }, [vulnerabilities]);

  // Vulnerability table columns
  const vulnColumns = useMemo(() => [
    {
      accessorKey: 'vulnerability_name',
      header: 'Vulnerability',
    },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severityColors = {
          Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
          High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
          Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          Info: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[row.original.severity] || severityColors.Info}`}>
            {row.original.severity}
          </span>
        );
      }
    },
    {
      accessorKey: 'cvss_score',
      header: 'CVSS',
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          {row.original.cvss_score || 'N/A'}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.status === 'open' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {row.original.status === 'open' ? 'Open' : 'Closed'}
        </span>
      )
    },
    {
      accessorKey: 'found_by',
      header: 'Found By',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.found_by || 'Unknown'}
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Link
          to={`/ProjectVulnerabilities/instances/details/${row.original._id}`}
          className="inline-flex items-center gap-1 p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm"
        >
          <EyeIcon />
          View
        </Link>
      )
    }
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground">Project not found</h2>
        <Link to="/active-projects" className="text-primary hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <button
          onClick={() => navigate('/active-projects')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
        >
          <ArrowLeftIcon />
          Back to Projects
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.project_name}</h1>
            <p className="text-muted-foreground mt-1">
              Client: {project.client_name || 'Unknown'} • Status: {project.status}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${projectId}/config`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent text-foreground rounded-lg transition-colors font-medium"
            >
              <ConfigIcon />
              {config ? 'Edit' : 'Configure'} Project
            </Link>
            <Link
              to={`/projects/${projectId}/add-vulnerability`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <PlusIcon />
              Add Vulnerability
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border">
          <nav className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vulnerabilities')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'vulnerabilities'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              Vulnerabilities ({vulnerabilities.length})
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'configuration'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              Configuration
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Information */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Project Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium text-foreground mt-1">{project.client_name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground mt-1">{project.status}</p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground mt-1">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium text-foreground mt-1">
                      {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg md:col-span-2">
                    <p className="text-sm text-muted-foreground">Project Types</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(project.project_type) && project.project_type.length > 0 ? (
                        project.project_type.map((type, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-foreground">None specified</span>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <div className="p-4 bg-muted/30 border border-border rounded-lg md:col-span-2">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-foreground mt-2">{project.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vulnerability Summary */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Vulnerability Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">Critical</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-300 mt-1">{vulnStats.Critical}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-sm text-orange-700 dark:text-orange-400">High</p>
                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-300 mt-1">{vulnStats.High}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Medium</p>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">{vulnStats.Medium}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">Low</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">{vulnStats.Low}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/10 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-400">Info</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-300 mt-1">{vulnStats.Info}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <p className="text-sm text-purple-700 dark:text-purple-400">Total</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-1">{vulnStats.total}</p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {project.assigned_testers && project.assigned_testers.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Assigned Testers</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.assigned_testers.map((tester, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {tester.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{tester.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{tester.email || 'No email'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vulnerabilities Tab */}
          {activeTab === 'vulnerabilities' && (
            <div className="space-y-4">
              {vulnerabilities.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No vulnerabilities found</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by adding the first vulnerability to this project
                  </p>
                  <Link
                    to={`/projects/${projectId}/add-vulnerability`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <PlusIcon />
                    Add First Vulnerability
                  </Link>
                </div>
              ) : (
                <DataTable 
                  data={vulnerabilities} 
                  columns={vulnColumns}
                  title={`Vulnerabilities (${vulnerabilities.length})`}
                />
              )}
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'configuration' && (
            <div className="space-y-6">
              {config ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Project Configuration</h2>
                    <Link
                      to={`/projects/${projectId}/config`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                    >
                      <EditIcon />
                      Edit Configuration
                    </Link>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Project Name</p>
                        <p className="font-medium text-foreground mt-1">{config.projectName || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Client Name</p>
                        <p className="font-medium text-foreground mt-1">{config.clientName || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Report Type</p>
                        <p className="font-medium text-foreground mt-1">{config.reportType || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Engagement Dates</p>
                        <p className="font-medium text-foreground mt-1">{config.engagementDates || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  {(config.scope || config.reportingCriteria || config.methodology || config.executiveSummary) && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">Report Content</h3>
                      <div className="space-y-4">
                        {config.scope && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">Scope</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{config.scope}</p>
                          </div>
                        )}
                        {config.reportingCriteria && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">Reporting Criteria</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{config.reportingCriteria}</p>
                          </div>
                        )}
                        {config.methodology && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">Methodology</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{config.methodology}</p>
                          </div>
                        )}
                        {config.executiveSummary && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">Executive Summary</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">{config.executiveSummary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Report Sections */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Report Sections</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[
                        { key: 'tableOfContents', label: 'Table of Contents' },
                        { key: 'listOfFigures', label: 'List of Figures' },
                        { key: 'listOfTables', label: 'List of Tables' },
                        { key: 'documentControl', label: 'Document Control' },
                        { key: 'disclaimer', label: 'Disclaimer' },
                        { key: 'executiveSummarySection', label: 'Executive Summary' },
                        { key: 'scopeSection', label: 'Scope' },
                        { key: 'reportingCriteriaSection', label: 'Reporting Criteria' },
                        { key: 'methodologySection', label: 'Methodology' },
                        { key: 'findingsSection', label: 'Findings' },
                        { key: 'conclusionSection', label: 'Conclusion' },
                        { key: 'appendixSection', label: 'Appendix' }
                      ].map(section => (
                        <div 
                          key={section.key}
                          className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg"
                        >
                          {config[section.key] ? (
                            <CheckIcon className="text-green-600 flex-shrink-0" />
                          ) : (
                            <XIcon className="text-red-600 flex-shrink-0" />
                          )}
                          <span className="text-sm text-foreground">{section.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <ConfigIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No configuration set</h3>
                  <p className="text-muted-foreground mb-6">
                    Configure project settings for report generation
                  </p>
                  <Link
                    to={`/projects/${projectId}/config`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <ConfigIcon />
                    Configure Project
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
