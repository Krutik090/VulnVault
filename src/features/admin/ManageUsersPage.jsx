// =======================================================================
// FILE: src/features/admin/ManageUsersPage.jsx (UPDATED)
// PURPOSE: The main page for viewing and managing all users with theme support.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { getAllUsers } from '../../api/adminApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import AddUserModal from './AddUserModal';
import ResetPasswordModal from './ResetPasswordModal';
import DeleteUserModal from './DeleteUserModal';
import DataTable from '../../components/DataTable';
import SearchableDropdown from '../../components/SearchableDropdown';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const AddIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ResetPasswordIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-6-3-6-6s3-6 6-6a6 6 0 016 6zm-4 4v4h-4v-4h4z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  
  const { theme, color } = useTheme();
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Could not fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserAdded = () => {
    setIsAddModalOpen(false);
    fetchUsers();
  };

  const handleUserDeleted = () => {
    setUserToDelete(null);
    fetchUsers();
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400',
      'tester': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400',
      'client': 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return colors[role] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Role filter options (PMO removed)
  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'tester', label: 'Tester' },
    { value: 'client', label: 'Client' }
  ];

  // Filter users based on role
  const filteredUsers = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter(user => user.role === roleFilter);
  }, [users, roleFilter]);

  // Statistics (PMO removed)
  const statistics = useMemo(() => {
    const total = users.length;
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      admin: roleCounts['admin'] || 0,
      tester: roleCounts['tester'] || 0,
      client: roleCounts['client'] || 0
    };
  }, [users]);

  const columns = useMemo(() => [
    { 
      accessorKey: 'name', 
      header: 'Name',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="text-primary" />
          <span className="font-medium text-card-foreground">{getValue() || 'Unknown'}</span>
        </div>
      )
    },
    { 
      accessorKey: 'email', 
      header: 'Email',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <MailIcon className="text-muted-foreground" />
          <span className="text-card-foreground">{getValue() || 'No email'}</span>
        </div>
      )
    },
    { 
      accessorKey: 'role', 
      header: 'Role',
      cell: ({ getValue }) => {
        const role = getValue();
        return (
          <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border capitalize ${getRoleBadgeColor(role)}`}>
            <ShieldIcon className="w-3 h-3 mr-1" />
            {role || 'Unknown'}
          </div>
        );
      }
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Created',
      cell: ({ getValue }) => {
        const date = getValue();
        if (!date) return <span className="text-muted-foreground">Unknown</span>;
        
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-muted-foreground" />
            <span className="text-sm text-card-foreground">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        );
      }
    },
    { 
      id: 'actions', 
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = user._id === currentUser?._id;
        
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setUserToEdit(user)}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Reset Password"
            >
              <ResetPasswordIcon />
            </button>
            {!isCurrentUser && (
              <button
                onClick={() => setUserToDelete(user)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete User"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        );
      }
    },
  ], [currentUser]);

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <UsersIcon className="text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">Manage Users</h1>
                <p className="text-muted-foreground mt-1">
                  Add, remove, or edit users in the system
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <AddIcon />
              Add User
            </button>
          </div>
        </div>

        {/* Statistics Cards (PMO removed) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-xl font-bold text-card-foreground">{statistics.total}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-xl font-bold text-red-600">{statistics.admin}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Testers</p>
              <p className="text-xl font-bold text-green-600">{statistics.tester}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Clients</p>
              <p className="text-xl font-bold text-purple-600">{statistics.client}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-64">
              <SearchableDropdown
                label="Filter by Role"
                options={roleOptions}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="All roles"
                noOptionsMessage="No roles found"
              />
            </div>
            {roleFilter && (
              <div className="flex items-end">
                <button
                  onClick={() => setRoleFilter('')}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-input rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <FilterIcon />
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <Spinner message="Loading users..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                {users.length === 0 ? 'No Users Found' : 'No Results Found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {users.length === 0 
                  ? 'No users have been created yet. Add the first user to get started.'
                  : 'No users match your current filter criteria. Try adjusting your filters.'
                }
              </p>
              {users.length === 0 && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <AddIcon />
                  Add First User
                </button>
              )}
            </div>
          ) : (
            <DataTable 
              data={filteredUsers} 
              columns={columns} 
              title={`System Users${roleFilter ? ' (Filtered)' : ''}`}
            />
          )}
        </div>

        {/* Filter Results Summary */}
        {roleFilter && filteredUsers.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
              • Role: {roleOptions.find(r => r.value === roleFilter)?.label}
            </p>
          </div>
        )}

        {/* System Information (PMO removed from guidelines) */}
        <div className="mt-8 p-6 bg-muted/30 border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <ShieldIcon />
            User Management Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-card-foreground mb-2">User Roles</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Admin:</strong> Full system access and user management</li>
                <li><strong>Tester:</strong> Perform penetration tests and create reports</li>
                <li><strong>Client:</strong> View-only access to assigned projects</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Best Practices</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Use strong passwords for all user accounts</li>
                <li>Regularly review and update user permissions</li>
                <li>Remove inactive users to maintain security</li>
                <li>Monitor user activity and access patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onUserAdded={handleUserAdded}
      />
      
      <ResetPasswordModal 
        user={userToEdit} 
        onClose={() => setUserToEdit(null)}
      />
      
      <DeleteUserModal 
        user={userToDelete} 
        onClose={() => setUserToDelete(null)} 
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
};

export default ManageUsersPage;
