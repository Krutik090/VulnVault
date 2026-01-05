/**
 * ======================================================================
 * FILE: src/features/projects/ProjectDetailsPage.jsx (FULLY UPDATED)
 * PURPOSE: Project details with vulnerability table including DELETE action
 * SOC 2: Delete confirmation, proper error handling, audit logging
 * ======================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById } from '../../api/projectApi';
import { getProjectConfig } from '../../api/projectDetailsApi';
import {
  getProjectVulnerabilities,
  deleteVulnerabilityInstance,
} from '../../api/projectVulnerabilitiesApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// ✅ CENTRALIZED ICON IMPORTS
import {
  ArrowLeftIcon,
  PlusIcon,
  EditIcon,
  SettingsIcon,
  EyeIcon,
  CheckIcon,
  XIcon,
  FolderIcon,
  BugIcon,
  TrashIcon,
  AlertTriangleIcon,
} from '../../components/Icons';

/**
 * ✅ Delete Confirmation Dialog
 */
const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Vulnerability',
  message = 'Are you sure you want to delete',
  itemName = '',
  isDeleting = false,
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />

      <div
        className={`${theme} relative bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 p-6`}
      >
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
          aria-label="Close dialog"
        >
          <XIcon className="w-4 h-4" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon className="w-8 h-8 text-red-600" />
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground mb-6">
            {message}{' '}
            {itemName && (
              <span className="font-medium text-foreground">
                "{itemName}"
              </span>
            )}
            ? This action cannot be undone.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      // ✅ Parallel API calls
      const [projectResponse, configResponse, vulnResponse] = await Promise.all(
        [
          getProjectById(projectId),
          getProjectConfig(projectId).catch(() => ({ data: null })),
          getProjectVulnerabilities(projectId),
        ]
      );

      const projectData = projectResponse.data || projectResponse;
      setProject(projectData);

      setConfig(configResponse.data || null);

      const vulnData = Array.isArray(vulnResponse?.data)
        ? vulnResponse.data
        : Array.isArray(vulnResponse)
        ? vulnResponse
        : [];

      setVulnerabilities(vulnData);
    } catch (error) {
      console.error('Failed to fetch project details');
      toast.error('Failed to load project details');
      navigate('/active-projects');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete handler
  const openDeleteDialog = useCallback((vulnId, vulnName) => {
    setDeleteTargetId(vulnId);
    setDeleteTargetName(vulnName);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteTargetId(null);
    setDeleteTargetName('');
    setIsDeleteDialogOpen(false);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await deleteVulnerabilityInstance(deleteTargetId);

      // ✅ Update local state
      setVulnerabilities((prev) =>
        prev.filter((vuln) => vuln._id !== deleteTargetId)
      );

      toast.success('Vulnerability deleted successfully!');
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
      toast.error(error.message || 'Failed to delete vulnerability');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargetId, closeDeleteDialog]);

  // ✅ Calculate vulnerability statistics
  const vulnStats = useMemo(() => {
    const stats = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Info: 0,
      total: vulnerabilities.length,
    };

    vulnerabilities.forEach((vuln) => {
      if (vuln.severity && stats.hasOwnProperty(vuln.severity)) {
        stats[vuln.severity]++;
      }
    });

    return stats;
  }, [vulnerabilities]);

  // ✅ UPDATED: Vulnerability table columns WITH DELETE ACTION
  const vulnColumns = useMemo(
    () => [
      {
        accessorKey: 'vulnerability_name',
        header: 'Vulnerability',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.vulnerability_name || 'Unknown'}
          </span>
        ),
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => {
          const severityColors = {
            Critical:
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            Medium:
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            Info: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
          };

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                severityColors[row.original.severity] || severityColors.Info
              }`}
            >
              {row.original.severity || 'Unknown'}
            </span>
          );
        },
      },
      {
        accessorKey: 'cvss_score',
        header: 'CVSS',
        cell: ({ row }) => (
          <span className="text-sm font-mono">
            {row.original.cvss_score || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.original.status === 'open'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
            }`}
          >
            {row.original.status === 'open' ? 'Open' : 'Closed'}
          </span>
        ),
      },
      {
        accessorKey: 'found_by',
        header: 'Found By',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.found_by || 'Unknown'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {/* ✅ VIEW ACTION */}
            <Link
              to={`/ProjectVulnerabilities/instances/details/${row.original._id}`}
              className="inline-flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm font-medium"
              aria-label={`View ${row.original.vulnerability_name} details`}
              title="View details"
            >
              <EyeIcon className="w-4 h-4" />
              View
            </Link>

            {/* ✅ DELETE ACTION */}
            {(user?.role === 'admin' || user?.role === 'tester') && (
              <button
                onClick={() =>
                  openDeleteDialog(
                    row.original._id,
                    row.original.vulnerability_name
                  )
                }
                className="inline-flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
                aria-label={`Delete ${row.original.vulnerability_name}`}
                title="Delete vulnerability"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        ),
      },
    ],
    [user, openDeleteDialog]
  );

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
        <h2 className="text-xl font-semibold text-foreground">
          Project not found
        </h2>
        <Link
          to="/active-projects"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <button
          onClick={() => navigate('/active-projects')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
          aria-label="Go back to projects"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Projects
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {project.project_name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Client: {project.client_name || 'Unknown'} • Status:{' '}
              {project.status}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/projects/${projectId}/config`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent text-foreground rounded-lg transition-colors font-medium"
              aria-label="Configure project"
            >
              <SettingsIcon className="w-5 h-5" />
              {config ? 'Edit' : 'Configure'} Project
            </Link>
            <Link
              to={`/projects/${projectId}/add-vulnerability`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              aria-label="Add vulnerability"
            >
              <PlusIcon className="w-5 h-5" />
              Add Vulnerability
            </Link>
          </div>
        </div>
      </div>

      {/* ========== TABS ========== */}
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
              aria-label="Overview tab"
              aria-pressed={activeTab === 'overview'}
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
              aria-label="Vulnerabilities tab"
              aria-pressed={activeTab === 'vulnerabilities'}
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
              aria-label="Configuration tab"
              aria-pressed={activeTab === 'configuration'}
            >
              Configuration
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Project Information */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Project Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium text-foreground mt-1">
                      {project.client_name || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-foreground mt-1">
                      {project.status}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground mt-1">
                      {project.start_date
                        ? new Date(project.start_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium text-foreground mt-1">
                      {project.end_date
                        ? new Date(project.end_date).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 border border-border rounded-lg md:col-span-2">
                    <p className="text-sm text-muted-foreground">
                      Project Types
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(project.project_type) &&
                      project.project_type.length > 0 ? (
                        project.project_type.map((type, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-foreground">
                          None specified
                        </span>
                      )}
                    </div>
                  </div>
                  {project.description && (
                    <div className="p-4 bg-muted/30 border border-border rounded-lg md:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        Description
                      </p>
                      <p className="text-foreground mt-2">
                        {project.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vulnerability Summary */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Vulnerability Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Critical
                    </p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-300 mt-1">
                      {vulnStats.Critical}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      High
                    </p>
                    <p className="text-2xl font-bold text-orange-800 dark:text-orange-300 mt-1">
                      {vulnStats.High}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Medium
                    </p>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">
                      {vulnStats.Medium}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Low
                    </p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-300 mt-1">
                      {vulnStats.Low}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/10 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-400">
                      Info
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-300 mt-1">
                      {vulnStats.Info}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <p className="text-sm text-purple-700 dark:text-purple-400">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-300 mt-1">
                      {vulnStats.total}
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {project.assigned_testers &&
                project.assigned_testers.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                      Assigned Testers
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {project.assigned_testers.map((tester, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-lg"
                        >
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {tester.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {tester.name || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {tester.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* ========== VULNERABILITIES TAB ========== */}
          {activeTab === 'vulnerabilities' && (
            <div className="space-y-4">
              {vulnerabilities.length === 0 ? (
                <div className="text-center py-12">
                  <BugIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No vulnerabilities found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start by adding the first vulnerability to this project
                  </p>
                  <Link
                    to={`/projects/${projectId}/add-vulnerability`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    aria-label="Add first vulnerability"
                  >
                    <PlusIcon className="w-5 h-5" />
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

          {/* ========== CONFIGURATION TAB ========== */}
          {activeTab === 'configuration' && (
            <div className="space-y-6">
              {config ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Project Configuration
                    </h2>
                    <Link
                      to={`/projects/${projectId}/config`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                      aria-label="Edit configuration"
                    >
                      <EditIcon className="w-5 h-5" />
                      Edit Configuration
                    </Link>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Project Name
                        </p>
                        <p className="font-medium text-foreground mt-1">
                          {config.projectName || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Client Name
                        </p>
                        <p className="font-medium text-foreground mt-1">
                          {config.clientName || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Report Type
                        </p>
                        <p className="font-medium text-foreground mt-1">
                          {config.reportType || 'N/A'}
                        </p>
                      </div>
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Engagement Dates
                        </p>
                        <p className="font-medium text-foreground mt-1">
                          {config.engagementDates || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  {(config.scope ||
                    config.reportingCriteria ||
                    config.methodology ||
                    config.executiveSummary) && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        Report Content
                      </h3>
                      <div className="space-y-4">
                        {config.scope && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Scope
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {config.scope}
                            </p>
                          </div>
                        )}
                        {config.reportingCriteria && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Reporting Criteria
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {config.reportingCriteria}
                            </p>
                          </div>
                        )}
                        {config.methodology && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Methodology
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {config.methodology}
                            </p>
                          </div>
                        )}
                        {config.executiveSummary && (
                          <div className="p-4 bg-muted/30 border border-border rounded-lg">
                            <p className="text-sm font-medium text-foreground mb-2">
                              Executive Summary
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {config.executiveSummary}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Report Sections */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Report Sections
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[
                        { key: 'tableOfContents', label: 'Table of Contents' },
                        { key: 'listOfFigures', label: 'List of Figures' },
                        { key: 'listOfTables', label: 'List of Tables' },
                        { key: 'documentControl', label: 'Document Control' },
                        { key: 'disclaimer', label: 'Disclaimer' },
                        {
                          key: 'executiveSummarySection',
                          label: 'Executive Summary',
                        },
                        { key: 'scopeSection', label: 'Scope' },
                        {
                          key: 'reportingCriteriaSection',
                          label: 'Reporting Criteria',
                        },
                        { key: 'methodologySection', label: 'Methodology' },
                        { key: 'findingsSection', label: 'Findings' },
                        { key: 'conclusionSection', label: 'Conclusion' },
                        { key: 'appendixSection', label: 'Appendix' },
                      ].map((section) => (
                        <div
                          key={section.key}
                          className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg"
                        >
                          {config[section.key] ? (
                            <CheckIcon className="text-green-600 flex-shrink-0 w-4 h-4" />
                          ) : (
                            <XIcon className="text-red-600 flex-shrink-0 w-4 h-4" />
                          )}
                          <span className="text-sm text-foreground">
                            {section.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <SettingsIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No configuration set
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Configure project settings for report generation
                  </p>
                  <Link
                    to={`/projects/${projectId}/config`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    aria-label="Configure project"
                  >
                    <SettingsIcon className="w-5 h-5" />
                    Configure Project
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        title="Delete Vulnerability"
        message="Are you sure you want to delete this vulnerability?"
        itemName={deleteTargetName}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ProjectDetailsPage;
