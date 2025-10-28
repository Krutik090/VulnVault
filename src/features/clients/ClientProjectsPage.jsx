// =======================================================================
// FILE: src/features/clients/ClientProjectsPage.jsx (UPDATED - PROPER SPACING)
// PURPOSE: Display all projects for a specific client
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClientProjects } from '../../api/projectApi';
import toast from 'react-hot-toast';

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
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  if (!counts) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {counts.Critical > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          C: {counts.Critical}
        </span>
      )}
      {counts.High > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
          H: {counts.High}
        </span>
      )}
      {counts.Medium > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          M: {counts.Medium}
        </span>
      )}
      {counts.Low > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          L: {counts.Low}
        </span>
      )}
      {counts.Info > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          I: {counts.Info}
        </span>
      )}
    </div>
  );
};

const ClientProjectsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { theme, color } = useTheme();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('');

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [clientId]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await getClientProjects(clientId);
      const projectData = response.data || response; // ✅ Extract data
      setProjects(projectData);

      // Get client info from first project if available
      if (projectData.length > 0 && projectData[0].clientId) {
        setClientName(projectData[0].clientId.clientName || projectData[0].client_name);
      }
    } catch (error) {
      console.error('Error fetching client projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };


  const handleProjectAction = (action, project) => {
    setSelectedProject(project);
    if (action === 'config') setIsConfigModalOpen(true);
    if (action === 'edit') setIsEditModalOpen(true);
    if (action === 'delete') setIsDeleteModalOpen(true);
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'project_name',
      header: 'Project Name',
      cell: ({ row }) => (
        <Link
          to={`/projects/${row.original._id}`}
          className="text-primary hover:text-primary/80 font-medium hover:underline"
        >
          {row.original.project_name}
        </Link>
      )
    },
    {
      accessorKey: 'project_type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {row.original.project_type}
        </span>
      )
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.start_date ? new Date(row.original.start_date).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.end_date ? new Date(row.original.end_date).toLocaleDateString() : '-'}
        </span>
      )
    },
    {
      accessorKey: 'vulnerabilityCounts',
      header: 'Vulnerabilities',
      cell: ({ row }) => <RiskCell counts={row.original.vulnerabilityCounts} />
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusColors = {
          'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
          'Active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          'Retest': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          'Recursive': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
        };

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.original.status] || statusColors['Not Started']}`}>
            {row.original.status}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${row.original._id}`}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon />
          </Link>
          <button
            onClick={() => handleProjectAction('config', row.original)}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Configuration"
          >
            <ConfigIcon />
          </button>
          <button
            onClick={() => handleProjectAction('edit', row.original)}
            className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => handleProjectAction('delete', row.original)}
            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <TrashIcon />
          </button>
        </div>
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

  return (
    // ✅ REMOVED: max-w-7xl mx-auto - uses parent container spacing
    <div className={`${theme} theme-${color} space-y-6`}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/project-records')}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-3xl font-bold text-foreground">{clientName}</h1>
          </div>
          <p className="text-muted-foreground ml-14">
            All penetration testing projects for this client
          </p>
        </div>

        <Link
          to="/projects/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <PlusIcon />
          Add New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FolderIcon className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {projects.reduce((sum, p) => sum + (p.vulnerabilityCounts?.Critical || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Issues</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {projects.reduce((sum, p) => sum + (p.vulnerabilityCounts?.High || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {projects.reduce((sum, p) => {
                  const counts = p.vulnerabilityCounts || {};
                  return sum + (counts.Critical || 0) + (counts.High || 0) + (counts.Medium || 0) + (counts.Low || 0) + (counts.Info || 0);
                }, 0)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      {projects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm">
          <FolderIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Found</h3>
          <p className="text-muted-foreground mb-6">
            This client doesn't have any projects yet. Create the first one to get started.
          </p>
          <Link
            to="/projects/add"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <PlusIcon />
            Create First Project
          </Link>
        </div>
      ) : (
        <DataTable
          data={projects}
          columns={columns}
          title={`Projects for ${clientName}`}
        />
      )}

      {/* Modals */}
      {isConfigModalOpen && selectedProject && (
        <ProjectConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          project={selectedProject}
        />
      )}

      {isEditModalOpen && selectedProject && (
        <AddEditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProjectAdded={fetchProjects}
          existingProject={selectedProject}
        />
      )}

      {isDeleteModalOpen && selectedProject && (
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onProjectDeleted={fetchProjects}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default ClientProjectsPage;
