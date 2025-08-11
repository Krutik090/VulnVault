// =======================================================================
// FILE: src/features/projects/ProjectRecordsPage.jsx (UPDATED)
// PURPOSE: The main page for viewing and managing all projects with theme support.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../../api/projectApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import SearchableDropdown from '../../components/SearchableDropdown';
import ProjectConfigModal from './ProjectConfigModal';
import AddEditProjectModal from './AddEditProjectModal';
import DeleteProjectModal from './DeleteProjectModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

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

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
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

const statusMap = {
  '-2': { text: 'Recursive', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  '-1': { text: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  '0': { text: 'Not Started', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
  '1': { text: 'Active', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  '2': { text: 'Retest', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
};

const ProjectRecordsPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [projectToConfig, setProjectToConfig] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const { theme, color } = useTheme();
  const { user } = useAuth();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await getAllProjects();
      const normalizedData = response.data.map(p => ({
        ...p,
        projectType: Array.isArray(p.projectType) ? p.projectType : [p.projectType],
        assets: Array.isArray(p.assets) ? p.assets : [],
      }));
      setProjects(normalizedData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Could not fetch projects.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectSaved = () => {
    setIsProjectModalOpen(false);
    setProjectToEdit(null);
    fetchProjects();
    toast.success('Project saved successfully!');
  };

  const handleAddProject = () => {
    setProjectToEdit(null);
    setIsProjectModalOpen(true);
  };

  // Status filter options
  const statusOptions = [
    { value: '-2', label: 'Recursive' },
    { value: '-1', label: 'Completed' },
    { value: '0', label: 'Not Started' },
    { value: '1', label: 'Active' },
    { value: '2', label: 'Retest' }
  ];

  const filteredProjects = useMemo(() => {
    if (!statusFilter) {
      return projects;
    }
    return projects.filter(p => p.status?.toString() === statusFilter);
  }, [projects, statusFilter]);

  // Statistics
  const statistics = useMemo(() => {
    const total = projects.length;
    const statusCounts = projects.reduce((acc, project) => {
      const status = project.status?.toString() || '0';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      active: statusCounts['1'] || 0,
      completed: statusCounts['-1'] || 0,
      notStarted: statusCounts['0'] || 0,
      retest: statusCounts['2'] || 0,
      recursive: statusCounts['-2'] || 0
    };
  }, [projects]);

  const columns = useMemo(() => [
    { 
      accessorKey: 'project_name', 
      header: 'Project Name',
      cell: ({ getValue, row }) => (
        <Link 
          to={`/clients/${row.original.clientId}/projects`}
          className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
        >
          {getValue() || 'Untitled Project'}
        </Link>
      )
    },
    { 
      accessorKey: 'clientName', 
      header: 'Client',
      cell: ({ getValue }) => (
        <span className="text-card-foreground">{getValue() || 'Unknown Client'}</span>
      )
    },
    { 
      accessorKey: 'projectType', 
      header: 'Project Type',
      cell: ({ getValue }) => {
        const types = getValue() || [];
        return (
          <div className="flex flex-wrap gap-1">
            {types.slice(0, 2).map((type, index) => (
              <span key={index} className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                {type}
              </span>
            ))}
            {types.length > 2 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                +{types.length - 2} more
              </span>
            )}
          </div>
        );
      }
    },
    { 
      accessorKey: 'projectStart', 
      header: 'Start Date',
      cell: ({ getValue }) => {
        const date = getValue();
        if (!date) return <span className="text-muted-foreground">Not set</span>;
        
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-muted-foreground" />
            <span className="text-sm text-card-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        );
      }
    },
    { 
      accessorKey: 'projectEnd', 
      header: 'End Date',
      cell: ({ getValue }) => {
        const date = getValue();
        if (!date) return <span className="text-muted-foreground">Not set</span>;
        
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-muted-foreground" />
            <span className="text-sm text-card-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        );
      }
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ getValue }) => {
        const status = statusMap[getValue()];
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${status?.color || 'bg-gray-100 text-gray-800'}`}>
            {status?.text || 'Unknown'}
          </span>
        );
      }
    },
    { 
      accessorKey: 'assets', 
      header: 'Pentesters',
      cell: ({ getValue }) => {
        const assets = getValue() || [];
        if (assets.length === 0) {
          return <span className="text-muted-foreground text-sm">Not assigned</span>;
        }
        
        return (
          <div className="flex items-center gap-2">
            <UserIcon className="text-muted-foreground" />
            <span className="text-sm text-card-foreground">
              {assets.map(asset => asset.name || 'Unknown').join(', ')}
            </span>
          </div>
        );
      }
    },
    { 
      id: 'actions', 
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/clients/${row.original.clientId}/projects`}
            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="View Project"
          >
            <EyeIcon />
          </Link>
          {user?.role === 'admin' && (
            <>
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
            </>
          )}
        </div>
      )
    },
  ], [user?.role]);

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <FolderIcon className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">
                  Project Records
                </h1>
                <p className="text-muted-foreground mt-1">
                  View, create, and manage all penetration testing projects
                </p>
              </div>
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={handleAddProject}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <PlusIcon />
                Add Project
              </button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-card-foreground">{statistics.total}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-xl font-bold text-blue-600">{statistics.active}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-green-600">{statistics.completed}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Not Started</p>
              <p className="text-xl font-bold text-gray-600">{statistics.notStarted}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Retest</p>
              <p className="text-xl font-bold text-yellow-600">{statistics.retest}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Recursive</p>
              <p className="text-xl font-bold text-purple-600">{statistics.recursive}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <SearchableDropdown
                label="Filter by Status"
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All statuses"
                noOptionsMessage="No statuses found"
              />
            </div>
            {statusFilter && (
              <div className="flex items-end">
                <button
                  onClick={() => setStatusFilter('')}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <FilterIcon />
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <Spinner message="Loading projects..." />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {projects.length === 0 ? 'No Projects Found' : 'No Results Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {projects.length === 0 
                  ? 'No projects have been created yet. Create your first project to get started.'
                  : 'No projects match your current filter criteria. Try adjusting your filters.'
                }
              </p>
              {user?.role === 'admin' && projects.length === 0 && (
                <button
                  onClick={handleAddProject}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <PlusIcon />
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            <DataTable 
              data={filteredProjects} 
              columns={columns} 
              title={`Project Records${statusFilter ? ' (Filtered)' : ''}`}
            />
          )}
        </div>

        {/* Filter Results Summary */}
        {statusFilter && filteredProjects.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} projects
              • Status: {statusOptions.find(s => s.value === statusFilter)?.label}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {user?.role === 'admin' && (
        <>
          <ProjectConfigModal 
            project={projectToConfig} 
            onClose={() => setProjectToConfig(null)} 
          />
          <AddEditProjectModal 
            isOpen={isProjectModalOpen} 
            onClose={() => setIsProjectModalOpen(false)} 
            onSave={handleProjectSaved} 
            projectToEdit={projectToEdit}
          />
          <DeleteProjectModal 
            project={projectToDelete} 
            onClose={() => setProjectToDelete(null)} 
            onProjectDeleted={fetchProjects} 
          />
        </>
      )}
    </div>
  );
};

export default ProjectRecordsPage;
