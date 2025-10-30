// =======================================================================
// FILE: src/components/DeleteClientModal.jsx (ENHANCED WITH CASCADE WARNING)
// PURPOSE: Modal to delete client with cascade warning
// =======================================================================

import { useState } from 'react';
import { deleteClient } from '../../api/clientApi';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';

const WarningIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const DeleteClientModal = ({ isOpen, onClose, client, onSuccess }) => {
  const { theme } = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    try {
      setDeleting(true);
      console.log('🗑️ Deleting client:', client._id);
      
      const response = await deleteClient(client._id);
      
      console.log('✅ Delete response:', response);
      
      toast.success(
        `Client "${client.clientName}" and all associated data deleted successfully!`,
        { duration: 5000 }
      );
      
      // Show summary if available
      if (response.data) {
        const summary = response.data;
        console.log('📊 Deletion Summary:', summary);
        toast.success(
          `Deleted: ${summary.deletedProjects} projects, ${summary.deletedVulnerabilities} vulnerabilities, ${summary.deletedImages} images`,
          { duration: 6000 }
        );
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Error deleting client:', error);
      toast.error(error.message || 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Client" size="md">
      <div className={`${theme} space-y-6`}>
        {/* Warning Banner */}
        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex-shrink-0">
            <WarningIcon className="text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
              ⚠️ CASCADE DELETE WARNING
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              This action will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
              <li>Client: <strong>{client?.clientName}</strong></li>
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

        {/* Client Info */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Client Name:</span>
              <p className="font-medium text-foreground mt-1">{client?.clientName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Contact Person:</span>
              <p className="font-medium text-foreground mt-1">{client?.contactPerson}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium text-foreground mt-1">{client?.contactEmail}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Projects:</span>
              <p className="font-medium text-foreground mt-1">{client?.projectCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={deleting}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-6 py-2.5 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || confirmText.toLowerCase() !== 'delete'}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
      </div>
    </Modal>
  );
};

export default DeleteClientModal;
