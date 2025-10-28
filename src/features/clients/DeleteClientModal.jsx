// =======================================================================
// FILE: src/features/clients/DeleteClientModal.jsx (NEW)
// PURPOSE: Modal for confirming client deletion with safety checks
// =======================================================================

import { useState } from 'react';
import Modal from '../../components/Modal';
// import { deleteClient } from '../../api/clientApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const DeleteClientModal = ({ isOpen, onClose, onDeleted, client }) => {
  const { theme, color } = useTheme();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!client) return;

    setDeleting(true);
    try {
      await deleteClient(client._id);
      toast.success(`Client "${client.clientName}" has been deleted successfully.`);
      onDeleted();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error.message || 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  if (!client) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Client"
      maxWidth="2xl"
    >
      <div className="p-6">
        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                This action cannot be undone
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                All projects and data associated with this client will remain but will no longer be linked to this client record.
              </p>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="bg-muted/30 border border-border rounded-lg p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <BuildingIcon className="text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Client Name</p>
              <p className="text-base font-semibold text-foreground">{client.clientName}</p>
            </div>
          </div>

          {client.email && (
            <div className="flex items-start gap-3">
              <MailIcon className="text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-semibold text-foreground">{client.email}</p>
              </div>
            </div>
          )}

          {client.location && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-muted-foreground mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-base font-semibold text-foreground">{client.location}</p>
              </div>
            </div>
          )}

          {client.projectCount > 0 && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-muted-foreground mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <div>
                <p className="text-sm text-muted-foreground">Associated Projects</p>
                <p className="text-base font-semibold text-foreground">{client.projectCount} project(s)</p>
              </div>
            </div>
          )}
        </div>

        {/* Warning Note */}
        {client.projectCount > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              ⚠️ <strong>Note:</strong> This client has {client.projectCount} associated project(s). Consider reassigning or archiving projects before deletion.
            </p>
          </div>
        )}

        {/* Deletion Consequences */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            This will permanently remove:
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Client contact information and details
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Client relationship history
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Link between client and their projects
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 border border-input rounded-lg hover:bg-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon />
                Delete Client
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteClientModal;
