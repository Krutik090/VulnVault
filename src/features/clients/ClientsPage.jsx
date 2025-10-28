// =======================================================================
// FILE: src/features/clients/ClientsPage.jsx (NEW)
// PURPOSE: Display all clients with search, filter, and management
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllClients } from '../../api/clientApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import AddEditClientModal from './AddEditClientModal';
import DeleteClientModal from './DeleteClientModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClientsPage = () => {
  const { user } = useAuth();
  const { theme, color } = useTheme();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await getAllClients();
      const clientData = response.data || []; // ✅ Extract data from response
      setClients(clientData);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };


  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    const search = searchTerm.toLowerCase();
    return clients.filter(client =>
      client.clientName?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search) ||
      client.location?.toLowerCase().includes(search)
    );
  }, [clients, searchTerm]);

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'clientName',
      header: 'Client Name',
      cell: ({ row }) => (
        <Link
          to={`/clients/${row.original._id}`}
          className="font-medium text-primary hover:text-primary/80 hover:underline"
        >
          {row.original.clientName}
        </Link>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="text-muted-foreground hover:text-primary"
        >
          {row.original.email}
        </a>
      )
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.location || '-'}
        </span>
      )
    },
    {
      accessorKey: 'projectCount',
      header: 'Projects',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {row.original.projectCount || 0}
        </span>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Added On',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : '-'
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
            to={`/clients/${row.original._id}`}
            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="View Details"
          >
            <EyeIcon />
          </Link>
          <Link
            to={`/clients/${row.original._id}/projects`}
            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            title="View Projects"
          >
            <FolderIcon />
          </Link>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => handleEditClient(row.original)}
                className="p-2 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
                title="Edit"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => handleDeleteClient(row.original)}
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

  const handleEditClient = (client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleDeleteClient = (client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleClientSaved = () => {
    fetchClients();
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

  const handleClientDeleted = () => {
    fetchClients();
    setIsDeleteModalOpen(false);
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>

      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <UsersIcon className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your client organizations and relationships
              </p>
            </div>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <PlusIcon />
              Add New Client
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
              <p className="text-3xl font-bold text-foreground mt-2">{clients.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UsersIcon className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {clients.reduce((sum, client) => sum + (client.projectCount || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FolderIcon className="text-purple-600 dark:text-purple-400 w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active This Month</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {clients.filter(c => {
                  const created = new Date(c.createdAt);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients by name, email, or location..."
            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Add your first client to get started with project management'
            }
          </p>
          {user?.role === 'admin' && !searchTerm && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <PlusIcon />
              Add First Client
            </button>
          )}
        </div>
      ) : (
        <DataTable
          data={filteredClients}
          columns={columns}
          title="All Clients"
        />
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddEditClientModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleClientSaved}
        />
      )}

      {isEditModalOpen && selectedClient && (
        <AddEditClientModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClient(null);
          }}
          onSave={handleClientSaved}
          client={selectedClient}
        />
      )}

      {isDeleteModalOpen && selectedClient && (
        <DeleteClientModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedClient(null);
          }}
          onDeleted={handleClientDeleted}
          client={selectedClient}
        />
      )}
    </div>
  );
};

export default ClientsPage;
