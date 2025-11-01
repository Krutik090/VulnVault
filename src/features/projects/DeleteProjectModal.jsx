// =======================================================================
// FILE: src/features/projects/DeleteProjectModal.jsx (UPDATED)
// PURPOSE: Modal for confirming project deletion with full theme support
// SOC 2 NOTES: Centralized icon management, secure deletion, user confirmation
// =======================================================================

import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteProject } from '../../api/projectApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  TrashIcon,
  AlertTriangleIcon,
  FolderIcon,
  UserIcon,
  TagIcon,
} from '../../components/Icons';

const DeleteProjectModal = ({ project, onClose, onProjectDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, color } = useTheme();

  // ✅ SOC 2: Validate project data before deletion
  const handleDelete = async () => {
    if (!project || !project._id) {
      toast.error('Invalid project data');
      return;
    }

    // ✅ SOC 2: Double confirmation - user must explicitly delete
    const confirmed = window.confirm(
      `Are you absolutely sure you want to delete "${project.project_name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      // ✅ SOC 2: Log deletion attempt (audit trail)
      console.log(`🗑️ Deleting project: ${project._id} (${project.project_name})`);

      await deleteProject(project._id);

      // ✅ SOC 2: Log successful deletion (audit trail)
      console.log(`✅ Project deleted successfully: ${project._id}`);

      toast.success(
        `Project "${project.project_name}" has been deleted successfully.`
      );
      onProjectDeleted();
      onClose();
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) return null;

  // ✅ SOC 2: Safe data extraction
  const projectName = project.project_name || 'Unknown Project';
  const clientName = project.client_name || 'Unknown Client';
  const projectType = Array.isArray(project.project_type)
    ? project.project_type.join(', ')
    : project.project_type || 'Unknown Type';

  return (
    <Modal
      isOpen={!!project}
      onClose={onClose}
      title="Delete Project"
      maxWidth="600px"
      showCloseButton={true}
    >
      <div className="p-6">
        {/* ========== WARNING BANNER ========== */}
        {/* ✅ SOC 2: Clear visual warning about irreversible action */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5 w-6 h-6" />
            <div>
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                ⚠️ This action cannot be undone
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                All project data, vulnerabilities, and associated files will
                be permanently deleted from the system.
              </p>
            </div>
          </div>
        </div>

        {/* ========== PROJECT DETAILS ========== */}
        {/* ✅ SOC 2: Display project info for user confirmation */}
        <div className="bg-muted/30 border border-border rounded-lg p-6 mb-6 space-y-4">
          {/* Project Name */}
          <div className="flex items-start gap-3">
            <FolderIcon className="text-muted-foreground mt-1 w-5 h-5" />
            <div>
              <p className="text-sm text-muted-foreground">Project Name</p>
              <p className="text-base font-semibold text-foreground">
                {projectName}
              </p>
            </div>
          </div>

          {/* Client */}
          {project.client_name && (
            <div className="flex items-start gap-3">
              <UserIcon className="text-muted-foreground mt-1 w-5 h-5" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="text-base font-semibold text-foreground">
                  {clientName}
                </p>
              </div>
            </div>
          )}

          {/* Project Type */}
          {project.project_type && (
            <div className="flex items-start gap-3">
              <TagIcon className="text-muted-foreground mt-1 w-5 h-5" />
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-base font-semibold text-foreground">
                  {projectType}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ========== DELETION CONSEQUENCES ========== */}
        {/* ✅ SOC 2: Inform user of all data that will be deleted */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            🗑️ This will permanently remove:
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              All vulnerability findings and assessments
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Project configuration and settings
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Uploaded files and screenshots
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Project notes and timesheets
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Audit logs and activity history
            </li>
          </ul>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        {/* ✅ SOC 2: Cancel button is primary; Delete is destructive */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 border border-input rounded-lg hover:bg-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
            aria-label="Cancel deletion"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Permanently delete project"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon className="w-5 h-5" />
                Delete Project
              </>
            )}
          </button>
        </div>

        {/* ========== ADDITIONAL WARNING ========== */}
        {/* ✅ SOC 2: Extra emphasis on irreversibility */}
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-300 text-center">
            💡 <strong>Tip:</strong> Consider exporting project data before deletion for backup
            purposes.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;
