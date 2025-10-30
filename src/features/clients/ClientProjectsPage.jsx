// =======================================================================
// FILE: src/features/clients/ClientProjectsPage.jsx (FIXED)
// PURPOSE: Shows all projects for a specific client
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientProjects } from '../../api/clientApi';
import { useTheme } from '../../contexts/ThemeContext';
import DataTable from '../../components/DataTable';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ClientProjectsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { theme, color } = useTheme();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientProjects();
  }, [clientId]);

  const fetchClientProjects = async () => {
    try {
      setLoading(true);
      const response = await getClientProjects(clientId);
      console.log('Projects API Response:', response);

      // ✅ FIX: Extract data correctly
      setClient(response.data?.client || null);
      setProjects(response.data?.projects || []);
    } catch (error) {
      console.error('Error fetching client projects:', error);
      toast.error(error.message || 'Failed to load client projects');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'project_name',
      header: 'Project Name',
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {row.original.project_name}
        </div>
      )
    },
    {
      accessorKey: 'project_type',
      header: 'Type',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {Array.isArray(row.original.project_type)
            ? row.original.project_type.join(', ')
            : row.original.project_type}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${row.original.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            row.original.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
              row.original.status === 'Retest' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
          {row.original.status}
        </span>
      )
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.start_date
            ? new Date(row.original.start_date).toLocaleDateString()
            : '-'}
        </div>
      )
    },
    {
      accessorKey: 'end_date',
      header: 'End Date',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.end_date
            ? new Date(row.original.end_date).toLocaleDateString()
            : '-'}
        </div>
      )
    },
    {
      accessorKey: 'vulnerabilityCount',
      header: 'Vulnerabilities',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {row.original.vulnerabilityCount || 0}
          </span>
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => handleViewProject(row.original._id)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-blue-600 dark:text-blue-400"
          title="View Project"
        >
          <EyeIcon />
        </button>
      )
    }
  ], []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeftIcon />
        </button>
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <ProjectIcon />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {client?.clientName || 'Client'} Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
          </p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <ProjectIcon />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No projects found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This client doesn't have any projects yet
            </p>
          </div>
        ) : (
          <DataTable
            data={projects}
            columns={columns}
            searchable={true}
            title={`${client?.clientName || 'Client'} Projects`} 
            exportable={true}
            fileName={`${client?.clientName || 'client'}-projects`}
          />
        )}
      </div>
    </div>
  );
};

export default ClientProjectsPage;
