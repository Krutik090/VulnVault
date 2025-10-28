// =======================================================================
// FILE: src/features/admin/UserTrackerPage.jsx (UPDATED - IMPROVED LAYOUT)
// PURPOSE: View user work logs with consistent spacing
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

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
    setWorkLogs([]);
    
    try {
      const response = await getWorkLogsByDate(date);
      if (response.success) {
        setWorkLogs(response.data || []);
        if (response.data && response.data.length > 0) {
          toast.success(`Found ${response.data.length} work log${response.data.length > 1 ? 's' : ''}`);
        } else {
          toast.info('No work logs found for this date');
        }
      } else {
        toast.info(response.message || 'No logs found for this date');
      }
    } catch (error) {
      console.error('Error fetching work logs:', error);
      toast.error('An error occurred while fetching logs');
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

  useEffect(() => {
    fetchLogs(selectedDate);
  }, []);

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
      header: 'User',
      cell: ({ getValue, row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-primary">
              {getValue()?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-foreground">{getValue()}</span>
        </div>
      )
    },
    {
      accessorFn: row => row.projectId?.project_name || 'N/A',
      header: 'Project',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2 text-foreground">
          <ProjectIcon className="text-muted-foreground" />
          <span>{getValue()}</span>
        </div>
      )
    },
    {
      accessorKey: 'hours',
      header: 'Hours',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-foreground">
          <ClockIcon className="text-muted-foreground" />
          <span className="font-mono">{row.original.hours || 0}h {row.original.mins || 0}m</span>
        </div>
      )
    },
    {
      accessorKey: 'note',
      header: 'Notes',
      cell: ({ getValue }) => {
        const note = getValue();
        return (
          <div className="flex items-start gap-2 max-w-md">
            <NoteIcon className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground line-clamp-2">
              {note || 'No notes'}
            </span>
          </div>
        );
      }
    }
  ], []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <ActivityIcon className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Activity Tracker</h1>
            <p className="text-muted-foreground mt-1">
              View user activity and time logs for a specific date
            </p>
          </div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon />
            <label className="text-sm font-medium">Select Date:</label>
          </div>
          
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={getFormattedDate(new Date())}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          
          <div className="ml-auto text-sm text-muted-foreground">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold text-foreground mt-1">{statistics.totalEntries}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ActivityIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">{statistics.uniqueUsers}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserIcon className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="text-2xl font-bold text-foreground mt-1">{statistics.uniqueProjects}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ProjectIcon className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold text-foreground mt-1">{statistics.totalHours}h</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ClockIcon className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Work Logs Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {workLogs.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No work logs found</h3>
            <p className="text-muted-foreground">
              No work logs were found for {new Date(selectedDate).toLocaleDateString()}.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try selecting a different date or check if users have logged any time.
            </p>
          </div>
        ) : (
          <DataTable
            data={workLogs}
            columns={columns}
            title={`Work Logs - ${new Date(selectedDate).toLocaleDateString()}`}
          />
        )}
      </div>
    </div>
  );
};

export default UserTrackerPage;
