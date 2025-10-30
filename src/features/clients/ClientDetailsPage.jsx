// =======================================================================
// FILE: src/features/clients/ClientDetailsPage.jsx (FIXED)
// PURPOSE: Detailed view of a single client with edit capability
// =======================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClientById, getClientProjects } from '../../api/clientApi'; // ✅ UNCOMMENTED
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import AddEditClientModal from './AddEditClientModal';
import DeleteClientModal from './DeleteClientModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

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
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      // Fetch client details
      const clientResponse = await getClientById(clientId);
      console.log('Client Response:', clientResponse);

      // Fetch client projects
      const projectsResponse = await getClientProjects(clientId);
      console.log('Projects Response:', projectsResponse);

      // ✅ FIX: Extract data correctly from API response
      setClient(clientResponse.data);
      setProjects(projectsResponse.data?.projects || []);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error(error.message || 'Failed to load client details');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleClientUpdated = () => {
    fetchClientDetails();
    setIsEditModalOpen(false);
  };

  const handleClientDeleted = () => {
    toast.success('Client deleted successfully');
    navigate('/clients');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="large" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-foreground">Client not found</h3>
        <button
          onClick={() => navigate('/clients')}
          className="mt-4 text-primary hover:underline"
        >
          Go back to clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeftIcon />
          </button>
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
            <BuildingIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{client.clientName}</h1>
            <p className="text-muted-foreground mt-1">{client.contactEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* NEW: Dashboard Button */}
          <button
            onClick={() => navigate(`/clients/${clientId}/dashboard`)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <DashboardIcon />
            View Dashboard
          </button>

          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={`px-4 py-2 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white rounded-lg hover:from-${color}-600 hover:to-${color}-700 transition-all duration-200 flex items-center gap-2 shadow-lg`}
              >
                <EditIcon />
                Edit Client
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <TrashIcon />
                Delete
              </button>
            </>
          )}
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Total Projects</div>
          <div className="text-3xl font-bold text-foreground">{projects.length}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Active Projects</div>
          <div className="text-3xl font-bold text-foreground">
            {projects.filter(p => p.status === 'Active').length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Completed</div>
          <div className="text-3xl font-bold text-foreground">
            {projects.filter(p => p.status === 'Completed').length}
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Contact Person</div>
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
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {client.website}
                </a>
              ) : '-'}
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

      {/* Projects List */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Projects</h2>
          <Link
            to={`/clients/${clientId}/projects`}
            className="text-primary hover:underline flex items-center gap-2"
          >
            <FolderIcon />
            View All Projects
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No projects for this client yet</p>
            {user?.role === 'admin' && (
              <Link
                to="/projects"
                className={`mt-4 inline-block px-4 py-2 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white rounded-lg hover:from-${color}-600 hover:to-${color}-700 transition-all duration-200`}
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
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{project.project_name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.project_type} • {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      project.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                    {project.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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
