// =======================================================================
// FILE: src/features/admin/ResetPasswordModal.jsx (NEW FILE)
// =======================================================================
import { useState } from 'react';
import Modal from '../../components/Modal';
import { resetPassword } from '../../api/adminApi';
import toast from 'react-hot-toast';

const ResetPasswordModal = ({ user, onClose }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        setIsSaving(true);
        try {
            await resetPassword(user._id, newPassword);
            toast.success(`Password for ${user.name} has been reset.`);
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <Modal isOpen={!!user} onClose={onClose} title={`Reset Password for ${user?.name}`}>
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                        {isSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ResetPasswordModal;