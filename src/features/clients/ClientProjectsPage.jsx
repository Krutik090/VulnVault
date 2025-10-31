// =======================================================================
// FILE: src/features/clients/ClientProjectsPage.jsx (UPDATED)
// PURPOSE: Shows all projects for a specific client
//          Reads clientId from URL params OR cookies as fallback
//          View button visible only to admin users
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientProjects } from '../../api/clientApi';
import { useAuth } from '../../contexts/AuthContext';
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

// ✅ Helper function to read cookies (matches AuthContext)
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// ✅ Helper function to parse userData cookie (matches AuthController format)
const getUserDataFromCookie = () => {
  try {
    const userDataCookie = getCookie('userData');
    if (userDataCookie) {
      const parsedUser = JSON.parse(decodeURIComponent(userDataCookie));
      console.log('🍪 Parsed userData from cookie:', parsedUser);
      return parsedUser;
    }
  } catch (error) {
    console.error('❌ Error parsing userData from cookie:', error);
  }
  return null;
};

const ClientProjectsPage = () => {
  const { user } = useAuth();
  const { clientId: paramClientId } = useParams(); // ✅ Get from URL params for admin
  const navigate = useNavigate();
  const { theme, color } = useTheme();

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ UPDATED: Get userData from cookie (matching AuthController format)
  const userDataFromCookie = getUserDataFromCookie();

  // ✅ UPDATED: Determine which clientId to use (priority order)
  const getEffectiveClientId = () => {
    // Priority 1: URL params (admin viewing specific client's projects)
    if (paramClientId) {
      console.log('📋 [PRIORITY 1] Using clientId from URL params:', paramClientId);
      console.log('👥 Context: Admin viewing client projects');
      return paramClientId;
    }

    // Priority 2: From userData cookie (client logged in)
    if (userDataFromCookie?.id) {
      console.log('🍪 [PRIORITY 2] Using clientId from userData cookie:', userDataFromCookie.id);
      console.log('👥 Context: Client logged in, viewing own projects');
      return userDataFromCookie.id;
    }

    // Priority 3: From auth context
    if (user?.id) {
      console.log('👤 [PRIORITY 3] Using clientId from auth context:', user.id);
      console.log('👥 Context: Fallback to auth context');
      return user.id;
    }

    console.log('❌ No clientId found in any source');
    console.log('📊 Available sources:');
    console.log('   - paramClientId:', paramClientId);
    console.log('   - userDataFromCookie:', userDataFromCookie);
    console.log('   - user?.id:', user?.id);
    return null;
  };

  const effectiveClientId = getEffectiveClientId();

  useEffect(() => {
    if (effectiveClientId) {
      fetchClientProjects();
    } else {
      setLoading(false);
      toast.error('No client ID found. Please log in as a client or access via admin dashboard.');
    }
  }, [effectiveClientId]);

  const fetchClientProjects = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching projects for clientId:', effectiveClientId);
      console.log('👥 User role:', user?.role);
      console.log('🔗 Admin viewing client?', !!paramClientId);

      const response = await getClientProjects(effectiveClientId);
      console.log('📊 Projects API Response:', response);

      // ✅ FIX: Extract data correctly with fallbacks
      setClient(response.data?.client || null);
      setProjects(response.data?.projects || []);

      if (!response.data?.projects || response.data.projects.length === 0) {
        console.log('ℹ️ No projects found for this client');
      }
    } catch (error) {
      console.error('❌ Error fetching client projects:', error);
      toast.error(error.message || 'Failed to load client projects');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // ✅ UPDATED: Check if user is admin
  const isAdminUser = user?.role === 'admin';
  const isAdminViewing = !!paramClientId && isAdminUser; // ✅ Better check

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: 'project_name',
        header: 'Project Name',
        cell: ({ row }) => <div className="font-medium text-foreground">{row.original.project_name}</div>,
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
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.original.status === 'Active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : row.original.status === 'Completed'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : row.original.status === 'Retest'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'start_date',
        header: 'Start Date',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.start_date ? new Date(row.original.start_date).toLocaleDateString() : '-'}
          </div>
        ),
      },
      {
        accessorKey: 'end_date',
        header: 'End Date',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.end_date ? new Date(row.original.end_date).toLocaleDateString() : '-'}
          </div>
        ),
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
        ),
      },
      // ✅ UPDATED: Only show actions column if user is admin
      ...(isAdminUser
        ? [
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
              ),
            },
          ]
        : []),
    ],
    [isAdminUser]
  );

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
        {isAdminViewing && (
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Back to Clients"
          >
            <ArrowLeftIcon />
          </button>
        )}
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <ProjectIcon />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            {client?.clientName || 'Client'} Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdminViewing ? '🔍 Viewing as Admin • ' : ''}
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
          </p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <ProjectIcon />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No projects found</h3>
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
