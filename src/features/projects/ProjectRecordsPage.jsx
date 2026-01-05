// =======================================================================
// FILE: src/features/projects/ProjectRecordsPage.jsx (UPDATED)
// PURPOSE: Display all projects with proper field names
// SOC 2 NOTES: Centralized icon management, secure data handling, role-based access
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
import SearchableDropdown from '../../components/SearchableDropdown';
import DataTable from '../../components/DataTable';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  PlusIcon,
  FilterIcon,
  EyeIcon,
  TrashIcon,
  FolderIcon,
} from '../../components/Icons';

const ProjectRecordsPage = () => {
  const { user } = useAuth();
  const { theme, color } = useTheme();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // ✅ SOC 2: Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // ✅ SOC 2: Parallel API calls for performance
      const [projectsResponse, clientsResponse] = await Promise.all([
        getAllProjects(),
        getAllClients(),
      ]);

      // ✅ SOC 2: Input validation & sanitization
      const projectData = Array.isArray(projectsResponse?.data)
        ? projectsResponse.data
        : Array.isArray(projectsResponse)
        ? projectsResponse
        : [];

      const clientData = Array.isArray(clientsResponse?.data)
        ? clientsResponse.data
        : [];

      setProjects(projectData);
      setClients(clientData);
    } catch (error) {
      console.error('Failed to fetch projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SOC 2: Filter projects with defensive checks
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (selectedClient) {
      filtered = filtered.filter(
        (p) => p.client_name === selectedClient || p.clientId === selectedClient
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    return filtered;
  }, [projects, selectedClient, selectedStatus]);

  // ✅ SOC 2: Table columns with proper rendering
  const columns = useMemo(
    () => [
      {
        accessorKey: 'project_name',
        header: 'Project Name',
        cell: ({ row }) => (
          <Link
            to={`/projects/${row.original._id}`}
            className="font-medium text-primary hover:text-primary/80 hover:underline"
            aria-label={`View ${row.original.project_name} details`}
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
              : row.original.project_type ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  {row.original.project_type}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">No type</span>
              )}
            {Array.isArray(row.original.project_type) &&
              row.original.project_type.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{row.original.project_type.length - 2}
                </span>
              )}
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusColors = {
            'Not Started':
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            'Active':
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'Retest':
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            'Completed':
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'Archived':
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          };

          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[row.original.status] ||
                statusColors['Not Started']
              }`}
            >
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
          const total =
            (counts.Critical || 0) +
            (counts.High || 0) +
            (counts.Medium || 0) +
            (counts.Low || 0) +
            (counts.Info || 0);

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
              : 'N/A'}
          </span>
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {/* ✅ SOC 2: View action available to all authenticated users */}
            <Link
              to={`/projects/${row.original._id}`}
              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="View Details"
              aria-label={`View ${row.original.project_name} details`}
            >
              <EyeIcon className="w-4 h-4" />
            </Link>

            {/* ✅ SOC 2: Admin-only delete action */}
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  setSelectedProject(row.original);
                  setIsDeleteModalOpen(true);
                }}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete Project"
                aria-label={`Delete ${row.original.project_name}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )
      }
    ],
    [user?.role]
  );

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

  // ✅ SOC 2: Safe client options mapping
  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clients.map((client) => ({
      value: client._id || client.id,
      label:
        client.client_name || client.clientName || client.name || 'Unknown'
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
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Projects</h1>
          <p className="text-muted-foreground mt-1">
            Complete project records and history
          </p>
        </div>

        {/* ✅ SOC 2: Admin-only "Add New Project" button */}
        {user?.role === 'admin' && (
          <Link
            to="/projects/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            aria-label="Add new project"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Project
          </Link>
        )}
      </div>

      {/* ========== FILTERS ========== */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <FilterIcon className="text-muted-foreground w-5 h-5" />
          <h2 className="font-semibold text-foreground">Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Client Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Client
            </label>
            <SearchableDropdown
              options={clientOptions}
              value={selectedClient}
              onChange={setSelectedClient}
              placeholder="Filter by client..."
              aria-label="Select client to filter projects"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <SearchableDropdown
              options={statusOptions}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Filter by status..."
              aria-label="Select status to filter projects"
            />
          </div>

          {/* Results Counter */}
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              Showing <strong>{filteredProjects.length}</strong> project
              {filteredProjects.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ========== PROJECTS TABLE OR EMPTY STATE ========== */}
      {filteredProjects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FolderIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No projects found
          </h3>
          <p className="text-muted-foreground mb-6">
            {selectedClient || selectedStatus
              ? 'Try adjusting your filters'
              : 'Get started by creating your first project'}
          </p>

          {/* ✅ SOC 2: Admin-only "Create First Project" button */}
          {user?.role === 'admin' &&
            !selectedClient &&
            !selectedStatus && (
              <Link
                to="/projects/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                aria-label="Create first project"
              >
                <PlusIcon className="w-5 h-5" />
                Create First Project
              </Link>
            )}
        </div>
      ) : (
        <DataTable
          data={filteredProjects}
          columns={columns}
          title={`All Projects (${filteredProjects.length})`}
        />
      )}

      {/* ========== DELETE MODAL ========== */}
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
