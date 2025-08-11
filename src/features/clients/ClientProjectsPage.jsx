// =======================================================================
// FILE: src/features/clients/ClientProjectsPage.jsx (UPDATED)
// PURPOSE: Displays all projects for a single, specific client with theme support.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClientProjects } from '../../api/projectApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import ProjectConfigModal from '../projects/ProjectConfigModal';
import AddEditProjectModal from '../projects/AddEditProjectModal';
import DeleteProjectModal from '../projects/DeleteProjectModal';
import { useTheme } from '../../contexts/ThemeContext';

// Icons
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ConfigIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Risk Level Cell Component
const RiskCell = ({ counts }) => {
  const { theme } = useTheme();
  
  if (!counts) return <span className="text-muted-foreground">-</span>;
  
  return (
    <div className="flex items-center space-x-2 font-mono text-xs">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
        <span className="text-red-600 font-semibold">C:{counts.critical || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span className="text-orange-500 font-semibold">H:{counts.high || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span className="text-yellow-600 font-semibold">M:{counts.medium || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-green-600 font-semibold">L:{counts.low || 0}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="text-blue-600 font-semibold">I:{counts.info || 0}</span>
      </div>
    </div>
  );
};

const ClientProjectsPage = () => {
  const { clientId } = useParams();
  const [projects, setProjects] = useState([]);
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [projectToConfig, setProjectToConfig] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { theme, color } = useTheme();
  const navigate = useNavigate();

  const loadData = async () => {
    if (!clientId) return;
    setIsLoading(true);
    try {
      const response = await getClientProjects(clientId);
      setProjects(response.data || []);
      if (response.data && response.data.length > 0) {
        setClientName(response.data[0].clientName || 'Unknown Client');
      }
    } catch (error) {
      console.error('Error loading client projects:', error);
      toast.error("Could not load client projects.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  const handleProjectSaved = () => {
    setIsProjectModalOpen(false);
    setProjectToEdit(null);
    loadData();
    toast.success('Project saved successfully!');
  };

  const handleAddProject = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  const handleBack = () => {
    navigate('/project-records');
  };

  const columns = useMemo(() => [
    { 
      accessorKey: 'project_name', 
      header: 'Project Name',
      cell: ({ getValue, row }) => (
        <Link 
          to={`/projects/${row.original._id}`} 
          className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
        >
          {getValue() || 'Untitled Project'}
        </Link>
      )
    },
    { 
      accessorKey: 'projectType', 
      header: 'Type',
      cell: ({ getValue }) => {
        const value = getValue();
        const displayValue = Array.isArray(value) ? value.join(', ') : (value || 'Not specified');
        return (
          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm">
            {displayValue}
          </span>
        );
      }
    },
    { 
      accessorKey: 'vulnerabilityCounts', 
      header: 'Risk Distribution',
      cell: ({ getValue }) => <RiskCell counts={getValue()} />
    },
    { 
      accessorKey: 'assets', 
      header: 'Pentesters',
      cell: ({ getValue }) => {
        const assets = getValue();
        if (!assets || !Array.isArray(assets) || assets.length === 0) {
          return <span className="text-muted-foreground text-sm">Not assigned</span>;
        }
        const names = assets.map(a => a.name || 'Unknown').join(', ');
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-card-foreground">{names}</span>
          </div>
        );
      }
    },
    { 
      id: 'actions', 
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/projects/${row.original._id}`)}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="View Project"
          >
            <EyeIcon />
          </button>
          <button
            onClick={() => { 
              setProjectToEdit(row.original); 
              setIsProjectModalOpen(true); 
            }}
            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            title="Edit Project"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => setProjectToConfig(row.original)}
            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="Configure Project"
          >
            <ConfigIcon />
          </button>
          <button
            onClick={() => setProjectToDelete(row.original)}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete Project"
          >
            <TrashIcon />
          </button>
        </div>
      )
    },
  ], [navigate]);

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeftIcon />
            <span className="text-sm">Back to Projects</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FolderIcon className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">
                  {clientName} Projects
                </h1>
                <p className="text-muted-foreground mt-1">
                  All penetration testing projects for this client
                </p>
              </div>
            </div>

            <button
              onClick={handleAddProject}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <PlusIcon />
              Add Project
            </button>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <Spinner message="Loading client projects..." />
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No Projects Found</h3>
              <p className="text-muted-foreground mb-6">
                This client doesn't have any projects yet. Create the first one to get started.
              </p>
              <button
                onClick={handleAddProject}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <PlusIcon />
                Create First Project
              </button>
            </div>
          ) : (
            <DataTable 
              data={projects} 
              columns={columns} 
              title={`${clientName} Projects`}
            />
          )}
        </div>

        {/* Stats Cards */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-card-foreground">{projects.length}</p>
                </div>
                <FolderIcon className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {projects.reduce((sum, p) => sum + (p.vulnerabilityCounts?.critical || 0), 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Issues</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {projects.reduce((sum, p) => sum + (p.vulnerabilityCounts?.high || 0), 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {projects.reduce((sum, p) => {
                      const counts = p.vulnerabilityCounts || {};
                      return sum + (counts.critical || 0) + (counts.high || 0) + (counts.medium || 0) + (counts.low || 0) + (counts.info || 0);
                    }, 0)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectConfigModal 
        project={projectToConfig} 
        onClose={() => setProjectToConfig(null)} 
      />
      <AddEditProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onSave={handleProjectSaved} 
        projectToEdit={projectToEdit}
        clientId={clientId}
      />
      <DeleteProjectModal 
        project={projectToDelete} 
        onClose={() => setProjectToDelete(null)} 
        onProjectDeleted={loadData} 
      />
    </div>
  );
};

export default ClientProjectsPage;
