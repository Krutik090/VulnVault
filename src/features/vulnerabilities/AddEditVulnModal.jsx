// =======================================================================
// FILE: src/features/vulnerabilities/AddEditVulnModal.jsx (NEW FILE)
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { createVulnerability, updateVulnerability } from '../../api/vulnerabilityApi';
import toast from 'react-hot-toast';

const AddEditVulnModal = ({ isOpen, onClose, onSave, vulnToEdit }) => {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!vulnToEdit;

    useEffect(() => {
        if (isOpen) {
            setFormData(isEditMode ? vulnToEdit : { vulnType: 'Web Application' });
        }
    }, [isOpen, vulnToEdit, isEditMode]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditMode) {
                await updateVulnerability(vulnToEdit._id, formData);
                toast.success("Vulnerability updated successfully!");
            } else {
                await createVulnerability(formData);
                toast.success("Vulnerability created successfully!");
            }
            onSave();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Vulnerability" : "Add New Vulnerability"} size="2xl">
            <form onSubmit={handleSubmit}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                    <FormInput label="Vulnerability Name" name="vulnName" value={formData.vulnName || ''} onChange={handleChange} required />
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Vulnerability Type</label>
                        <select name="vulnType" value={formData.vulnType || ''} onChange={handleChange} className="w-full p-2 border rounded">
                            <option>Web Application</option>
                            <option>Mobile Application</option>
                            <option>Network</option>
                        </select>
                    </div>
                    <div className="md:col-span-2"><FormTextarea label="Description" name="description" value={formData.description || ''} onChange={handleChange} required /></div>
                    <div className="md:col-span-2"><FormTextarea label="Impact" name="impact" value={formData.impact || ''} onChange={handleChange} required /></div>
                    <div className="md:col-span-2"><FormTextarea label="Recommendation" name="recommendation" value={formData.recommendation || ''} onChange={handleChange} required /></div>
                    <FormInput label="OWASP Family" name="owaspFamily" value={formData.owaspFamily || ''} onChange={handleChange} required />
                    <FormInput label="CWE" name="cwe" value={formData.cwe || ''} onChange={handleChange} required />
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-blue-600 rounded-md">
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const FormInput = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
        <input {...props} className="w-full p-2 border rounded-md" />
    </div>
);
const FormTextarea = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
        <textarea {...props} className="w-full p-2 border rounded-md" rows="4"></textarea>
    </div>
);

export default AddEditVulnModal;