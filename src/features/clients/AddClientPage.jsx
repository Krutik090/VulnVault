// =======================================================================
// FILE: src/features/clients/AddClientPage.jsx (NEW FILE)
// PURPOSE: A page for admins to add a new client.
// =======================================================================
import { useState } from 'react';
import toast from 'react-hot-toast';
// We will create this API function in a future step
// import { addClient } from '../../api/clientApi'; 

const AddClientPage = () => {
    const [clientName, setClientName] = useState('');
    const [serviceType, setServiceType] = useState('vapt');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // await addClient({ clientName, serviceType }); // This will be the actual API call
            toast.success(`Client "${clientName}" added successfully! (Simulated)`);
            setClientName('');
            setServiceType('vapt');
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
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., Secure Corp"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="serviceType" className="block text-sm font-bold text-gray-700 mb-1">Service Type</label>
                        <select 
                            id="serviceType"
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        >
                            <option value="vapt">VAPT</option>
                            <option value="soc">SOC</option>
                        </select>
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