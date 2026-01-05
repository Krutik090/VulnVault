/**
 * ======================================================================
 * FILE: src/features/projects/ActiveProjectsPage.jsx (FULLY UPDATED)
 * PURPOSE: Display active projects with proper client name and vulnerability counts
 * FIXES: Client name display, severity-wise vulnerability counts
 * ======================================================================
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getActiveProjects,
  getAllProjects,
} from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import { getVulnerabilityCountsByProject } from '../../api/projectVulnerabilitiesApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SearchableDropdown from '../../components/SearchableDropdown';
import DataTable from '../../components/DataTable';
import DeleteProjectModal from './DeleteProjectModal';

// ✅ CENTRALIZED ICON IMPORTS
import {
  PlusIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  SettingsIcon,
  TrashIcon,
  FolderIcon,
} from '../../components/Icons';

const ActiveProjectsPage = () => {
  const { user } = useAuth();
  const { theme, color } = useTheme();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [projectVulnCounts, setProjectVulnCounts] = useState({}); // ✅ NEW
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // ✅ Modal states for deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // ✅ Parallel API calls
      const [projectsResponse, clientsResponse] = await Promise.all([
        getActiveProjects(),
        getAllClients(),
      ]);

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

      // ✅ Fetch vulnerability counts for each project
      const vulnCountsMap = {};
      await Promise.all(
        projectData.map(async (project) => {
          try {
            const countsResponse = await getVulnerabilityCountsByProject(
              project._id
            );
            vulnCountsMap[project._id] = countsResponse.data || {
              Critical: 0,
              High: 0,
              Medium: 0,
              Low: 0,
              Info: 0,
            };
          } catch (error) {
            console.error(
              `Error fetching counts for project ${project._id}:`,
              error
            );
            // ✅ Fallback to zero counts
            vulnCountsMap[project._id] = {
              Critical: 0,
              High: 0,
              Medium: 0,
              Low: 0,
              Info: 0,
            };
          }
        })
      );

      setProjectVulnCounts(vulnCountsMap);
    } catch (error) {
      console.error('Failed to fetch projects');
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filter projects by client and status
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (selectedClient) {
      filtered = filtered.filter((p) => {
        // ✅ Handle both object and string client references
        const clientName =
          typeof p.clientId === 'object'
            ? p.clientId?.clientName
            : p.client_name;

        const clientId =
          typeof p.clientId === 'object' ? p.clientId?._id : p.clientId;

        return (
          clientName === selectedClient ||
          clientId === selectedClient
        );
      });
    }

    if (selectedStatus) {
      filtered = filtered.filter((p) => p.status === selectedStatus);
    }

    return filtered;
  }, [projects, selectedClient, selectedStatus]);

  // ✅ Get client name safely
  const getClientName = useCallback((project) => {
    if (typeof project.clientId === 'object') {
      return project.clientId?.clientName || 'Unknown';
    }
    return project.client_name || 'Unknown';
  }, []);

  // ✅ UPDATED: Table columns with severity-wise vulnerability display
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
        ),
      },
      {
        accessorKey: 'client_name',
        header: 'Client',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {getClientName(row.original)}
          </span>
        ),
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
                  <span className="text-muted-foreground text-xs">
                    No type
                  </span>
                )}
            {Array.isArray(row.original.project_type) &&
              row.original.project_type.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{row.original.project_type.length - 2}
                </span>
              )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusColors = {
            'Not Started':
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            Active:
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            Retest:
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            Completed:
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            Archived:
              'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
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
        },
      },
      {
        accessorKey: 'vulnerabilities',
        header: 'Vulnerabilities',
        cell: ({ row }) => {
          // ✅ Get counts from state map
          const counts = projectVulnCounts[row.original._id] || {
            Critical: 0,
            High: 0,
            Medium: 0,
            Low: 0,
            Info: 0,
          };

          const total =
            counts.Critical +
            counts.High +
            counts.Medium +
            counts.Low +
            counts.Info;

          // ✅ Severity color mapping
          const severityBadges = [
            {
              label: 'C',
              count: counts.Critical,
              color:
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            },
            {
              label: 'H',
              count: counts.High,
              color:
                'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            },
            {
              label: 'M',
              count: counts.Medium,
              color:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            },
            {
              label: 'L',
              count: counts.Low,
              color:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            },
            {
              label: 'I',
              count: counts.Info,
              color:
                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            },
          ];

          return (
            <div className="flex items-center gap-1 flex-wrap">
              {severityBadges.map(
                (badge) =>
                  badge.count > 0 && (
                    <span
                      key={badge.label}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${badge.color}`}
                      title={`${badge.label}: ${badge.count}`}
                    >
                      {badge.label}:{badge.count}
                    </span>
                  )
              )}
              {total === 0 && (
                <span className="text-xs text-muted-foreground">None</span>
              )}
            </div>
          );
        },
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
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          if (!row.original._id) {
            console.warn('Missing project ID:', row.original);
            return <span className="text-red-600 text-xs">No ID</span>;
          }

          return (
            <div className="flex items-center gap-1">
              {/* VIEW */}
              <Link
                to={`/projects/${row.original._id}`}
                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="View Details"
                aria-label={`View ${row.original.project_name} details`}
              >
                <EyeIcon className="w-4 h-4" />
              </Link>

              {user?.role === 'admin' && (
                <>
                  {/* EDIT */}
                  <Link
                    to={`/projects/${row.original._id}/edit`}
                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title="Edit Project"
                    aria-label={`Edit ${row.original.project_name}`}
                  >
                    <EditIcon className="w-4 h-4" />
                  </Link>

                  {/* CONFIG */}
                  <Link
                    to={`/projects/${row.original._id}/config`}
                    className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Configure Project"
                    aria-label={`Configure ${row.original.project_name}`}
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </Link>

                  {/* DELETE */}
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
                </>
              )}
            </div>
          );
        },
      },
    ],
    [user?.role, projectVulnCounts, getClientName]
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

  // ✅ Build client options from response (handle both formats)
  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clients.map((client) => {
      const clientName =
        client.client_name || client.clientName || client.name || 'Unknown';
      const clientId = client._id || client.id;

      return {
        value: clientId,
        label: clientName,
      };
    }),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Not Started', label: 'Not Started' },
    { value: 'Active', label: 'Active' },
    { value: 'Retest', label: 'Retest' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Archived', label: 'Archived' },
  ];

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Active Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            Currently active penetration testing projects
          </p>
        </div>

        {/* Admin-only "Add New Project" button */}
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
            No active projects found
          </h3>
          <p className="text-muted-foreground mb-6">
            {selectedClient || selectedStatus
              ? 'Try adjusting your filters'
              : 'Get started by creating your first project'}
          </p>

          {/* Admin-only "Create First Project" button */}
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
          title={`Active Projects (${filteredProjects.length})`}
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

export default ActiveProjectsPage;
