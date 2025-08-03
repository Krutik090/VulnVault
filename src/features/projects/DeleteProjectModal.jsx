// =======================================================================
// FILE: src/features/projects/DeleteProjectModal.jsx (NEW FILE)
// =======================================================================
import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteProject } from '../../api/projectApi';
import toast from 'react-hot-toast';

const DeleteProjectModal = ({ project, onClose, onProjectDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteProject(project._id);
            toast.success(`Project "${project.project_name}" has been deleted.`);
            onProjectDeleted();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={!!project} onClose={onClose} title="Confirm Deletion">
            <div className="p-6">
                <p>Are you sure you want to delete the project <strong>{project?.project_name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-white bg-red-600 rounded-md">
                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                </button>
            </div>
        </Modal>
    );
};

export default DeleteProjectModal;