// =======================================================================
// FILE: src/features/clients/ClientDetailsPage.jsx (NEW)
// PURPOSE: Detailed view of a single client with edit capability
// =======================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// import { getClientById, getClientProjects } from '../../api/clientApi';
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
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      const [clientResponse, projectsResponse] = await Promise.all([
        getClientById(clientId),
        getClientProjects(clientId)
      ]);

      // ✅ Extract data from responses
      setClient(clientResponse.data || clientResponse);
      setProjects(projectsResponse.data || projectsResponse);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Failed to load client details');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Client not found</p>
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent border border-border rounded-lg p-6">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
        >
          <ArrowLeftIcon />
          Back to Clients
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <BuildingIcon className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {client.clientName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="hover:text-primary flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.email}
                  </a>
                )}
                {client.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {client.location}
                  </span>
                )}
                {client.createdAt && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Added {new Date(client.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors"
              >
                <EditIcon />
                Edit Client
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                <TrashIcon />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">{projects.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FolderIcon className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {projects.filter(p => p.status === 'Active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {projects.filter(p => p.status === 'Completed').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            <Link
              to={`/clients/${clientId}/projects`}
              className="text-sm text-primary hover:underline"
            >
              View All →
            </Link>
          </div>
        </div>

        <div className="divide-y divide-border">
          {projects.length === 0 ? (
            <div className="p-12 text-center">
              <FolderIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No projects for this client yet</p>
              {user?.role === 'admin' && (
                <Link
                  to="/projects/add"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Add First Project
                </Link>
              )}
            </div>
          ) : (
            projects.slice(0, 5).map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="flex items-center justify-between p-4 hover:bg-accent transition-colors group"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {project.project_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.project_type} • {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No date'}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    project.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                  {project.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <AddEditClientModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleClientUpdated}
          client={client}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteClientModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={handleClientDeleted}
          client={{ ...client, projectCount: projects.length }}
        />
      )}
    </div>
  );
};

export default ClientDetailsPage;
