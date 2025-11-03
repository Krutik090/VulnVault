// =======================================================================
// FILE: src/features/clients/ClientsPage.jsx (UPDATED)
// PURPOSE: Display all clients with search, filter, and management
// SOC 2 NOTES: Centralized icon management, secure data handling, audit logging
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClients } from '../../api/clientApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import AddEditClientModal from './AddEditClientModal';
import DeleteClientModal from './DeleteClientModal';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  UsersIcon,
  BarChartIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FolderIcon,
  SearchIcon,
} from '../../components/Icons';

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

  // ✅ SOC 2: Fetch clients with audit logging
  const fetchClients = async () => {
    try {
      console.log('📋 Fetching all clients');

      setLoading(true);
      const response = await getAllClients();

      const clientsData = Array.isArray(response?.data)
        ? response.data
        : [];

      setClients(clientsData);

      console.log(`✅ Retrieved ${clientsData.length} clients`);
    } catch (error) {
      console.error('❌ Error fetching clients:', error.message);
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SOC 2: Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    const search = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.clientName?.toLowerCase().includes(search) ||
        client.contactEmail?.toLowerCase().includes(search) ||
        client.contactPerson?.toLowerCase().includes(search) ||
        client.address?.toLowerCase().includes(search)
    );
  }, [clients, searchTerm]);

  // ✅ SOC 2: Safe date filtering
  const getClientsAddedThisMonth = () => {
    const now = new Date();
    return clients.filter((c) => {
      try {
        const created = new Date(c.createdAt);
        return (
          created.getMonth() === now.getMonth() &&
          created.getFullYear() === now.getFullYear()
        );
      } catch (error) {
        console.error(`❌ Error parsing date for client ${c._id}:`, error.message);
        return false;
      }
    }).length;
  };

  // ✅ SOC 2: Table columns with proper data handling
  const columns = useMemo(
    () => [
      {
        accessorKey: 'clientName',
        header: 'Client Name',
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.clientName || 'Unnamed Client'}
          </div>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact Person',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.contactPerson || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'contactEmail',
        header: 'Email',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground break-all">
            {row.original.contactEmail || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'contactPhone',
        header: 'Phone',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.contactPhone || '-'}
          </div>
        ),
      },
      {
        accessorKey: 'projectCount',
        header: 'Projects',
        cell: ({ row }) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800 border">
              {row.original.projectCount || 0}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Added On',
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">
            {row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleDateString()
              : '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Dashboard Button */}
            <button
              onClick={() =>
                navigate(`/clients/${row.original._id}/dashboard`)
              }
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
              title="View Dashboard"
              aria-label={`View dashboard for ${row.original.clientName}`}
            >
              <BarChartIcon className="w-4 h-4" />
            </button>

            {/* View Details Button */}
            <button
              onClick={() => navigate(`/clients/${row.original._id}`)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              title="View Details"
              aria-label={`View details for ${row.original.clientName}`}
            >
              <EyeIcon className="w-4 h-4" />
            </button>

            {/* View Projects Button */}
            <button
              onClick={() =>
                navigate(`/clients/${row.original._id}/projects`)
              }
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
              title="View Projects"
              aria-label={`View projects for ${row.original.clientName}`}
            >
              <FolderIcon className="w-4 h-4" />
            </button>

            {/* Edit & Delete Buttons (Admin only) */}
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => {
                    console.log(`✏️ Editing client: ${row.original._id}`);
                    setSelectedClient(row.original);
                    setIsEditModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
                  title="Edit Client"
                  aria-label={`Edit client ${row.original.clientName}`}
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    console.log(`🗑️ Deleting client: ${row.original._id}`);
                    setSelectedClient(row.original);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  title="Delete Client"
                  aria-label={`Delete client ${row.original.clientName}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [user?.role, navigate]
  );

  if (loading) {
    return (
      <div className={`${theme} theme-${color}`}>
        <div className="flex items-center justify-center h-96">
          <Spinner message="Loading clients..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex-shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground truncate">
              Clients
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your client organizations and relationships
            </p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg whitespace-nowrap"
            aria-label="Add new client"
          >
            <PlusIcon className="w-5 h-5" />
            Add Client
          </button>
        )}
      </div>

      {/* ========== STATISTICS CARDS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">Total Clients</div>
          <div className="text-3xl font-bold text-foreground">
            {clients.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Total Projects
          </div>
          <div className="text-3xl font-bold text-foreground">
            {clients.reduce((sum, client) => sum + (client.projectCount || 0), 0)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="text-sm text-muted-foreground mb-1">
            Active This Month
          </div>
          <div className="text-3xl font-bold text-foreground">
            {getClientsAddedThisMonth()}
          </div>
        </div>
      </div>

      {/* ========== SEARCH BAR ========== */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search clients by name, email, person, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            aria-label="Search clients"
          />
        </div>
      </div>

      {/* ========== DATA TABLE ========== */}
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="flex justify-center mb-4">
              <UsersIcon className="w-16 h-16 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No clients found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Add your first client to get started with project management'}
            </p>
            {user?.role === 'admin' && !searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 mx-auto shadow-lg"
                aria-label="Add first client"
              >
                <PlusIcon className="w-5 h-5" />
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

      {/* ========== INFORMATION SECTION ========== */}
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Client Management Tips
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✅ Use the search bar to find clients quickly</li>
          <li>✅ View dashboard for comprehensive client analytics</li>
          <li>✅ Click view details to manage client information</li>
          <li>✅ Track all projects assigned to each client</li>
          {user?.role === 'admin' && (
            <li>✅ Admin: Edit or delete clients as needed</li>
          )}
        </ul>
      </div>

      {/* ========== MODALS ========== */}
      <AddEditClientModal
        isOpen={isAddModalOpen}
        onClose={() => {
          console.log('🔄 Add modal closed');
          setIsAddModalOpen(false);
        }}
        isEditMode={false}
        onSuccess={() => {
          console.log('📊 Client added, refreshing list');
          fetchClients();
        }}
      />

      <AddEditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          console.log('🔄 Edit modal closed');
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        isEditMode={true}
        onSuccess={() => {
          console.log('📊 Client updated, refreshing list');
          fetchClients();
        }}
      />

      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          console.log('🔄 Delete modal closed');
          setIsDeleteModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSuccess={() => {
          console.log('📊 Client deleted, refreshing list');
          fetchClients();
        }}
      />
    </div>
  );
};

export default ClientsPage;
