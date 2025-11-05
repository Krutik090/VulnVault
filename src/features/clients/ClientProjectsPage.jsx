/**
 * ======================================================================
 * FILE: src/features/clients/ClientProjectsPage.jsx (COMPLETE - FIXED)
 * PURPOSE: Shows all projects for a specific client
 * FIXES: Proper role-based API calls, removed cookie parsing
 * SOC 2 NOTES: Centralized icon management, secure API handling, audit logging
 * ======================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientProjects, getMyProjects } from '../../api/clientApi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import DataTable from '../../components/DataTable';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
    ArrowLeftIcon,
    FileIcon,
    EyeIcon,
    AlertTriangleIcon,
} from '../../components/Icons';

// ✅ SOC 2: Safe status badge color mapping
const getStatusBadgeColor = (status) => {
    const colors = {
        Active:
            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
        Completed:
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        Retest:
            'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    };
    return (
        colors[status] ||
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    );
};

const ClientProjectsPage = () => {
    const { user } = useAuth();
    const { clientId: paramClientId } = useParams();
    const navigate = useNavigate();
    const { theme, color } = useTheme();

    const [client, setClient] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✅ FIXED: Determine if admin is viewing a specific client
    const isAdminViewing = !!paramClientId && user?.role === 'admin';

    useEffect(() => {
        fetchProjects();
    }, [user?.role, paramClientId]);

    /**
     * ✅ FIXED: Fetch projects with proper role-based logic
     */
    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;

            // ✅ FIXED: Use different endpoints based on role and context
            if (user?.role === 'client') {
                // ✅ Client users always use /my-projects
                console.log('🔍 Fetching projects for current client user');
                response = await getMyProjects();
            } else if (user?.role === 'admin' && paramClientId) {
                // ✅ Admins viewing specific client projects
                console.log(
                    `🔍 Admin viewing client projects: ${paramClientId}`
                );
                response = await getClientProjects(paramClientId);
            } else {
                // ✅ Invalid state
                throw new Error(
                    'Invalid access: Please provide a client ID or log in as a client'
                );
            }

            console.log('📊 Projects fetched successfully');

            // ✅ SOC 2: Safe data extraction
            const clientData = response?.data?.client || null;
            const projectsData = Array.isArray(response?.data?.projects)
                ? response.data.projects
                : [];

            setClient(clientData);
            setProjects(projectsData);

            if (projectsData.length === 0) {
                console.log('ℹ️ No projects found for this client');
            }
        } catch (error) {
            console.error('❌ Error fetching client projects:', error.message);
            setError(error.message);
            toast.error(error.message || 'Failed to load client projects');
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✅ SOC 2: Safe project navigation with logging
     */
    const handleViewProject = (projectId) => {
        if (!projectId) {
            console.error('❌ Cannot navigate: Invalid project ID');
            toast.error('Invalid project ID');
            return;
        }

        console.log(`👁️ Navigating to project: ${projectId}`);
        navigate(`/client/projects/${projectId}`);
    };

    // ✅ SOC 2: Table columns with proper data handling
    const columns = useMemo(
        () => [
            {
                accessorKey: 'project_name',
                header: 'Project Name',
                cell: ({ row }) => (
                    <div className="font-medium text-foreground">
                        {row.original.project_name || 'Unnamed Project'}
                    </div>
                ),
            },
            {
                accessorKey: 'project_type',
                header: 'Type',
                cell: ({ row }) => {
                    const projectType = row.original.project_type;
                    const displayType = Array.isArray(projectType)
                        ? projectType.join(', ')
                        : projectType || 'N/A';

                    return (
                        <div className="text-sm text-muted-foreground">
                            {displayType}
                        </div>
                    );
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.original.status || 'Pending';
                    return (
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                status
                            )}`}
                        >
                            {status}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'start_date',
                header: 'Start Date',
                cell: ({ row }) => (
                    <div className="text-sm text-muted-foreground">
                        {row.original.start_date
                            ? new Date(
                                  row.original.start_date
                              ).toLocaleDateString()
                            : '-'}
                    </div>
                ),
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
                ),
            },
            {
                accessorKey: 'vulnerabilityCount',
                header: 'Vulnerabilities',
                cell: ({ row }) => {
                    const count = row.original.vulnerabilityCount || 0;
                    return (
                        <div className="text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800 border">
                                {count}
                            </span>
                        </div>
                    );
                },
            },
        ],
        []
    );

    // ✅ Loading state
    if (loading) {
        return (
            <div className={`${theme} theme-${color}`}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Spinner size="large" message="Loading projects..." />
                </div>
            </div>
        );
    }

    // ✅ Error state
    if (error) {
        return (
            <div className={`${theme} theme-${color}`}>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <AlertTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        Unable to Load Projects
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md">
                        {error}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchProjects}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            aria-label="Retry loading projects"
                        >
                            Try Again
                        </button>
                        {isAdminViewing && (
                            <button
                                onClick={() => navigate('/clients')}
                                className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-accent transition-colors"
                                aria-label="Back to clients"
                            >
                                Back to Clients
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${theme} theme-${color} space-y-6`}>
            {/* ========== HEADER ========== */}
            <div className="flex items-center gap-4">
                {isAdminViewing && (
                    <button
                        onClick={() => navigate('/clients')}
                        className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
                        title="Back to Clients"
                        aria-label="Go back to clients"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                )}
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex-shrink-0">
                    <FileIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold text-foreground truncate">
                        {client?.clientName || 'Client'} Projects
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isAdminViewing ? '🔍 Viewing as Admin • ' : ''}
                        {projects.length}{' '}
                        {projects.length === 1 ? 'project' : 'projects'} found
                    </p>
                </div>
            </div>

            {/* ========== PROJECTS TABLE ========== */}
            <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                {projects.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <div className="flex justify-center mb-4">
                            <FileIcon className="w-16 h-16 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
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
                        fileName={`${
                            client?.clientName || 'client'
                        }-projects`}
                    />
                )}
            </div>

            {/* ========== INFORMATION SECTION ========== */}
            <div className="bg-muted/30 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                    Project Management
                </h3>
                <p className="text-sm text-muted-foreground">
                    Click on any project to view detailed information, security
                    findings, and remediation status. Use the search bar to
                    filter projects by name or type.
                </p>
            </div>
        </div>
    );
};

export default ClientProjectsPage;
