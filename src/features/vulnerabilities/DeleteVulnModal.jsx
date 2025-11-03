// =======================================================================
// FILE: src/features/vulnerabilities/DeleteVulnModal.jsx (UPDATED)
// PURPOSE: Modal for confirming vulnerability deletion with theme support
// SOC 2 NOTES: Centralized icon management, secure deletion, audit logging
// =======================================================================

import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteVulnerability } from '../../api/vulnerabilityApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  TrashIcon,
  AlertTriangleIcon,
} from '../../components/Icons';

const DeleteVulnModal = ({ vuln, onClose, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, color } = useTheme();

  // ✅ SOC 2: Delete vulnerability with audit logging
  const handleDelete = async () => {
    if (!vuln || !vuln._id) {
      console.error('❌ Cannot delete: Invalid vulnerability data');
      toast.error('Invalid vulnerability data');
      return;
    }

    setIsDeleting(true);
    try {
      console.log(`🗑️ Deleting vulnerability: ${vuln._id} (${vuln.vulnName})`);

      await deleteVulnerability(vuln._id);

      console.log(`✅ Vulnerability deleted successfully: ${vuln._id}`);

      toast.success(
        `Vulnerability "${vuln.vulnName}" has been deleted successfully.`
      );

      // Call callbacks safely
      onDeleted?.();
      onClose?.();
    } catch (error) {
      console.error('❌ Error deleting vulnerability:', error.message);
      toast.error(error.message || 'Failed to delete vulnerability');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ SOC 2: Safe severity color mapping
  const getSeverityColor = (severity) => {
    const colors = {
      Critical:
        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
      High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      Medium:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      Low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      Informational:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    };
    return (
      colors[severity] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
    );
  };

  if (!vuln) return null;

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={!!vuln}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrashIcon className="text-red-600 dark:text-red-400 w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Delete Vulnerability
              </h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>
        }
        size="md"
        showCloseButton={!isDeleting}
      >
        <div className="text-center py-6">
          {/* ========== WARNING ICON ========== */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <AlertTriangleIcon className="text-red-600 dark:text-red-400 w-8 h-8" />
          </div>

          {/* ========== VULNERABILITY DETAILS ========== */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Are you sure you want to delete this vulnerability?
            </h4>

            <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border">
              <div className="text-left space-y-3">
                {/* Vulnerability Name */}
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Name:
                  </span>
                  <p className="font-semibold text-foreground mt-1">
                    {vuln.vulnName || 'Unnamed Vulnerability'}
                  </p>
                </div>

                {/* Vulnerability Type */}
                {vuln.vulnType && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Type:
                    </span>
                    <p className="text-foreground mt-1">{vuln.vulnType}</p>
                  </div>
                )}

                {/* Severity */}
                {vuln.severity && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Severity:
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(
                          vuln.severity
                        )}`}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                  </div>
                )}

                {/* CVSS Score */}
                {vuln.cvssScore && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      CVSS Score:
                    </span>
                    <p className="text-foreground mt-1">{vuln.cvssScore}</p>
                  </div>
                )}

                {/* CWE ID */}
                {vuln.cweId && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      CWE ID:
                    </span>
                    <p className="text-foreground mt-1">{vuln.cweId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ SOC 2: Warning Message */}
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                ⚠️ This will permanently remove the vulnerability from the
                database. All associated data will be lost and cannot be
                recovered.
              </p>
            </div>
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
              className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[180px]"
              aria-label="Confirm deletion"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <TrashIcon className="w-5 h-5" />
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
