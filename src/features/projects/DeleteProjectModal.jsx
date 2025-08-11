// =======================================================================
// FILE: src/features/projects/DeleteProjectModal.jsx (UPDATED)
// PURPOSE: Modal for confirming project deletion with theme support.
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
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={!!project}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrashIcon className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600">Delete Project</h3>
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

          {/* Project Details */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-card-foreground mb-2">
              Are you sure you want to delete this project?
            </h4>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <div className="text-left space-y-3">
                <div className="flex items-center gap-2">
                  <ProjectIcon className="text-primary" />
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Project Name:</span>
                    <p className="font-semibold text-card-foreground">{project.project_name}</p>
                  </div>
                </div>
                
                {project.clientName && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Client:</span>
                      <p className="text-card-foreground">{project.clientName}</p>
                    </div>
                  </div>
                )}
                
                {project.projectType && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Type:</span>
                    <p className="text-card-foreground">
                      {Array.isArray(project.projectType) 
                        ? project.projectType.join(', ') 
                        : project.projectType
                      }
                    </p>
                  </div>
                )}

                {project.assets && project.assets.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Assigned Testers:</span>
                    <p className="text-card-foreground">
                      {project.assets.map(asset => asset.name || 'Unknown').join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              This will permanently remove the project and all associated data including:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside">
              <li>All vulnerability findings</li>
              <li>Project reports and documents</li>
              <li>Time tracking entries</li>
              <li>Project configurations</li>
            </ul>
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
                  Delete Project
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteProjectModal;
