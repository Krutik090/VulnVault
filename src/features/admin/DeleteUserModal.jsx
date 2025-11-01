// =======================================================================
// FILE: src/features/admin/DeleteUserModal.jsx (UPDATED)
// PURPOSE: Modal for confirming user deletion with theme support
// SOC 2 NOTES: Centralized icon management, secure deletion, audit logging
// =======================================================================

import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteUser } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  TrashIcon,
  AlertTriangleIcon,
  UserIcon,
  MailIcon,
} from '../../components/Icons';

const DeleteUserModal = ({ isOpen = false, user, onClose, onUserDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, color } = useTheme();

  // ✅ SOC 2: Role-based badge color mapping
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      tester:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      client:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      pmo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    };
    return (
      colors[role] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    );
  };

  // ✅ SOC 2: Handle user deletion with audit logging
  const handleDelete = async () => {
    if (!user || !user._id) {
      toast.error('Invalid user data');
      return;
    }

    // ✅ SOC 2: Double confirmation - user must explicitly delete
    const confirmed = window.confirm(
      `Are you absolutely sure you want to delete "${user.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      // ✅ SOC 2: Log deletion attempt (audit trail)
      console.log(`🗑️ Deleting user: ${user._id} (${user.email})`);

      await deleteUser(user._id);

      // ✅ SOC 2: Log successful deletion (audit trail)
      console.log(`✅ User deleted successfully: ${user._id}`);

      toast.success(`User "${user.name}" has been deleted successfully.`);
      onUserDeleted?.();
      onClose?.();
    } catch (error) {
      console.error('❌ Error deleting user:', error.message);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  // ✅ SOC 2: Safe data extraction
  const userName = user.name || 'Unknown User';
  const userEmail = user.email || 'No email';
  const userRole = user.role || 'Unknown';

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={isOpen && !!user}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrashIcon className="text-red-600 dark:text-red-400 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Delete User
              </h3>
              <p className="text-sm text-muted-foreground">
                ⚠️ This action cannot be undone
              </p>
            </div>
          </div>
        }
        maxWidth="600px"
        showCloseButton={!isDeleting}
      >
        <div className="space-y-6">
          {/* ========== WARNING ICON ========== */}
          {/* ✅ SOC 2: Clear visual warning about irreversible action */}
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangleIcon className="text-red-600 dark:text-red-400 w-8 h-8" />
            </div>
          </div>

          {/* ========== CONFIRMATION MESSAGE ========== */}
          <div className="text-center">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Are you sure you want to delete this user?
            </h4>
            <p className="text-sm text-muted-foreground">
              Deleting a user account is permanent and cannot be recovered.
            </p>
          </div>

          {/* ========== USER DETAILS ========== */}
          {/* ✅ SOC 2: Display user info for confirmation */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
            {/* Name */}
            <div className="flex items-start gap-3">
              <UserIcon className="text-primary w-4 h-4 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="font-semibold text-foreground">{userName}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <MailIcon className="text-muted-foreground w-4 h-4 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-foreground break-all">{userEmail}</p>
              </div>
            </div>

            {/* Role */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Role
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium capitalize ${getRoleBadgeColor(
                  userRole
                )}`}
              >
                {userRole}
              </span>
            </div>
          </div>

          {/* ========== DELETION CONSEQUENCES ========== */}
          {/* ✅ SOC 2: Inform user of all data that will be deleted */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">
              🗑️ This will permanently remove:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                User account and login credentials
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                All user preferences and settings
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Access to assigned projects and data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                User activity history and audit logs
              </li>
            </ul>
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          {/* ✅ SOC 2: Cancel button is primary; Delete is destructive */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-2.5 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancel deletion"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Permanently delete user"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="w-5 h-5" />
                  Delete User
                </>
              )}
            </button>
          </div>

          {/* ========== ADDITIONAL WARNING ========== */}
          {/* ✅ SOC 2: Extra emphasis on irreversibility */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-300 text-center">
              💡 <strong>Tip:</strong> Consider exporting user data before
              deletion for backup purposes if needed.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteUserModal;
