// =======================================================================
// FILE: src/features/vulnerabilities/DeleteVulnModal.jsx (UPDATED)
// PURPOSE: Modal for confirming vulnerability deletion with theme support.
// =======================================================================
import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteVulnerability } from '../../api/vulnerabilityApi';
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

const DeleteVulnModal = ({ vuln, onClose, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, color } = useTheme();

  const handleDelete = async () => {
    if (!vuln) return;

    setIsDeleting(true);
    try {
      await deleteVulnerability(vuln._id);
      toast.success(`Vulnerability "${vuln.vulnName}" has been deleted successfully.`);
      onDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
      toast.error(error.message || 'Failed to delete vulnerability');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!vuln) return null;

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={!!vuln}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrashIcon className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">Delete Vulnerability</h3>
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

          {/* Vulnerability Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-card-foreground mb-2">
              Are you sure you want to delete this vulnerability?
            </h4>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="text-left space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Name:</span>
                  <p className="font-semibold text-card-foreground">{vuln.vulnName}</p>
                </div>
                
                {vuln.vulnType && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Type:</span>
                    <p className="text-card-foreground">{vuln.vulnType}</p>
                  </div>
                )}
                
                {vuln.severity && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Severity:</span>
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ml-2
                      ${vuln.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        vuln.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        vuln.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        vuln.severity === 'Low' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'}
                    `}>
                      {vuln.severity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              This will permanently remove the vulnerability from the database. 
              All associated data will be lost and cannot be recovered.
            </p>
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
              className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon />
                  Delete Vulnerability
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteVulnModal;
