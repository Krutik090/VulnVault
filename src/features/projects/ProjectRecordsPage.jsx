// =======================================================================
// FILE: src/features/projects/ProjectRecordsPage.jsx (UPDATED - ALIGNED)
// PURPOSE: Display all projects with proper field names
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllProjects } from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DeleteProjectModal from './DeleteProjectModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Same icons as ActiveProjectsPage...
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ProjectRecordsPage = () => {
  const { user } = useAuth();
  const { theme, color } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Modal states
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projectsResponse, clientsResponse] = await Promise.all([
        getAllProjects(),
        getAllClients(),
      ]);

      const projectData = projectsResponse.data || [];
      const clientData = clientsResponse.data || [];

      setProjects(projectData);
      setClients(clientData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (selectedClient) {
      filtered = filtered.filter(p => p.clientId === selectedClient);
    }

    if (selectedStatus) {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    return filtered;
  }, [projects, selectedClient, selectedStatus]);

  // Same columns as ActiveProjectsPage (copy the columns definition)
  const columns = useMemo(() => [
    {
      accessorKey: 'project_name',
      header: 'Project Name',
      cell: ({ row }) => (
        <Link 
          to={`/projects/${row.original._id}`}
          className="font-medium text-primary hover:text-primary/80 hover:underline"
        >
          {row.original.project_name}
        </Link>
      )
    },
    {
      accessorKey: 'client_name',
      header: 'Client',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.client_name || 'Unknown'}
        </span>
      )
    },
    {
      accessorKey: 'project_type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(row.original.project_type) 
            ? row.original.project_type.slice(0, 2).map((type, idx) => (
                <span 
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                >
                  {type}
                </span>
              ))
            : <span className="text-muted-foreground text-xs">No type</span>
          }
          {Array.isArray(row.original.project_type) && row.original.project_type.length > 2 && (
            <span className="text-xs text-muted-foreground">+{row.original.project_type.length - 2}</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusColors = {
          'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
          'Active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
          'Retest': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
          'Completed': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          'Archived': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[row.original.status] || statusColors['Not Started']}`}>
            {row.original.status}
          </span>
        );
      }
    },
    {
      accessorKey: 'vulnerabilityCounts',
      header: 'Vulnerabilities',
      cell: ({ row }) => {
        const counts = row.original.vulnerabilityCounts || {};
        const total = (counts.Critical || 0) + (counts.High || 0) + (counts.Medium || 0) + (counts.Low || 0) + (counts.Info || 0);
        
        return (
          <div className="flex items-center gap-2">
            {counts.Critical > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                C: {counts.Critical}
              </span>
            )}
            {counts.High > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                H: {counts.High}
              </span>
            )}
            {total === 0 && (
              <span className="text-xs text-muted-foreground">None</span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.start_date 
            ? new Date(row.original.start_date).toLocaleDateString()
            : 'N/A'
          }
        </span>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${row.original._id}`}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon />
          </Link>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  setSelectedProject(row.original);
                  setIsConfigModalOpen(true);
                }}
                className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                title="Configure"
              >
                <SettingsIcon />
              </button>
              <button
                onClick={() => {
                  setSelectedProject(row.original);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete"
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      )
    }
  ], [user]);

  const handleProjectUpdated = () => {
    fetchProjects();
    setIsConfigModalOpen(false);
    setSelectedProject(null);
  };

  const handleProjectDeleted = () => {
    fetchProjects();
    setIsDeleteModalOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clients.map(client => ({
      value: client._id,
      label: client.clientName || 'Unknown Client'
    }))
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Not Started', label: 'Not Started' },
    { value: 'Active', label: 'Active' },
    { value: 'Retest', label: 'Retest' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Archived', label: 'Archived' }
  ];

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Projects</h1>
          <p className="text-muted-foreground mt-1">
            Complete project records and history
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link
            to="/projects/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <PlusIcon />
            Add New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <FilterIcon className="text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Client</label>
            <SearchableDropdown
              options={clientOptions}
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder="Filter by client..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <SearchableDropdown
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Filter by status..."
            />
          </div>
        </div>
      </div>

      {/* Projects Table */}
      {filteredProjects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {selectedClient || selectedStatus ? 'Try adjusting your filters' : 'Get started by creating your first project'}
          </p>
          {user?.role === 'admin' && !selectedClient && !selectedStatus && (
            <Link
              to="/projects/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <PlusIcon />
              Create First Project
            </Link>
          )}
        </div>
      ) : (
        <DataTable 
          data={filteredProjects} 
          columns={columns}
          title="All Projects"
        />
      )}

      {/* Modals */}
      {isConfigModalOpen && selectedProject && (
        <ProjectConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => {
            setIsConfigModalOpen(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject._id}
          projectName={selectedProject.project_name}
          onSave={handleProjectUpdated}
        />
      )}

      {isDeleteModalOpen && selectedProject && (
        <DeleteProjectModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProject(null);
          }}
          onDeleted={handleProjectDeleted}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default ProjectRecordsPage;
