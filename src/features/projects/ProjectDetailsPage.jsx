// =======================================================================
// FILE: src/features/projects/ProjectDetailsPage.jsx (DATABASE SCHEMA ALIGNED)
// PURPOSE: Comprehensive project details with database schema configuration display
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

// Enhanced Icons (keeping all existing icons unchanged)
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

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ScopeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Enhanced Data Display Component (UI unchanged)
const DataField = ({ label, value, icon: Icon, className = "" }) => (
  <div className={`${className}`}>
    <div className="flex items-center gap-2 mb-2">
      {Icon && <Icon className="text-muted-foreground" />}
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-sm text-card-foreground">
      {value || <span className="text-muted-foreground italic">Not specified</span>}
    </div>
  </div>
);

// ✅ DATABASE SCHEMA ALIGNED: Updated ProjectOverview Component
const ProjectOverview = ({ project, timesheet, config }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ProjectIcon },
    { id: 'report', label: 'Report Details', icon: DocumentIcon },
    { id: 'scope', label: 'Scope', icon: ScopeIcon },
    { id: 'methodology', label: 'Methodology', icon: ShieldIcon },
  ];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Tab Navigation - UI Unchanged */}
      <div className="border-b border-border bg-muted/30">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content - ✅ ONLY DATA FIELDS CHANGED */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DataField
              label="Project Name"
              value={project?.project_name}
              icon={ProjectIcon}
            />
            <DataField
              label="Client Name"
              value={project?.clientName || project?.clientId?.clientName || config?.reportDetails?.clientName}
              icon={UserIcon}
            />
            <DataField
              label="Project Type"
              value={Array.isArray(project?.projectType) ? project.projectType.join(', ') : project?.projectType}
              icon={SettingsIcon}
            />
            <DataField
              label="Start Date"
              value={project?.projectStart ? new Date(project.projectStart).toLocaleDateString() : null}
              icon={CalendarIcon}
            />
            <DataField
              label="End Date"
              value={project?.projectEnd ? new Date(project.projectEnd).toLocaleDateString() : null}
              icon={CalendarIcon}
            />
            <DataField
              label="Status"
              value={
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  project?.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                  project?.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {project?.status || 'Active'}
                </span>
              }
              icon={ClockIcon}
            />
            <div className="col-span-full">
              <DataField
                label="Assigned Testers"
                value={
                  project?.assets?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {project.assets.map((tester, index) => (
                        <div key={index} className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                          <UserIcon className="w-3 h-3" />
                          <span className="text-sm">{tester.name}</span>
                          {(tester.hours || tester.mins) && (
                            <span className="text-xs text-muted-foreground">
                              ({tester.hours || 0}h {tester.mins || 0}m)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null
                }
                icon={TeamIcon}
              />
            </div>
          </div>
        )}

        {/* ✅ DATABASE SCHEMA ALIGNED: Report Details Tab */}
        {activeTab === 'report' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataField
              label="Report Document Name"
              value={config?.reportDetails?.reportDocName}
              icon={DocumentIcon}
            />
            <DataField
              label="Client Name"
              value={config?.reportDetails?.clientName}
              icon={UserIcon}
            />
            <DataField
              label="Version"
              value={config?.reportDetails?.version}
              icon={SettingsIcon}
            />
            <DataField
              label="Exhibit"
              value={config?.reportDetails?.exhibit}
              icon={DocumentIcon}
            />
          </div>
        )}

        {/* ✅ DATABASE SCHEMA ALIGNED: Scope Tab */}
        {activeTab === 'scope' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField
                label="Testing Type"
                value={config?.scope?.testingType}
                icon={ScopeIcon}
              />
              <DataField
                label="Domains"
                value={
                  config?.scope?.domains?.length ? (
                    <div className="space-y-1">
                      {config.scope.domains.map((domain, index) => (
                        <div key={index} className="text-sm bg-muted/50 px-2 py-1 rounded">
                          {domain}
                        </div>
                      ))}
                    </div>
                  ) : null
                }
                icon={SettingsIcon}
              />
            </div>
            <DataField
              label="Application Description"
              value={config?.scope?.appDescription}
              icon={DocumentIcon}
              className="col-span-full"
            />
            <DataField
              label="Functionality Not Tested"
              value={config?.scope?.functionalityNotTested}
              icon={AlertTriangleIcon}
              className="col-span-full"
            />
          </div>
        )}

        {/* ✅ DATABASE SCHEMA ALIGNED: Methodology Tab */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DataField
                label="CVSS Included"
                value={
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    config?.methodology?.cvssIncluded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {config?.methodology?.cvssIncluded ? 'Yes' : 'No'}
                  </span>
                }
                icon={ShieldIcon}
              />
              <DataField
                label="Business Risk Included"
                value={
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    config?.methodology?.businessRisk ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {config?.methodology?.businessRisk ? 'Yes' : 'No'}
                  </span>
                }
                icon={AlertTriangleIcon}
              />
              <DataField
                label="Communication Methods"
                value={config?.methodology?.communicationMethods}
                icon={SettingsIcon}
              />
              <DataField
                label="Session Management"
                value={config?.methodology?.sessionManagement}
                icon={ShieldIcon}
              />
              <DataField
                label="User Role Tested"
                value={config?.methodology?.userRoleTested}
                icon={UserIcon}
              />
            </div>

            {/* <DataField
              label="Team Members"
              value={
                config?.methodology?.teamMembers?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {config.methodology.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-lg">
                        <UserIcon className="w-3 h-3" />
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                ) : null
              }
              icon={TeamIcon}
            /> */}

            <DataField
              label="Limitations"
              value={config?.methodology?.limitations}
              icon={AlertTriangleIcon}
              className="col-span-full"
            />
          </div>
        )}

        {/* ✅ DATABASE SCHEMA ALIGNED: Notes */}
        {config?.notes && (
          <div className="mt-8 pt-6 border-t border-border">
            <DataField
              label="Project Notes"
              value={config.notes}
              icon={NoteIcon}
            />
          </div>
        )}
      </div>

      {!config && (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                No Configuration Available
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Please configure this project to see detailed information.
              </p>
            </div>
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
        getProjectVulnerabilities(projectId),
        getProjectNotes(projectId),
      ]);

      setProject(projectRes.data);
      setConfig(configRes.data);
      setTimesheet(timesheetRes.data);
      
      // Transform API response to match UI expectations
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

  // ✅ FIXED: Report generation handler
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const response = await generateReport(projectId);
      
      if (response.success) {
        toast.success('Report generated successfully!');
        
        // If response contains a download URL, open it
        if (response.data?.reportPath) {
          window.open(response.data.reportPath, '_blank');
        }
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
      
      const notesRes = await getProjectNotes(projectId);
      setNotes(notesRes.data || []);
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  // Vulnerability table columns (unchanged)
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
      {/* Professional Header - UI Unchanged */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto py-8 px-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
          >
            <BackIcon />
            Back to Projects
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <ProjectIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-card-foreground mb-2">
                  {project.project_name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserIcon />
                    {project.clientName || 'No client assigned'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon />
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                  className="inline-flex items-center gap-2 px-6 py-3 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-colors shadow-sm"
                >
                  <EditIcon />
                  Configure Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Enhanced Project Overview - ✅ ONLY DATA CHANGED */}
        <div className="mb-8">
          <ProjectOverview project={project} timesheet={timesheet} config={config} />
        </div>

        {/* Rest of the component remains unchanged */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Vulnerabilities Section */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-900/10 dark:to-orange-900/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <BugIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">Security Vulnerabilities</h3>
                      <p className="text-sm text-muted-foreground">
                        {vulnerabilities.reduce((sum, v) => sum + (v.instanceCount || 0), 0)} total instances across {vulnerabilities.length} unique vulnerability types
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVulnModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
                  >
                    <AddIcon />
                    Add Vulnerability
                  </button>
                </div>
              </div>
              
              {vulnerabilities.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldIcon className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-card-foreground mb-2">No Vulnerabilities Found</h4>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Great news! No security vulnerabilities have been identified for this project yet. 
                    This indicates a strong security posture.
                  </p>
                  <button
                    onClick={() => setIsVulnModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    <AddIcon />
                    Report First Vulnerability
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

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Vulnerability Overview */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <AlertTriangleIcon />
                Security Overview
              </h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {vulnerabilities.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Unique Vulnerabilities</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-xl font-bold text-red-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'Critical').length}
                    </div>
                    <div className="text-xs text-red-600">Critical</div>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'High').length}
                    </div>
                    <div className="text-xs text-orange-600">High</div>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'Medium').length}
                    </div>
                    <div className="text-xs text-yellow-600">Medium</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {vulnerabilities.filter(v => v.maxSeverity === 'Low').length}
                    </div>
                    <div className="text-xs text-green-600">Low</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Instances</span>
                    <span className="font-semibold text-card-foreground">
                      {vulnerabilities.reduce((sum, v) => sum + (v.instanceCount || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Notes */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <NoteIcon />
                Project Notes
              </h3>
              
              {/* Add Note Form */}
              <div className="mb-6">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note about this project..."
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                  rows={3}
                  disabled={isAddingNote}
                />
                <button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !noteText.trim()}
                  className="mt-3 w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No notes have been added to this project yet.
                  </p>
                ) : (
                  notes.map((note, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-card-foreground mb-3">{note.text}</p>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <UserIcon />
                        <span className="font-medium">{note.addedBy}</span>
                        <span>•</span>
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
        onConfigSaved={fetchAllData}
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
