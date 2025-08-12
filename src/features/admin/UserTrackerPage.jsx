// =======================================================================
// FILE: src/features/admin/UserTrackerPage.jsx (UPDATED)
// PURPOSE: The main page for admins to view user work logs by date with theme support.
// =======================================================================
import { useState, useMemo, useEffect } from 'react';
import { getWorkLogsByDate } from '../../api/trackerApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

// Icons
const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Helper to format date to YYYY-MM-DD
const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

const UserTrackerPage = () => {
  const [workLogs, setWorkLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(new Date()));
  const { theme, color } = useTheme();

  const fetchLogs = async (date) => {
    setIsLoading(true);
    setWorkLogs([]); // Clear previous results
    try {
      const response = await getWorkLogsByDate(date);
      if (response.success) {
        setWorkLogs(response.data || []);
        if (response.data && response.data.length > 0) {
          toast.success(`Found ${response.data.length} work log${response.data.length > 1 ? 's' : ''} for ${new Date(date).toLocaleDateString()}.`);
        } else {
          toast.info('No work logs found for this date.');
        }
      } else {
        // Handle the case where the API returns a 404 with a specific message
        toast.info(response.message || 'No logs found for this date.');
      }
    } catch (error) {
      console.error('Error fetching work logs:', error);
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

  // Calculate statistics for the selected date
  const statistics = useMemo(() => {
    const totalEntries = workLogs.length;
    const uniqueUsers = new Set(workLogs.map(log => log.UserId?._id || log.UserId)).size;
    const uniqueProjects = new Set(workLogs.map(log => log.projectId?._id || log.projectId)).size;
    const totalHours = workLogs.reduce((total, log) => {
      return total + (log.hours || 0) + (log.mins || 0) / 60;
    }, 0);

    return {
      totalEntries,
      uniqueUsers,
      uniqueProjects,
      totalHours: totalHours.toFixed(1)
    };
  }, [workLogs]);

  const columns = useMemo(() => [
    { 
      accessorFn: row => row.UserId?.name || 'N/A', 
      header: 'Username',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="text-primary" />
          <span className="font-medium text-card-foreground">{getValue()}</span>
        </div>
      )
    },
    { 
      accessorFn: row => row.projectId?.project_name || 'N/A', 
      header: 'Project',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <ProjectIcon className="text-muted-foreground" />
          <span className="text-card-foreground">{getValue()}</span>
        </div>
      )
    },
    { 
      accessorFn: row => `${row.hours || 0}h ${row.mins || 0}m`, 
      header: 'Time Spent',
      cell: ({ row }) => {
        const hours = row.original.hours || 0;
        const mins = row.original.mins || 0;
        const totalHours = hours + mins / 60;
        
        return (
          <div className="flex items-center gap-2">
            <ClockIcon className="text-emerald-500" />
            <div>
              <span className="font-mono text-sm text-card-foreground">
                {hours > 0 && `${hours}h `}
                {mins > 0 && `${mins}m`}
                {hours === 0 && mins === 0 && '0m'}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                ({totalHours.toFixed(2)}h)
              </span>
            </div>
          </div>
        );
      }
    },
    { 
      accessorKey: 'note', 
      header: 'Notes',
      cell: ({ getValue }) => {
        const note = getValue();
        if (!note) return <span className="text-muted-foreground text-sm">No notes</span>;
        
        return (
          <div className="flex items-start gap-2 max-w-md">
            <NoteIcon className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-card-foreground truncate" title={note}>
              {note}
            </p>
          </div>
        );
      }
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Logged At',
      cell: ({ getValue }) => {
        const date = getValue();
        if (!date) return <span className="text-muted-foreground">Unknown</span>;
        
        return (
          <div className="flex items-center gap-2">
            <ActivityIcon className="text-muted-foreground" />
            <span className="text-sm text-card-foreground">
              {new Date(date).toLocaleTimeString()}
            </span>
          </div>
        );
      }
    },
  ], []);

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <CalendarIcon className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">User Activity Tracker</h1>
              <p className="text-muted-foreground mt-1">
                View user activity and time logs for a specific date
              </p>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <label htmlFor="date-select" className="block text-sm font-medium text-card-foreground mb-2">
                  Select Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="date"
                    id="date-select"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Viewing logs for</p>
                <p className="text-lg font-semibold text-card-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-xl font-bold text-card-foreground">{statistics.totalEntries}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-xl font-bold text-blue-600">{statistics.uniqueUsers}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="text-xl font-bold text-green-600">{statistics.uniqueProjects}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-xl font-bold text-emerald-600">{statistics.totalHours}h</p>
            </div>
          </div>
        </div>

        {/* Work Logs Table */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-8">
              <Spinner message="Loading work logs..." />
            </div>
          ) : workLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ActivityIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No Activity Found</h3>
              <p className="text-muted-foreground mb-4">
                No work logs were found for {new Date(selectedDate).toLocaleDateString()}.
              </p>
              <p className="text-sm text-muted-foreground">
                Try selecting a different date or check if users have logged any time.
              </p>
            </div>
          ) : (
            <DataTable 
              data={workLogs} 
              columns={columns} 
              title={`Work Logs for ${new Date(selectedDate).toLocaleDateString()}`}
            />
          )}
        </div>

        {/* Summary Information */}
        {workLogs.length > 0 && (
          <div className="mt-8 p-6 bg-muted/30 border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <ActivityIcon />
              Daily Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-card-foreground mb-2">Activity Overview</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>{statistics.totalEntries} time entries logged</li>
                  <li>{statistics.uniqueUsers} user{statistics.uniqueUsers !== 1 ? 's' : ''} active</li>
                  <li>{statistics.uniqueProjects} project{statistics.uniqueProjects !== 1 ? 's' : ''} worked on</li>
                  <li>{statistics.totalHours} hours total tracked</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-card-foreground mb-2">Tracking Tips</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Review daily logs for productivity insights</li>
                  <li>Check for any missing time entries</li>
                  <li>Verify project allocations are accurate</li>
                  <li>Monitor work patterns and trends</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTrackerPage;
