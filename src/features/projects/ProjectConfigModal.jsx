// =======================================================================
// FILE: src/features/projects/ProjectConfigModal.jsx (UPDATED)
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getProjectConfig, saveProjectConfig } from '../../api/projectApi';
import toast from 'react-hot-toast';

const ProjectConfigModal = ({ project, onClose }) => {
    const [config, setConfig] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (project) {
            const fetchConfig = async () => {
                try {
                    const response = await getProjectConfig(project._id);
                    if (response.success) setConfig(response.data);
                    else setConfig({}); // Reset if no config found
                } catch (error) { toast.error("Could not load project config."); }
            };
            fetchConfig();
        }
    }, [project]);
    
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await saveProjectConfig(project._id, config);
            toast.success("Configuration saved!");
            onClose();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleChange = (part, field, value) => setConfig(prev => ({ ...prev, [part]: { ...prev[part], [field]: value } }));
    const handleSimpleChange = (e) => setConfig(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleCheckboxChange = (part, field, checked) => setConfig(prev => ({ ...prev, [part]: { ...prev[part], [field]: checked } }));

    return (
        <Modal isOpen={!!project} onClose={onClose} title={`Configuration for ${project?.project_name}`} size="3xl">
            <form onSubmit={handleSave}>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Report Details Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Report Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={config.reportDetails?.reportDocName || ''} onChange={e => handleChange('reportDetails', 'reportDocName', e.target.value)} placeholder="Report Document Name" className="w-full p-2 border rounded" />
                            <input value={config.reportDetails?.clientName || ''} onChange={e => handleChange('reportDetails', 'clientName', e.target.value)} placeholder="Client Name (for report)" className="w-full p-2 border rounded" />
                            <input value={config.reportDetails?.version || ''} onChange={e => handleChange('reportDetails', 'version', e.target.value)} placeholder="Version (e.g., 1.0)" className="w-full p-2 border rounded" />
                            <input value={config.reportDetails?.exhibit || ''} onChange={e => handleChange('reportDetails', 'exhibit', e.target.value)} placeholder="Exhibit" className="w-full p-2 border rounded" />
                        </div>
                    </fieldset>
                    
                    {/* Scope Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Scope</legend>
                        <div className="space-y-4">
                            <input value={config.scope?.testingType || ''} onChange={e => handleChange('scope', 'testingType', e.target.value)} placeholder="Testing Type (e.g., Black Box)" className="w-full p-2 border rounded" />
                            <textarea value={config.scope?.appDescription || ''} onChange={e => handleChange('scope', 'appDescription', e.target.value)} placeholder="Application Description" className="w-full p-2 border rounded" rows="3"></textarea>
                            <textarea value={config.scope?.domains || ''} onChange={e => handleChange('scope', 'domains', e.target.value.split('\n'))} placeholder="Domains/Office (one per line)" className="w-full p-2 border rounded" rows="3"></textarea>
                            <textarea value={config.scope?.functionalityNotTested || ''} onChange={e => handleChange('scope', 'functionalityNotTested', e.target.value)} placeholder="Functionality Not Tested" className="w-full p-2 border rounded" rows="3"></textarea>
                        </div>
                    </fieldset>

                    {/* Methodology Section */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Methodology</legend>
                        <div className="space-y-4">
                            <textarea value={config.methodology?.teamMembers?.join('\n') || ''} onChange={e => handleChange('methodology', 'teamMembers', e.target.value.split('\n'))} placeholder="Team Members (one per line)" className="w-full p-2 border rounded" rows="3"></textarea>
                            <input value={config.methodology?.communicationMethods || ''} onChange={e => handleChange('methodology', 'communicationMethods', e.target.value)} placeholder="Communication Methods" className="w-full p-2 border rounded" />
                            <textarea value={config.methodology?.sessionManagement || ''} onChange={e => handleChange('methodology', 'sessionManagement', e.target.value)} placeholder="Session Management Details" className="w-full p-2 border rounded" rows="3"></textarea>
                            <input value={config.methodology?.userRoleTested || ''} onChange={e => handleChange('methodology', 'userRoleTested', e.target.value)} placeholder="User Role Tested" className="w-full p-2 border rounded" />
                            <textarea value={config.methodology?.limitations || ''} onChange={e => handleChange('methodology', 'limitations', e.target.value)} placeholder="Limitations" className="w-full p-2 border rounded" rows="3"></textarea>
                            <div className="flex items-center space-x-4">
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={config.methodology?.businessRisk || false} onChange={e => handleCheckboxChange('methodology', 'businessRisk', e.target.checked)} /><span>Is Business Risk Included?</span></label>
                                <label className="flex items-center space-x-2"><input type="checkbox" checked={config.methodology?.cvssIncluded || false} onChange={e => handleCheckboxChange('methodology', 'cvssIncluded', e.target.checked)} /><span>Is CVSS Included?</span></label>
                            </div>
                        </div>
                    </fieldset>
                    
                    <textarea name="notes" value={config.notes || ''} onChange={handleSimpleChange} placeholder="General Notes..." className="w-full p-2 border rounded" rows="3"></textarea>
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