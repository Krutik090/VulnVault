// =======================================================================
// FILE: src/features/admin/UserTrackerPage.jsx (FIXED)
// PURPOSE: The main page for admins to view user work logs by date.
// =======================================================================
import { useState, useMemo, useEffect } from 'react'; // Import useEffect
import { getWorkLogsByDate } from '../../api/trackerApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';

// Helper to format date to YYYY-MM-DD
const getFormattedDate = (date) => {
    return date.toISOString().split('T')[0];
};

const UserTrackerPage = () => {
    const [workLogs, setWorkLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Set initial loading to true
    const [selectedDate, setSelectedDate] = useState(getFormattedDate(new Date()));

    const fetchLogs = async (date) => {
        setIsLoading(true);
        setWorkLogs([]); // Clear previous results
        try {
            const response = await getWorkLogsByDate(date);
            if (response.success) {
                setWorkLogs(response.data);
            } else {
                // Handle the case where the API returns a 404 with a specific message
                toast.success(response.message || 'No logs found for this date.');
            }
        } catch (error) {
            toast.error("An error occurred while fetching logs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        if (newDate) {
            fetchLogs(newDate);
        }
    };
    
    // Correctly use useEffect for the initial data fetch
    useEffect(() => {
        fetchLogs(selectedDate);
    }, []); // Empty dependency array ensures this runs only once on mount

    const columns = useMemo(() => [
        {
            accessorFn: row => row.UserId?.name || 'N/A',
            header: 'Username',
            cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>
        },
        {
            accessorFn: row => row.projectId?.project_name || 'N/A',
            header: 'Project',
        },
        {
            accessorFn: row => `${row.hours}h ${row.mins}m`,
            header: 'Time',
        },
        {
            accessorKey: 'note',
            header: 'Note',
            cell: info => <p className="text-sm text-gray-600 whitespace-pre-wrap">{info.getValue()}</p>
        },
    ], []);

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">User Tracker</h1>
                    <p className="text-gray-500 mt-1">View user activity and time logs for a specific date.</p>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="date-picker" className="font-medium text-sm text-gray-700">Select Date:</label>
                    <input 
                        type="date" 
                        id="date-picker"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                    />
                </div>
            </div>
            {isLoading ? (
                <div className="p-6"><div className="h-64 flex items-center justify-center">Loading...</div></div>
            ) : (
                <DataTable data={workLogs} columns={columns} />
            )}
        </div>
    );
};

export default UserTrackerPage;