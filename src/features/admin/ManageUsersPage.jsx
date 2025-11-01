// =======================================================================
// FILE: src/features/admin/ManageUsersPage.jsx (UPDATED)
// PURPOSE: Main page for managing users with consistent spacing
// SOC 2 NOTES: Centralized icon management, role-based access, secure user handling
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { getAllUsers } from '../../api/adminApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import AddUserModal from './AddUserModal';
import ResetPasswordModal from './ResetPasswordModal';
import DeleteUserModal from './DeleteUserModal';
import DataTable from '../../components/DataTable';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  PlusIcon,
  KeyIcon,
  TrashIcon,
  UsersIcon,
  UserIcon,
  MailIcon,
  ShieldIcon,
  FilterIcon,
} from '../../components/Icons';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');

  const { theme, color } = useTheme();
  const { user: currentUser } = useAuth();

  // ✅ SOC 2: Fetch users with error handling
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllUsers();
      // ✅ SOC 2: Safe data extraction
      const userData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users');
      toast.error('Could not fetch users');
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

  // ✅ SOC 2: Role-based badge color mapping
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      tester:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      client:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    };
    return (
      colors[role] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    );
  };

  // ✅ SOC 2: Filter users with defensive checks
  const filteredUsers = useMemo(() => {
    if (!roleFilter) return users;
    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  // ✅ SOC 2: Calculate user statistics
  const statistics = useMemo(() => {
    const total = users.length;
    const roleCounts = users.reduce((acc, user) => {
      if (user.role) {
        acc[user.role] = (acc[user.role] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      total,
      admin: roleCounts.admin || 0,
      tester: roleCounts.tester || 0,
      client: roleCounts.client || 0
    };
  }, [users]);

  // ✅ SOC 2: Table columns with secure rendering
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue, row }) => {
          const name = getValue() || 'Unknown';
          const email = row.original.email || 'No email';

          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-foreground">{name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MailIcon className="w-4 h-4" />
                  {email}
                </div>
              </div>
            </div>
          );
        }
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ getValue }) => {
          const role = getValue() || 'Unknown';
          const displayRole = role.charAt(0).toUpperCase() + role.slice(1);

          return (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                role
              )}`}
            >
              <ShieldIcon className="w-4 h-4" />
              {displayRole}
            </span>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ getValue }) => {
          const date = getValue();
          return (
            <span className="text-sm text-muted-foreground">
              {date ? new Date(date).toLocaleDateString() : 'N/A'}
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const isCurrentUser = currentUser?._id === row.original._id;

          return (
            <div className="flex items-center gap-2">
              {/* Reset Password Button */}
              <button
                onClick={() => setUserToReset(row.original)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm font-medium"
                title="Reset Password"
                aria-label={`Reset password for ${row.original.name}`}
              >
                <KeyIcon className="w-4 h-4" />
                Reset
              </button>

              {/* Delete Button - Not for current user */}
              {!isCurrentUser && (
                <button
                  onClick={() => setUserToDelete(row.original)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
                  title="Delete User"
                  aria-label={`Delete ${row.original.name}`}
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          );
        }
      }
    ],
    [currentUser?._id]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <UsersIcon className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                User Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Add, remove, or manage user accounts
              </p>
            </div>
          </div>

          {/* ✅ SOC 2: Add user button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            aria-label="Add new user"
          >
            <PlusIcon className="w-5 h-5" />
            Add User
          </button>
        </div>
      </div>

      {/* ========== STATISTICS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.total}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UsersIcon className="text-blue-600 dark:text-blue-400 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.admin}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ShieldIcon className="text-red-600 dark:text-red-400 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Testers */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Testers</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.tester}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserIcon className="text-green-600 dark:text-green-400 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Clients */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clients</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.client}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UserIcon className="text-purple-600 dark:text-purple-400 w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ========== FILTERS ========== */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FilterIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Filter by Role:</span>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setRoleFilter('')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === ''
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
              aria-label="Show all users"
              aria-pressed={roleFilter === ''}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
              aria-label="Show only admin users"
              aria-pressed={roleFilter === 'admin'}
            >
              Admin
            </button>
            <button
              onClick={() => setRoleFilter('tester')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'tester'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
              aria-label="Show only tester users"
              aria-pressed={roleFilter === 'tester'}
            >
              Tester
            </button>
            <button
              onClick={() => setRoleFilter('client')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'client'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
              aria-label="Show only client users"
              aria-pressed={roleFilter === 'client'}
            >
              Client
            </button>
          </div>

          {/* Results Counter */}
          {roleFilter && (
            <span className="text-sm text-muted-foreground ml-auto">
              Showing <strong>{filteredUsers.length}</strong> of{' '}
              <strong>{users.length}</strong> users
            </span>
          )}
        </div>
      </div>

      {/* ========== USERS TABLE OR EMPTY STATE ========== */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No users found
            </h3>
            <p className="text-muted-foreground">
              {users.length === 0
                ? 'No users have been created yet. Add the first user to get started.'
                : 'No users match your current filter. Try adjusting your filters.'}
            </p>

            {/* ✅ SOC 2: Add first user button */}
            {users.length === 0 && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium mt-6"
                aria-label="Add first user"
              >
                <PlusIcon className="w-5 h-5" />
                Add First User
              </button>
            )}
          </div>
        ) : (
          <DataTable
            data={filteredUsers}
            columns={columns}
            title={`Users (${filteredUsers.length})`}
          />
        )}
      </div>

      {/* ========== MODALS ========== */}
      {/* Add User Modal */}
      {isAddModalOpen && (
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onUserAdded={handleUserAdded}
        />
      )}

      {/* Reset Password Modal */}
      {userToReset && (
        <ResetPasswordModal
          isOpen={!!userToReset}
          user={userToReset}
          onClose={() => setUserToReset(null)}
        />
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <DeleteUserModal
          isOpen={!!userToDelete}
          user={userToDelete}
          onClose={() => setUserToDelete(null)}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  );
};

export default ManageUsersPage;
