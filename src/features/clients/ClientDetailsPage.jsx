// =======================================================================
// FILE: src/features/clients/ClientDetailsPage.jsx (UPDATED)
// PURPOSE: Detailed view of a single client with edit capability
// SOC 2 NOTES: Centralized icon management, secure data handling, audit logging
// =======================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClientById, getClientProjects } from '../../api/clientApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import AddEditClientModal from './AddEditClientModal';
import DeleteClientModal from './DeleteClientModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  ArrowLeftIcon,
  BarChartIcon,
  BuildingIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
} from '../../components/Icons';

const ClientDetailsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, color } = useTheme();

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  // ✅ SOC 2: Fetch client details with audit logging
  const fetchClientDetails = async () => {
    try {
      console.log(`👁️ Fetching client details: ${clientId}`);

      setLoading(true);

      // Fetch client details
      const clientResponse = await getClientById(clientId);
      console.log(`✅ Client data retrieved: ${clientId}`);

      // Fetch client projects
      const projectsResponse = await getClientProjects(clientId);
      console.log(`✅ Projects retrieved: ${
        Array.isArray(projectsResponse?.data?.projects)
          ? projectsResponse.data.projects.length
          : 0
      } projects`);

      // ✅ SOC 2: Safe data extraction
      setClient(clientResponse?.data || null);
      setProjects(
        Array.isArray(projectsResponse?.data?.projects)
          ? projectsResponse.data.projects
          : []
      );
    } catch (error) {
      console.error('❌ Error fetching client details:', error.message);
      toast.error(error.message || 'Failed to load client details');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleClientUpdated = () => {
    console.log('♻️ Client updated, refreshing details');
    fetchClientDetails();
    setIsEditModalOpen(false);
  };

  const handleClientDeleted = () => {
    console.log('🗑️ Client deleted successfully');
    toast.success('Client deleted successfully');
    navigate('/clients');
  };

  if (loading) {
    return (
      <div className={`${theme} theme-${color}`}>
        <div className="flex items-center justify-center h-96">
          <Spinner message="Loading client details..." />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className={`${theme} theme-${color} text-center py-16`}>
        <h3 className="text-lg font-semibold text-foreground">
          Client not found
        </h3>
        <button
          onClick={() => navigate('/clients')}
          className="mt-4 text-primary hover:underline"
          aria-label="Go back to clients"
        >
          Go back to clients
        </button>
      </div>
    );
  }

  // ✅ SOC 2: Safe status badge color mapping
  const getStatusBadgeColor = (status) => {
    const colors = {
      Active:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      Completed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'In Progress':
        'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    };
    return (
      colors[status] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    );
  };

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Go back to clients"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex-shrink-0">
            <BuildingIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-foreground truncate">
              {client.clientName || 'Unnamed Client'}
            </h1>
            <p className="text-muted-foreground mt-1 truncate">
              {client.contactEmail || 'No email'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Dashboard Button */}
          <button
            onClick={() => navigate(`/clients/${clientId}/dashboard`)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg whitespace-nowrap"
            aria-label="View client dashboard"
          >
            <BarChartIcon className="w-4 h-4" />
            Dashboard
          </button>

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                aria-label="Edit client"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                aria-label="Delete client"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========== STATISTICS CARDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Total Projects
          </div>
          <div className="text-3xl font-bold text-foreground">
            {projects.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Active Projects
          </div>
          <div className="text-3xl font-bold text-green-600">
            {projects.filter((p) => p.status === 'Active').length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Completed</div>
          <div className="text-3xl font-bold text-blue-600">
            {projects.filter((p) => p.status === 'Completed').length}
          </div>
        </div>
      </div>

      {/* ========== CLIENT INFORMATION ========== */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Client Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Contact Person
            </div>
            <div className="text-base text-foreground font-medium">
              {client.contactPerson || '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Email</div>
            <div className="text-base text-foreground font-medium">
              {client.contactEmail || '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Phone</div>
            <div className="text-base text-foreground font-medium">
              {client.contactPhone || '-'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Website</div>
            <div className="text-base text-foreground font-medium">
              {client.website ? (
                <a
                  href={
                    client.website.startsWith('http')
                      ? client.website
                      : `https://${client.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                  aria-label={`Visit ${client.website}`}
                >
                  {client.website}
                </a>
              ) : (
                '-'
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-muted-foreground mb-1">Address</div>
            <div className="text-base text-foreground font-medium">
              {client.address || '-'}
            </div>
          </div>
        </div>
      </div>

      {/* ========== PROJECTS LIST ========== */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-4">
          <h2 className="text-lg font-bold text-foreground">Projects</h2>
          <Link
            to={`/clients/${clientId}/projects`}
            className="text-primary hover:underline flex items-center gap-2 whitespace-nowrap"
            aria-label="View all projects"
          >
            <FolderIcon className="w-4 h-4" />
            View All Projects
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No projects for this client yet
            </p>
            {user?.role === 'admin' && (
              <Link
                to="/projects"
                className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                aria-label="Add first project"
              >
                Add First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="block p-4 rounded-lg border border-border hover:bg-muted transition-colors"
                aria-label={`View project ${project.project_name}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {project.project_name || 'Unnamed Project'}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {Array.isArray(project.project_type)
                        ? project.project_type.join(', ')
                        : project.project_type || 'N/A'}{' '}
                      •{' '}
                      {project.start_date
                        ? new Date(project.start_date).toLocaleDateString()
                        : 'No date'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusBadgeColor(
                      project.status
                    )}`}
                  >
                    {project.status || 'Unknown'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ========== MODALS ========== */}
      <AddEditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
        isEditMode={true}
        onSuccess={handleClientUpdated}
      />

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        client={client}
        onSuccess={handleClientDeleted}
      />
    </div>
  );
};

export default ClientDetailsPage;
