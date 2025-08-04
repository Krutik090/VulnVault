
// =======================================================================
// FILE: src/features/clients/AddClientPage.jsx (UPDATED)
// PURPOSE: A page for admins to add a new client.
// =======================================================================
import { useState } from 'react';
import toast from 'react-hot-toast';
import { addClient } from '../../api/clientApi';

const AddClientPage = () => {
    const [formData, setFormData] = useState({
        clientName: '',
        location: '',
        email: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await addClient(formData);
            toast.success(response.message || 'Client added successfully!');
            // Reset the form
            setFormData({ clientName: '', location: '', email: '' });
        } catch (error) {
            toast.error(error.message || "Failed to add client.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg max-w-2xl mx-auto">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-800">Add New Client</h1>
                <p className="text-gray-500 mt-1">Create a new client record in the system.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="clientName" className="block text-sm font-bold text-gray-700 mb-1">Client Name</label>
                        <input 
                            type="text" 
                            id="clientName"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., Secure Corp"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., contact@securecorp.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                        <input 
                            type="text" 
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., New York, USA"
                        />
                    </div>
                </div>
                <div className="p-6 bg-gray-50 text-right rounded-b-lg">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 text-white font-semibold rounded-lg shadow-md disabled:opacity-60 transition" style={{ background: 'linear-gradient(to right, #EC008C, #FC6767)' }}>
                        {isSaving ? 'Saving...' : 'Add Client'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddClientPage;
