// =======================================================================
// FILE: src/features/vulnerabilities/DeleteVulnModal.jsx (NEW FILE)
// =======================================================================
import { useState } from 'react';
import Modal from '../../components/Modal';
import { deleteVulnerability } from '../../api/vulnerabilityApi';
import toast from 'react-hot-toast';

const DeleteVulnModal = ({ vuln, onClose, onDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteVulnerability(vuln._id);
            toast.success(`Vulnerability "${vuln.vulnName}" deleted.`);
            onDeleted();
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal isOpen={!!vuln} onClose={onClose} title="Confirm Deletion">
            <div className="p-6">
                <p>Are you sure you want to delete the vulnerability <strong>{vuln?.vulnName}</strong>? This action cannot be undone.</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-white bg-red-600 rounded-md">
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </Modal>
    );
};

export default DeleteVulnModal;