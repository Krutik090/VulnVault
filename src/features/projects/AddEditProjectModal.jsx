
// =======================================================================
// FILE: src/features/projects/AddEditProjectModal.jsx (UPDATED)
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import MultiSelect from '../../components/MultiSelect';
import { createProject, updateProject } from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import { getTesters } from '../../api/adminApi';
import toast from 'react-hot-toast';

const AddEditProjectModal = ({ isOpen, onClose, onSave, projectToEdit }) => {
    const [formData, setFormData] = useState({});
    const [clients, setClients] = useState([]);
    const [testers, setTesters] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const isEditMode = !!projectToEdit;

    const projectTypeOptions = [
        { value: 'Web Application', label: 'Web Application' },
        { value: 'Mobile Application', label: 'Mobile Application' },
        { value: 'Network', label: 'Network' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, testersRes] = await Promise.all([getAllClients(), getTesters()]);
                setClients(clientsRes.data);
                setTesters(testersRes.data);
            } catch (error) { toast.error("Failed to load necessary data."); }
        };
        if(isOpen) fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && projectToEdit) {
                setFormData({
                    clientId: projectToEdit.clientId || '',
                    project_name: projectToEdit.project_name || '',
                    projectType: Array.isArray(projectToEdit.projectType) ? projectToEdit.projectType : [projectToEdit.projectType],
                    projectStart: projectToEdit.projectStart ? new Date(projectToEdit.projectStart).toISOString().split('T')[0] : '',
                    projectEnd: projectToEdit.projectEnd ? new Date(projectToEdit.projectEnd).toISOString().split('T')[0] : '',
                    assets: Array.isArray(projectToEdit.assets) ? projectToEdit.assets.map(a => a._id || a) : [],
                });
            } else {
                setFormData({ clientId: '', project_name: '', projectType: [], projectStart: '', projectEnd: '', assets: [] });
            }
        }
    }, [projectToEdit, isOpen, isEditMode]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMultiSelectChange = (field, values) => setFormData(prev => ({ ...prev, [field]: values }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditMode) {
                await updateProject(projectToEdit._id, formData);
                toast.success("Project updated successfully!");
            } else {
                await createProject(formData);
                toast.success("Project created successfully!");
            }
            onSave();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Project" : "Add New Project"} size="2xl">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Client Name</label>
                        <select name="clientId" value={formData.clientId} onChange={handleChange} required className="w-full p-2 border rounded">
                            <option value="" disabled>Select a client</option>
                            {clients.map(client => <option key={client._id} value={client._id}>{client.clientName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Project Name</label>
                        <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} required className="w-full p-2 border rounded" placeholder="e.g., Q3 Security Audit" />
                    </div>
                    
                    <MultiSelect 
                        label="Project Type"
                        options={projectTypeOptions}
                        selected={formData.projectType || []}
                        onChange={(values) => handleMultiSelectChange('projectType', values)}
                        placeholder="Select project types..."
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
                            <input type="date" name="projectStart" value={formData.projectStart} onChange={handleChange} required className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
                            <input type="date" name="projectEnd" value={formData.projectEnd} onChange={handleChange} required className="w-full p-2 border rounded" />
                        </div>
                    </div>
                    
                    <MultiSelect 
                        label="Assets (Select Testers)"
                        options={testers.map(t => ({ value: t._id, label: t.name }))}
                        selected={formData.assets || []}
                        onChange={(values) => handleMultiSelectChange('assets', values)}
                        placeholder="Select testers..."
                    />
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-blue-600 rounded-md">
                        {isSaving ? 'Saving...' : 'Save Project'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddEditProjectModal;
