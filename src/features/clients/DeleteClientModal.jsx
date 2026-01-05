// =======================================================================
// FILE: src/features/clients/DeleteClientModal.jsx (UPDATED)
// PURPOSE: Modal to delete client with cascade warning
// SOC 2 NOTES: Centralized icon management, audit logging, secure deletion
// =======================================================================

import { useState } from 'react';
import { deleteClient } from '../../api/clientApi';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import { AlertTriangleIcon } from '../../components/Icons';

const DeleteClientModal = ({ isOpen, onClose, client, onSuccess }) => {
  const { theme, color } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // ✅ SOC 2: Safe deletion handler with audit logging
  const handleDelete = async () => {
    // ✅ SOC 2: Validate confirmation text
    if (confirmText.toLowerCase() !== 'delete') {
      console.warn('❌ Invalid confirmation text provided');
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setDeleting(true);

      console.log(`🗑️ Initiating client deletion: ${client._id}`);
      console.log(`📋 Client: ${client.clientName}`);

      const response = await deleteClient(client._id);

      console.log('✅ Delete response received:', response);

      // ✅ SOC 2: Safe data extraction
      const successMessage = `Client "${client.clientName || 'Unknown'}" and all associated data deleted successfully!`;

      toast.success(successMessage, { duration: 5000 });

      console.log(`✅ Deletion successful for client: ${client._id}`);

      // Show summary if available
      if (response?.data) {
        const summary = response.data;

        console.log('📊 Deletion Summary:', summary);

        const summaryMessage = `Deleted: ${summary.deletedProjects || 0} projects, ${summary.deletedVulnerabilities || 0} vulnerabilities, ${summary.deletedImages || 0} images`;

        toast.success(summaryMessage, { duration: 6000 });
      }

      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('❌ Error deleting client:', error.message);

      toast.error(error.message || 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  // ✅ SOC 2: Reset form on modal close
  const handleClose = () => {
    setConfirmText('');
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Client"
      size="md"
    >
      <div className={`${theme} space-y-6`}>
        {/* ========== WARNING BANNER ========== */}
        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              ⚠️ CASCADE DELETE WARNING
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-2">
              This action will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>
                Client:{' '}
                <strong>{client?.clientName || 'Unknown'}</strong>
              </li>
              <li>All associated projects</li>
              <li>All vulnerabilities in those projects</li>
              <li>All uploaded images/files</li>
              <li>All project configurations</li>
            </ul>
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mt-3">
              This action CANNOT be undone!
            </p>
          </div>
        </div>

        {/* ========== CLIENT INFO ========== */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Client Name
              </span>
              <p className="font-medium text-foreground mt-1 break-all">
                {client?.clientName || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Contact Person
              </span>
              <p className="font-medium text-foreground mt-1 break-all">
                {client?.contactPerson || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Email
              </span>
              <p className="font-medium text-foreground mt-1 break-all">
                {client?.contactEmail || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                Projects
              </span>
              <p className="font-medium text-foreground mt-1">
                {client?.projectCount || 0}
              </p>
            </div>
          </div>
        </div>

        {/* ========== CONFIRMATION INPUT ========== */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type <span className="font-bold text-red-600">DELETE</span> to
            confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 transition-colors"
            disabled={deleting}
            aria-label="Type DELETE to confirm deletion"
          />
          <p className="text-xs text-muted-foreground mt-2">
            This is a required safety check to prevent accidental deletion.
          </p>
        </div>

        {/* ========== ACTIONS ========== */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border flex-col sm:flex-row">
          <button
            onClick={handleClose}
            disabled={deleting}
            className="px-6 py-2.5 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || confirmText.toLowerCase() !== 'delete'}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            aria-label="Delete client permanently"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Permanently</span>
            )}
          </button>
        </div>

        {/* ========== SAFETY NOTE ========== */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            💡 <strong>Security Tip:</strong> All associated data will be
            permanently removed from the system. This action is logged for
            compliance and audit purposes.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteClientModal;
