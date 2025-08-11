// =======================================================================
// FILE: src/features/admin/DeleteUserModal.jsx (UPDATED)
// PURPOSE: Modal for confirming user deletion with theme support and enhanced UI.
// =======================================================================
import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteUser } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
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

const DeleteUserModal = ({ user, onClose, onUserDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, color } = useTheme();

  const getRoleBadgeColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'pmo': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'tester': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'client': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await deleteUser(user._id);
      toast.success(`User "${user.name}" has been deleted successfully.`);
      onUserDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={!!user}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrashIcon className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">Delete User</h3>
              <p className="text-sm text-muted-foreground">This action cannot be undone</p>
            </div>
          </div>
        }
        size="md"
        showCloseButton={!isDeleting}
      >
        <div className="text-center py-6">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertTriangleIcon className="text-red-600" />
          </div>

          {/* User Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-card-foreground mb-2">
              Are you sure you want to delete this user?
            </h4>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="text-left space-y-3">
                <div className="flex items-center gap-2">
                  <UserIcon className="text-primary" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Name:</span>
                    <p className="font-semibold text-card-foreground">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MailIcon className="text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <p className="text-card-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Role:</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">This will permanently remove:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>User account and login credentials</li>
                <li>All user preferences and settings</li>
                <li>Access to assigned projects and data</li>
                <li>User activity history and logs</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-2.5 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon />
                  Delete User
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteUserModal;
