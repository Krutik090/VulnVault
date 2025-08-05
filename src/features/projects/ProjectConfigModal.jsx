
// =======================================================================
// FILE: src/features/projects/ProjectConfigModal.jsx (UPDATED)
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getProjectConfig, saveProjectConfig } from '../../api/projectDetailsApi';
import toast from 'react-hot-toast';

const ProjectConfigModal = ({ project, isOpen, onClose, onSave }) => {
    const [config, setConfig] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (project && isOpen) {
            const fetchConfig = async () => {
                try {
                    const response = await getProjectConfig(project._id);
                    if (response.success) setConfig(response.data);
                    else setConfig({}); // Reset if no config found
                } catch (error) { toast.error("Could not load project config."); }
            };
            fetchConfig();
        }
    }, [project, isOpen]);
    
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await saveProjectConfig(project._id, config);
            toast.success("Configuration saved!");
            onSave(); // Call the onSave callback to refresh parent data
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleChange = (part, field, value) => setConfig(prev => ({ ...prev, [part]: { ...prev[part], [field]: value } }));
    const handleSimpleChange = (e) => setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCheckboxChange = (part, field, checked) => setConfig(prev => ({ ...prev, [part]: { ...prev[part], [field]: checked } }));
    
    const FormInput = ({ label, ...props }) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
            <input {...props} className="w-full p-2 border rounded-md" />
        </div>
    );

    const FormTextarea = ({ label, ...props }) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
            <textarea {...props} className="w-full p-2 border rounded-md" rows="3"></textarea>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Configuration for ${project?.project_name}`} size="3xl">
            <form onSubmit={handleSave}>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Report Details Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Report Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Report Document Name" value={config.reportDetails?.reportDocName || ''} onChange={e => handleChange('reportDetails', 'reportDocName', e.target.value)} />
                            <FormInput label="Client Name" value={config.reportDetails?.clientName || ''} onChange={e => handleChange('reportDetails', 'clientName', e.target.value)} />
                            <FormInput label="Version" value={config.reportDetails?.version || ''} onChange={e => handleChange('reportDetails', 'version', e.target.value)} />
                            <FormInput label="Exhibit" value={config.reportDetails?.exhibit || ''} onChange={e => handleChange('reportDetails', 'exhibit', e.target.value)} />
                        </div>
                    </fieldset>
                    
                    {/* Scope Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Scope</legend>
                        <div className="space-y-4">
                            <FormInput label="Testing Type" value={config.scope?.testingType || ''} onChange={e => handleChange('scope', 'testingType', e.target.value)} />
                            <FormTextarea label="Application Description" value={config.scope?.appDescription || ''} onChange={e => handleChange('scope', 'appDescription', e.target.value)} />
                            <FormTextarea label="Domains/Office (one per line)" value={config.scope?.domains?.join('\n') || ''} onChange={e => handleChange('scope', 'domains', e.target.value.split('\n'))} />
                            <FormTextarea label="Functionality Not Tested" value={config.scope?.functionalityNotTested || ''} onChange={e => handleChange('scope', 'functionalityNotTested', e.target.value)} />
                        </div>
                    </fieldset>

                    {/* Methodology Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Methodology</legend>
                        <div className="space-y-4">
                            <FormInput label="Communication Methods" value={config.methodology?.communicationMethods || ''} onChange={e => handleChange('methodology', 'communicationMethods', e.target.value)} />
                            <FormTextarea label="Session Management Details" value={config.methodology?.sessionManagement || ''} onChange={e => handleChange('methodology', 'sessionManagement', e.target.value)} />
                            <FormInput label="User Role Tested" value={config.methodology?.userRoleTested || ''} onChange={e => handleChange('methodology', 'userRoleTested', e.target.value)} />
                            <FormTextarea label="Limitations" value={config.methodology?.limitations || ''} onChange={e => handleChange('methodology', 'limitations', e.target.value)} />
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={config.methodology?.businessRisk || false} onChange={e => handleCheckboxChange('methodology', 'businessRisk', e.target.checked)} /><span>Is Business Risk Included?</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={config.methodology?.cvssIncluded || false} onChange={e => handleCheckboxChange('methodology', 'cvssIncluded', e.target.checked)} /><span>Is CVSS Included?</span></label>
                            </div>
                        </div>
                    </fieldset>
                    
                    <FormTextarea label="General Notes" name="notes" value={config.notes || ''} onChange={handleSimpleChange} />
                </div>
                <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 text-white bg-blue-600 rounded-md">
                        {isSaving ? 'Saving...' : 'Save Config'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ProjectConfigModal;
