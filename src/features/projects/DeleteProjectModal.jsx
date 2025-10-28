// =======================================================================
// FILE: src/features/projects/DeleteProjectModal.jsx (THEME UPDATED)
// PURPOSE: Modal for confirming project deletion with full theme support
// =======================================================================

import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteProject } from '../../api/projectApi';
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

const ProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DeleteProjectModal = ({ project, onClose, onProjectDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme, color } = useTheme();

  const handleDelete = async () => {
    if (!project) return;

    setIsDeleting(true);
    try {
      await deleteProject(project._id);
      toast.success(`Project "${project.project_name}" has been deleted successfully.`);
      onProjectDeleted();
      onClose();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error(error.message || 'Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={!!project}
      onClose={onClose}
      title="Delete Project"
      maxWidth="2xl"
      showCloseButton={true}
    >
      {/* ✅ UPDATED: Using theme variables */}
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
                All project data, vulnerabilities, and associated files will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-muted/30 border border-border rounded-lg p-6 mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <ProjectIcon className="text-muted-foreground mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Project Name</p>
              <p className="text-base font-semibold text-foreground">{project.project_name}</p>
            </div>
          </div>

          {project.client_name && (
            <div className="flex items-start gap-3">
              <UserIcon className="text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="text-base font-semibold text-foreground">{project.client_name}</p>
              </div>
            </div>
          )}

          {project.project_type && (
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-muted-foreground mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-base font-semibold text-foreground">
                  {Array.isArray(project.project_type) 
                    ? project.project_type.join(', ') 
                    : project.project_type
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Deletion Consequences */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">
            This will permanently remove:
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
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 border border-input rounded-lg hover:bg-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon />
                Delete Project
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProjectModal;
