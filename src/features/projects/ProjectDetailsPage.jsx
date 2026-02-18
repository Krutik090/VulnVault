/**
 * ======================================================================
 * FILE: src/features/projects/ProjectDetailsPage.jsx (UPDATED WITH REPORT)
 * PURPOSE: Project details, vulnerability management, and Report Generation
 * SOC 2: Secure Blob download, Audit logging, Loading states
 * ======================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById } from '../../api/projectApi';
// ✅ Import the report generation API
import { getProjectConfig, generateProjectReport } from '../../api/projectDetailsApi';
import {
  getProjectVulnerabilities,
  deleteVulnerabilityInstance,
} from '../../api/projectVulnerabilitiesApi';

import {
  getProjectUnifiedVulnerabilities,
  deleteUnifiedVulnerability
} from '../../api/unifiedVulnerabilityApi';

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
  BugIcon,
  TrashIcon,
  AlertTriangleIcon,
  FileTextIcon, // Ensure you have this icon or use a generic one
  DownloadIcon, // Alternative icon
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
  const [unifiedVulnerabilities, setUnifiedVulnerabilities] = useState([]);
  const [vulnerabilitySource, setVulnerabilitySource] = useState(() => {
    return localStorage.getItem('vulnerabilitySource') || 'manual';
  });
  const [activeTab, setActiveTab] = useState('overview');
  // Delete states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Report Generation State
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const [projectResponse, configResponse, vulnResponse, unifiedResponse] = await Promise.all(
        [
          getProjectById(projectId),
          getProjectConfig(projectId).catch(() => ({ data: null })),
          getProjectVulnerabilities(projectId),
          // 👉 ADD THIS: Fetch Unified Vulnerabilities (catch error so it doesn't break page)
          getProjectUnifiedVulnerabilities(projectId).catch(err => {
            console.error("Unified fetch failed", err);
            return { data: [] };
          }),
        ]
      );

      const projectData = projectResponse.data || projectResponse;
      setProject(projectData);
      setConfig(configResponse.data || null);

      // 1. Set Manual Data
      const vulnData = Array.isArray(vulnResponse?.data)
        ? vulnResponse.data
        : Array.isArray(vulnResponse)
          ? vulnResponse
          : [];
      setVulnerabilities(vulnData);

      // 👉 2. Set Unified Data
      const unifiedData = (unifiedResponse && unifiedResponse.data) ? unifiedResponse.data : [];
      setUnifiedVulnerabilities(unifiedData);

    } catch (error) {
      console.error('Failed to fetch project details');
      toast.error('Failed to load project details');
      navigate('/active-projects');
    } finally {
      setLoading(false);
    }
  };

  // 👉 ADD THIS: Toggle Handler
  const handleSourceChange = (source) => {
    setVulnerabilitySource(source);
    localStorage.setItem('vulnerabilitySource', source);
  };

  // 👉 ADD THIS: Computed property for displayed vulnerabilities
  const displayedVulnerabilities = useMemo(() => {
    if (vulnerabilitySource === 'manual') return vulnerabilities;

    // ✅ GROUPING LOGIC: Combine Nessus findings by Title
    const groups = {};

    unifiedVulnerabilities.forEach(vuln => {
      const key = vuln.title; // Grouping by Title

      if (!groups[key]) {
        // First instance starts the group
        groups[key] = {
          ...vuln,
          _id: vuln._id, // Keep the ID of the first one to link to details
          instanceCount: 0
        };
      }
      groups[key].instanceCount++;
    });

    // Return array of unique groups
    return Object.values(groups);
  }, [vulnerabilitySource, vulnerabilities, unifiedVulnerabilities]);
  const handleGenerateReport = async () => {
    if (vulnerabilities.length === 0) {
      toast.error('Cannot generate report: No vulnerabilities found.');
      return;
    }

    if (!config) {
      toast.error('Cannot generate report: Project configuration missing.');
      setActiveTab('configuration');
      return;
    }

    setGeneratingReport(true);
    const toastId = toast.loading('Generating Word report...');

    try {
      // 1. Call API - Expecting a BLOB response
      const blobData = await generateProjectReport(projectId);

      // 2. Create a Blob with the correct Word MIME type
      const blob = new Blob([blobData], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      // 3. Create a secure URL for the blob
      const url = window.URL.createObjectURL(blob);

      // 4. Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;

      // Generate filename: ProjectName_Report_Date.docx
      const dateStr = new Date().toISOString().split('T')[0];
      const safeProjectName = project.project_name.replace(/[^a-z0-9]/gi, '_');

      // ⚠️ CHANGE EXTENSION TO .docx
      link.setAttribute('download', `${safeProjectName}_Security_Report_${dateStr}.docx`);

      document.body.appendChild(link);
      link.click();

      // 5. Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully!', { id: toastId });
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report. Please try again.', { id: toastId });
    } finally {
      setGeneratingReport(false);
    }
  };

  // Delete handlers
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
      // 👉 CHECK SOURCE TO DETERMINE API
      if (vulnerabilitySource === 'integrations') {
        await deleteUnifiedVulnerability(deleteTargetId);
        setUnifiedVulnerabilities((prev) => prev.filter((vuln) => vuln._id !== deleteTargetId));
      } else {
        await deleteVulnerabilityInstance(deleteTargetId);
        setVulnerabilities((prev) => prev.filter((vuln) => vuln._id !== deleteTargetId));
      }

      toast.success('Vulnerability deleted successfully!');
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
      toast.error(error.message || 'Failed to delete vulnerability');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTargetId, closeDeleteDialog, vulnerabilitySource]); // Add vulnerabilitySource dependency

  // Statistics calculation
  const vulnStats = useMemo(() => {
    // 👉 Use displayedVulnerabilities instead of vulnerabilities
    const stats = {
      Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0, total: displayedVulnerabilities.length,
    };
    displayedVulnerabilities.forEach((vuln) => {
      // Handle casing differences (Info vs Informational) if necessary
      let severity = vuln.severity;
      if (severity === 'Informational') severity = 'Info';

      if (severity && stats.hasOwnProperty(severity)) {
        stats[severity]++;
      }
    });
    return stats;
  }, [displayedVulnerabilities]);

  // Table Columns
  const vulnColumns = useMemo(
    () => [
      {
        // 👉 Handle both schema field names
        accessorKey: 'vulnerability_name',
        header: 'Vulnerability',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {/* Unified uses 'title', Manual uses 'vulnerability_name' */}
              {row.original.title || row.original.vulnerability_name || 'Unknown'}
            </span>
            {/* ✅ SHOW COUNT BADGE IF GROUPED */}
                {row.original.instanceCount > 1 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-gray-600 rounded-full min-w-[20px]">
                        {row.original.instanceCount}
                    </span>
                )}
                
            {/* Show Source Badge if in Integration Mode */}
            {row.original.source && row.original.source !== 'MANUAL' && (
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                {row.original.source}
              </span>
            )}
          </div>
        ),
      },
      // ... Severity and CVSS columns remain the same ...
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) => {
          // ... existing color logic ...
          const severityColors = {
            // ... existing colors
            Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            Info: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            Informational: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', // Handle both
          };
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[row.original.severity] || severityColors.Info}`}>
              {row.original.severity || 'Unknown'}
            </span>
          );
        }
      },
      // ... CVSS and Status columns remain same ...
      {
        accessorKey: 'found_by',
        header: 'Found By',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {/* Unified uses object {name, email}, Manual uses string */}
            {typeof row.original.found_by === 'object'
              ? row.original.found_by?.name
              : row.original.found_by || 'Unknown'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/ProjectVulnerabilities/instances/details/${row.original._id}`}
              className="inline-flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm font-medium"
              title="View details"
            >
              <EyeIcon className="w-4 h-4" />
              View
            </Link>
            {(user?.role === 'admin' || user?.role === 'tester') && (
              <button
                // Handle both title fields
                onClick={() => openDeleteDialog(row.original._id, row.original.title || row.original.vulnerability_name)}
                className="inline-flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
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
        <h2 className="text-xl font-semibold text-foreground">Project not found</h2>
        <Link to="/active-projects" className="text-primary hover:underline mt-4 inline-block">
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
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Projects
        </button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.project_name}</h1>
            <p className="text-muted-foreground mt-1">
              Client: {project.client_name || 'Unknown'} • Status: {project.status}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* ✅ NEW: Generate Report Button */}
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="Generate Report"
            >
              {generatingReport ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileTextIcon className="w-5 h-5" />
                  Generate Report
                </>
              )}
            </button>

            <Link
              to={`/projects/${projectId}/config`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent text-foreground rounded-lg transition-colors font-medium"
            >
              <SettingsIcon className="w-5 h-5" />
              {config ? 'Edit' : 'Configure'} Project
            </Link>

            <Link
              to={`/projects/${projectId}/add-vulnerability`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
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
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'vulnerabilities', label: `Vulnerabilities (${vulnerabilities.length})` },
              { id: 'configuration', label: 'Configuration' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                aria-pressed={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ========== OVERVIEW TAB ========== */}
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
                          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
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
                  {Object.entries(vulnStats).map(([key, value]) => {
                    const colors = {
                      Critical: 'red', High: 'orange', Medium: 'yellow', Low: 'blue', Info: 'gray', total: 'purple'
                    };
                    const color = colors[key] || 'gray';
                    return (
                      <div key={key} className={`p-4 bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/10 border border-${color}-200 dark:border-${color}-800 rounded-lg`}>
                        <p className={`text-sm text-${color}-700 dark:text-${color}-400 capitalize`}>{key}</p>
                        <p className={`text-2xl font-bold text-${color}-800 dark:text-${color}-300 mt-1`}>{value}</p>
                      </div>
                    );
                  })}
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
                          <span className="text-sm font-medium text-primary">{tester.name?.charAt(0).toUpperCase() || '?'}</span>
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

          {/* ========== VULNERABILITIES TAB ========== */}
          {activeTab === 'vulnerabilities' && (
            <div className="space-y-4">

              {/* 👉 ADD THIS: Data Source Toggle */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex p-1 bg-muted/50 rounded-lg border border-border">
                  <button
                    onClick={() => handleSourceChange('manual')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${vulnerabilitySource === 'manual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Manual (Web)
                  </button>
                  <button
                    onClick={() => handleSourceChange('integrations')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${vulnerabilitySource === 'integrations'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Integrations (Nessus)
                  </button>
                </div>

                {/* Show count badge */}
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                  Showing: {displayedVulnerabilities.length} items
                </span>
              </div>

              {/* Update DataTable Logic */}
              {displayedVulnerabilities.length === 0 ? (
                <div className="text-center py-12">
                  <BugIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No vulnerabilities found</h3>
                  <p className="text-muted-foreground mb-6">
                    {vulnerabilitySource === 'manual'
                      ? "Start by adding the first vulnerability manually."
                      : "No integration findings found. Sync from Nessus in Integrations."}
                  </p>

                  {/* Only show Add button for Manual for now */}
                  {vulnerabilitySource === 'manual' && (
                    <Link
                      to={`/projects/${projectId}/add-vulnerability`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Add First Vulnerability
                    </Link>
                  )}
                </div>
              ) : (
                <DataTable
                  data={displayedVulnerabilities} // 👉 Pass displayedVulnerabilities
                  columns={vulnColumns}
                  title={`${vulnerabilitySource === 'manual' ? 'Manual' : 'Unified'} Vulnerabilities`}
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
                    <h2 className="text-xl font-semibold text-foreground">Project Configuration</h2>
                    <Link
                      to={`/projects/${projectId}/config`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                    >
                      <EditIcon className="w-5 h-5" />
                      Edit Configuration
                    </Link>
                  </div>

                  {/* Basic Info Grid */}
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
                      {/* ... (Other config items similar to original) ... */}
                      <div className="p-4 bg-muted/30 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground">Report Type</p>
                        <p className="font-medium text-foreground mt-1">{config.reportType || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Report Sections Checklist */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">Report Sections</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {[
                        { key: 'tableOfContents', label: 'Table of Contents' },
                        { key: 'executiveSummarySection', label: 'Executive Summary' },
                        { key: 'findingsSection', label: 'Findings' },
                        { key: 'conclusionSection', label: 'Conclusion' },
                        // ... Add rest of sections here
                      ].map((section) => (
                        <div key={section.key} className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-lg">
                          {config[section.key] ? (
                            <CheckIcon className="text-green-600 flex-shrink-0 w-4 h-4" />
                          ) : (
                            <XIcon className="text-red-600 flex-shrink-0 w-4 h-4" />
                          )}
                          <span className="text-sm text-foreground">{section.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <SettingsIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No configuration set</h3>
                  <p className="text-muted-foreground mb-6">Configure project settings for report generation</p>
                  <Link
                    to={`/projects/${projectId}/config`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
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