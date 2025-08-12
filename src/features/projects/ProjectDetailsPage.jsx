// =======================================================================
// FILE: src/features/projects/ProjectDetailsPage.jsx (UPDATED)
// PURPOSE: Comprehensive project details with all information from old UI
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById, getProjectConfig, getProjectTimesheet, getProjectNotes, addProjectNote } from '../../api/projectDetailsApi';
import { getProjectVulnerabilities } from '../../api/projectVulnerabilitiesApi';
import { generateReport } from '../../api/reportApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ProjectConfigModal from './ProjectConfigModal';
import AddVulnerabilityModal from './AddVulnerabilityModal';

// Icons
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const AddIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const BugIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m0 0V6a2 2 0 012-2h6a2 2 0 012 2v2m-3 0V4" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Project Summary Component with all information from old UI
const ProjectSummary = ({ project, timesheet, config }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-6">Project Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-card-foreground border-b border-border pb-2">Basic Information</h4>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Version:</span>
              <p className="text-sm text-card-foreground mt-1">{config?.reportDetails?.version || 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client:</span>
              <p className="text-sm text-card-foreground mt-1">{project?.clientName || 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project Type:</span>
              <p className="text-sm text-card-foreground mt-1">
                {Array.isArray(project?.projectType) 
                  ? project.projectType.join(', ') 
                  : project?.projectType || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <h4 className="font-medium text-card-foreground border-b border-border pb-2">Timeline</h4>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start Date:</span>
              <div className="flex items-center gap-2 mt-1">
                <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                <p className="text-sm text-card-foreground">
                  {project?.projectStart ? new Date(project.projectStart).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">End Date:</span>
              <div className="flex items-center gap-2 mt-1">
                <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                <p className="text-sm text-card-foreground">
                  {project?.projectEnd ? new Date(project.projectEnd).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-card-foreground border-b border-border pb-2">Assigned Testers</h4>
          <div className="space-y-2">
            {project?.assets?.length ? (
              project.assets.map((tester, index) => (
                <div key={index} className="flex items-center gap-2">
                  <UserIcon className="w-3 h-3 text-primary" />
                  <span className="text-sm text-card-foreground">{tester.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tester.hours || 0}h {tester.mins || 0}m
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Not assigned</p>
            )}
          </div>
        </div>

        {/* Configuration Status */}
        <div className="space-y-4">
          <h4 className="font-medium text-card-foreground border-b border-border pb-2">Configuration</h4>
          <div className="space-y-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Testing Type:</span>
              <p className="text-sm text-card-foreground mt-1">
                {config?.methodology || 'Black box Testing'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Risk Included:</span>
              <p className="text-sm text-card-foreground mt-1">
                {config?.businessRisk ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">CVSS Included:</span>
              <p className="text-sm text-card-foreground mt-1">
                {config?.cvssIncluded ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {!config && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">No configuration set for this project.</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, color } = useTheme();

  const [project, setProject] = useState(null);
  const [config, setConfig] = useState(null);
  const [timesheet, setTimesheet] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isVulnModalOpen, setIsVulnModalOpen] = useState(false);

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchAllData();
    }
  }, [projectId]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        projectRes,
        configRes,
        timesheetRes,
        vulnerabilitiesRes,
        notesRes,
      ] = await Promise.all([
        getProjectById(projectId),
        getProjectConfig(projectId),
        getProjectTimesheet(projectId),
        getProjectVulnerabilities(projectId), // This returns aggregated vulnerabilities
        getProjectNotes(projectId),
      ]);

      setProject(projectRes.data);
      setConfig(configRes.data);
      setTimesheet(timesheetRes.data);
      
      // FIXED: Transform API response to match UI expectations
      const vulnData = vulnerabilitiesRes.data || [];
      const transformedVulnerabilities = vulnData.map(vuln => ({
        vulnName: vuln.vulnerability_name,
        instanceCount: vuln.total_count,
        maxSeverity: vuln.severity
      }));
      setVulnerabilities(transformedVulnerabilities);
      
      setNotes(notesRes.data || []);
    } catch (error) {
      console.error('Error fetching project data:', error);
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await generateReport(projectId);
      if (response.success && response.data?.reportPath) {
        const link = document.createElement('a');
        link.href = response.data.reportPath;
        link.download = `${project.project_name}_Report.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Report generated and downloaded successfully!');
      } else {
        throw new Error(response.message || 'Report generation failed');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error('Please enter a note');
      return;
    }

    setIsAddingNote(true);
    try {
      await addProjectNote(projectId, { text: noteText.trim() });
      toast.success('Note added successfully');
      setNoteText('');
      
      // Refresh notes
      const notesRes = await getProjectNotes(projectId);
      setNotes(notesRes.data || []);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Vulnerability table columns with corrected data structure
  const vulnerabilityColumns = useMemo(() => [
    { 
      accessorKey: 'vulnName', 
      header: 'Vulnerability Name',
      cell: ({ getValue, row }) => (
        <Link 
          to={`/ProjectVulnerabilities/instances/${encodeURIComponent(getValue())}?projectName=${encodeURIComponent(project?.project_name || '')}`}
          className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors flex items-center gap-2"
        >
          <BugIcon />
          {getValue() || 'Unnamed Vulnerability'}
        </Link>
      )
    },
    { 
      accessorKey: 'instanceCount', 
      header: 'Instances',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{getValue()}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {getValue() === 1 ? 'instance' : 'instances'}
          </span>
        </div>
      )
    },
    { 
      accessorKey: 'maxSeverity', 
      header: 'Highest Severity',
      cell: ({ getValue }) => {
        const severity = getValue();
        if (!severity) return <span className="text-muted-foreground">Unknown</span>;
        
        const getSeverityColor = (sev) => {
          const colors = {
            'Critical': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400',
            'High': 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
            'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
            'Low': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400',
            'Informational': 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400'
          };
          return colors[sev] || 'text-gray-600 bg-gray-50 border-gray-200';
        };
        
        return (
          <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${getSeverityColor(severity)}`}>
            <AlertTriangleIcon className="w-3 h-3 mr-1" />
            {severity}
          </div>
        );
      }
    }
  ], [project?.project_name]);

  if (isLoading) {
    return (
      <div className={`${theme} theme-${color} min-h-screen bg-background flex items-center justify-center`}>
        <Spinner message="Loading project details..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className={`${theme} theme-${color} min-h-screen bg-background flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-card-foreground mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested project could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <BackIcon />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <BackIcon />
            <span className="text-sm">Back</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <ProjectIcon className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">
                  Project Details
                </h1>
                <p className="text-muted-foreground mt-1">
                  {project.project_name} • {project.clientName}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingReport ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ReportIcon />
                    Generate Report
                  </>
                )}
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-colors"
                >
                  <EditIcon />
                  Configure
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project Summary - Now includes all information from old UI */}
        <div className="mb-8">
          <ProjectSummary project={project} timesheet={timesheet} config={config} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Vulnerabilities Section */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">Vulnerabilities</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vulnerabilities.reduce((sum, v) => sum + (v.instanceCount || 0), 0)} total instances across {vulnerabilities.length} unique vulnerabilities
                  </p>
                </div>
                <button
                  onClick={() => setIsVulnModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  <AddIcon />
                  Add Vulnerability
                </button>
              </div>
              
              {vulnerabilities.length === 0 ? (
                <div className="p-12 text-center">
                  <BugIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-card-foreground mb-2">0 total instances across 1 vulnerability types</h4>
                  <p className="text-muted-foreground mb-4">
                    No vulnerabilities have been reported for this project yet.
                  </p>
                  <button
                    onClick={() => setIsVulnModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <AddIcon />
                    Add Vulnerability
                  </button>
                </div>
              ) : (
                <DataTable 
                  data={vulnerabilities} 
                  columns={vulnerabilityColumns}
                  showPagination={vulnerabilities.length > 10}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vulnerability Overview */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Vulnerability Overview</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {vulnerabilities.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Unique Vulnerabilities</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Instances</span>
                    <span className="font-semibold text-card-foreground">
                      {vulnerabilities.reduce((sum, v) => sum + (v.instanceCount || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Critical</span>
                    <span className="font-semibold text-red-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'Critical').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">High</span>
                    <span className="font-semibold text-orange-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'High').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Medium</span>
                    <span className="font-semibold text-yellow-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'Medium').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Low</span>
                    <span className="font-semibold text-green-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'Low').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Notes */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Project Notes</h3>
              
              {/* Add Note Form */}
              <div className="mb-6">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this project..."
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={3}
                  disabled={isAddingNote}
                />
                <button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !noteText.trim()}
                  className="mt-2 w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isAddingNote ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <NoteIcon />
                      Add Note
                    </>
                  )}
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes available.</p>
                ) : (
                  notes.map((note, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-card-foreground mb-2">{note.text}</p>
                      <div className="text-xs text-muted-foreground">
                        <span className="font-medium">by {note.addedBy}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(note.dateAdded).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectConfigModal 
        project={project} 
        onClose={() => setIsConfigModalOpen(false)}
        isOpen={isConfigModalOpen}
      />
      <AddVulnerabilityModal 
        isOpen={isVulnModalOpen}
        onClose={() => setIsVulnModalOpen(false)}
        projectId={projectId}
        onVulnerabilityAdded={fetchAllData}
      />
    </div>
  );
};

export default ProjectDetailsPage;
