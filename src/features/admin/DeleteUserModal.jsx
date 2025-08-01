// =======================================================================
// FILE: src/features/admin/DeleteUserModal.jsx (NEW FILE)
// =======================================================================
import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteUser } from '../../api/adminApi';
import toast from 'react-hot-toast';

const DeleteUserModal = ({ user, onClose, onUserDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteUser(user._id);
            toast.success(`User ${user.name} has been deleted.`);
            onUserDeleted();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={!!user} onClose={onClose} title="Confirm Deletion">
            <div className="p-6">
                <p>Are you sure you want to delete the user <strong>{user?.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50">
                    {isDeleting ? 'Deleting...' : 'Delete User'}
                </button>
            </div>
        </Modal>
    );
};

export default DeleteUserModal;