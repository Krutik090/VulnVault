// =======================================================================
// FILE: src/features/tools/SubdomainFinderPage.jsx (NEW FILE)
// PURPOSE: The main page for the Subdomain Finder tool.
// =======================================================================
import { useState, useMemo } from 'react';
import { findSubdomains } from '../../api/toolsApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';

const SearchIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;

const SubdomainFinderPage = () => {
    const [domain, setDomain] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!domain) {
            toast.error("Please enter a domain name.");
            return;
        }
        setIsLoading(true);
        setResults([]);
        try {
            const response = await findSubdomains(domain);
            setResults(response.data);
            if (response.data.length === 0) {
                toast.success("No subdomains found for this domain.");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = useMemo(() => [
        { accessorKey: 'subdomain', header: 'Subdomain' },
        { accessorKey: 'ip', header: 'IP Address' },
    ], []);

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Subdomain Finder</h1>
                    <p className="text-gray-500 mt-1">Discover subdomains of a target domain using passive DNS.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center gap-4">
                        <input 
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                            placeholder="e.g., example.com"
                        />
                        <button type="submit" disabled={isLoading} className="flex items-center px-6 py-2 text-white font-semibold rounded-lg shadow-md disabled:opacity-60" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
                            {isLoading ? 'Searching...' : <><SearchIcon /> Search</>}
                        </button>
                    </div>
                </form>
            </div>

            {results.length > 0 && (
                <div className="bg-white shadow rounded-lg">
                    <DataTable data={results} columns={columns} />
                </div>
            )}
        </div>
    );
};

export default SubdomainFinderPage;