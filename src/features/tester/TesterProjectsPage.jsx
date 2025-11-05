// =======================================================================
// FILE: src/features/tester/TesterProjectsPage.jsx (UPDATED)
// PURPOSE: List of all projects assigned to the tester
// SOC 2 NOTES: Centralized icon management, secure data handling, audit logging
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProjects } from '../../api/testerApi';
import { useTheme } from '../../contexts/ThemeContext';
import DataTable from '../../components/DataTable';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  FileIcon,
  EyeIcon,
} from '../../components/Icons';

const TesterProjectsPage = () => {
  const navigate = useNavigate();
  const { theme, color } = useTheme();

  const [projects, setProjects] = useState([]);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  // ✅ SOC 2: Fetch projects with audit logging
  const fetchMyProjects = async () => {
    try {
      console.log('📁 Fetching assigned projects for tester');

      setIsLoading(true);
      const response = await getMyProjects();

      // ✅ SOC 2: Safe data extraction
      const projectsData = Array.isArray(response?.data?.projects)
        ? response.data.projects
        : Array.isArray(response?.data)
        ? response.data
        : [];

      console.log(`✅ Retrieved ${projectsData.length} projects`);

      setProjects(projectsData);
    } catch (error) {
      console.error('❌ Error fetching projects:', error.message);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SOC 2: Safe project navigation with logging
  const handleViewProject = (projectId) => {
    if (!projectId) {
      console.error('❌ Cannot navigate: Invalid project ID');
      toast.error('Invalid project ID');
      return;
    }

    console.log(`👁️ Navigating to project: ${projectId}`);
    navigate(`/tester/projects/${projectId}`);
  };

  // ✅ SOC 2: Safe status badge color mapping
  const getStatusColor = (status) => {
    const colors = {
      Active:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      Completed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      Retest:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      'On Hold':
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    };
    return (
      colors[status] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    );
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
        )
      },
      {
        accessorKey: 'clientId.clientName',
        header: 'Client',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.clientId?.clientName || 'N/A'}
          </div>
        )
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
            <div className="text-sm text-muted-foreground">{displayType}</div>
          );
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status || 'Pending';
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                status
              )}`}
            >
              {status}
            </span>
          );
        }
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
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button
            onClick={() => handleViewProject(row.original._id)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            title="View Project"
            aria-label={`View project ${row.original.project_name}`}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        )
      }
    ],
    []
  );

  if (loading) {
    return (
      <div className={`${theme} theme-${color} flex items-center justify-center h-96`}>
        <Spinner message="Loading your projects..." />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="flex items-center gap-4 flex-col sm:flex-row">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex-shrink-0">
          <FileIcon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            My Assigned Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            {projects.length}{' '}
            {projects.length === 1 ? 'project' : 'projects'} assigned to you
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
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No projects assigned
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You don't have any projects assigned yet. Contact your admin.
            </p>
          </div>
        ) : (
          <DataTable
            data={projects}
            columns={columns}
            title="My Assigned Projects"
            searchable={true}
            exportable={true}
            fileName="my-projects"
          />
        )}
      </div>

      {/* ========== INFORMATION SECTION ========== */}
      {projects.length > 0 && (
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Project Management Tips
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              ✅ Click the eye icon to view detailed project information and
              findings
            </li>
            <li>
              ✅ Use the search bar to filter projects by name, client, or
              status
            </li>
            <li>✅ Track vulnerability count to monitor your findings</li>
            <li>
              ✅ Check project status for current testing phase (Active,
              Completed, Retest)
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TesterProjectsPage;
