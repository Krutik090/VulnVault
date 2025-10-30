// =======================================================================
// FILE: src/features/clients/ClientsPage.jsx (UPDATED)
// PURPOSE: Display all clients with search, filter, and management
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
  const navigate = useNavigate();

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
      setClients(response.data || []);
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
      client.contactEmail?.toLowerCase().includes(search) ||
      client.contactPerson?.toLowerCase().includes(search) ||
      client.address?.toLowerCase().includes(search)
    );
  }, [clients, searchTerm]);

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'clientName',
      header: 'Client Name',
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {row.original.clientName}
        </div>
      )
    },
    {
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.contactPerson}
        </div>
      )
    },
    {
      accessorKey: 'contactEmail',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.contactEmail}
        </div>
      )
    },
    {
      accessorKey: 'contactPhone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.contactPhone || '-'}
        </div>
      )
    },
    {
      accessorKey: 'projectCount',
      header: 'Projects',
      cell: ({ row }) => (
        <div className="text-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {row.original.projectCount || 0}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: 'Added On',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : '-'
          }
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {/* Dashboard Button - NEW */}
          <button
            onClick={() => navigate(`/clients/${row.original._id}/dashboard`)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-purple-600 dark:text-purple-400"
            title="View Dashboard"
          >
            <DashboardIcon />
          </button>

          {/* View Details Button */}
          <button
            onClick={() => navigate(`/clients/${row.original._id}`)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-blue-600 dark:text-blue-400"
            title="View Details"
          >
            <EyeIcon />
          </button>

          {/* View Projects Button */}
          <button
            onClick={() => navigate(`/clients/${row.original._id}/projects`)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-green-600 dark:text-green-400"
            title="View Projects"
          >
            <FolderIcon />
          </button>

          {/* Edit & Delete Buttons (Admin only) */}
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  setSelectedClient(row.original);
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-amber-600 dark:text-amber-400"
                title="Edit Client"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => {
                  setSelectedClient(row.original);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-red-600 dark:text-red-400"
                title="Delete Client"
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      )
    }

  ], [user, navigate]);

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
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <UsersIcon />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client organizations and relationships
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`px-4 py-2 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white rounded-lg hover:from-${color}-600 hover:to-${color}-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl`}
          >
            <PlusIcon />
            Add Client
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Total Clients</div>
          <div className="text-3xl font-bold text-foreground">
            {clients.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Total Projects</div>
          <div className="text-3xl font-bold text-foreground">
            {clients.reduce((sum, client) => sum + (client.projectCount || 0), 0)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Active This Month</div>
          <div className="text-3xl font-bold text-foreground">
            {clients.filter(c => {
              const created = new Date(c.createdAt);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search clients by name, email, person, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No clients found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Add your first client to get started with project management'
              }
            </p>
            {user?.role === 'admin' && !searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className={`mt-4 px-4 py-2 bg-gradient-to-r from-${color}-500 to-${color}-600 text-white rounded-lg hover:from-${color}-600 hover:to-${color}-700 transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg`}
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
            title="Client Management"
            searchable={false}
            exportable={true}
            fileName="clients"
          />
        )}
      </div>

      {/* Modals */}
      <AddEditClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        isEditMode={false}
        onSuccess={fetchClients}
      />

      <AddEditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        isEditMode={true}
        onSuccess={fetchClients}
      />

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSuccess={fetchClients}
      />
    </div>
  );
};

export default ClientsPage;
