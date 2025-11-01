// =======================================================================
// FILE: src/features/admin/UserTrackerPage.jsx (UPDATED)
// PURPOSE: View user work logs with consistent spacing
// SOC 2 NOTES: Centralized icon management, audit logging, data privacy
// =======================================================================

import { useState, useMemo, useEffect } from 'react';
import { getWorkLogsByDate } from '../../api/trackerApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  CalendarIcon,
  UserIcon,
  FolderIcon,
  ClockIcon,
  MessageSquareIcon,
  BarChartIcon,
} from '../../components/Icons';

const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

const UserTrackerPage = () => {
  const [workLogs, setWorkLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    getFormattedDate(new Date())
  );

  const { theme, color } = useTheme();

  // ✅ SOC 2: Fetch work logs with error handling
  const fetchLogs = async (date) => {
    setIsLoading(true);
    setWorkLogs([]);

    try {
      // ✅ SOC 2: Log data retrieval attempt (audit trail)
      console.log(`📊 Fetching work logs for date: ${date}`);

      const response = await getWorkLogsByDate(date);

      // ✅ SOC 2: Safe data extraction
      const logData = Array.isArray(response?.data) ? response.data : [];

      setWorkLogs(logData);

      if (response.success) {
        if (logData.length > 0) {
          toast.success(
            `Found ${logData.length} work log${logData.length > 1 ? 's' : ''}`
          );
          console.log(`✅ Retrieved ${logData.length} work logs`);
        } else {
          toast.info('No work logs found for this date');
        }
      } else {
        toast.info(response.message || 'No logs found for this date');
      }
    } catch (error) {
      console.error('❌ Error fetching work logs:', error.message);
      toast.error('An error occurred while fetching logs');
      setWorkLogs([]);
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

  // ✅ SOC 2: Calculate statistics with defensive checks
  const statistics = useMemo(() => {
    const totalEntries = workLogs.length;

    // ✅ Safe unique user counting
    const uniqueUsers = new Set(
      workLogs
        .map((log) => log.UserId?._id || log.UserId)
        .filter(Boolean)
    ).size;

    // ✅ Safe unique project counting
    const uniqueProjects = new Set(
      workLogs
        .map((log) => log.projectId?._id || log.projectId)
        .filter(Boolean)
    ).size;

    // ✅ Safe hours calculation
    const totalHours = workLogs.reduce((total, log) => {
      const hours = parseFloat(log.hours) || 0;
      const mins = parseFloat(log.mins) || 0;
      return total + hours + mins / 60;
    }, 0);

    return {
      totalEntries,
      uniqueUsers,
      uniqueProjects,
      totalHours: totalHours.toFixed(1)
    };
  }, [workLogs]);

  // ✅ SOC 2: Table columns with proper data handling
  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.UserId?.name || 'N/A',
        header: 'User',
        cell: ({ getValue, row }) => {
          const name = getValue() || 'Unknown';
          return (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-primary">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-foreground">{name}</span>
            </div>
          );
        }
      },
      {
        accessorFn: (row) => row.projectId?.project_name || 'N/A',
        header: 'Project',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-foreground">
            <FolderIcon className="text-muted-foreground w-4 h-4" />
            <span>{getValue() || 'Unknown'}</span>
          </div>
        )
      },
      {
        accessorKey: 'hours',
        header: 'Time Logged',
        cell: ({ row }) => {
          const hours = row.original.hours || 0;
          const mins = row.original.mins || 0;

          return (
            <div className="flex items-center gap-1 text-foreground">
              <ClockIcon className="text-muted-foreground w-4 h-4" />
              <span className="font-mono">
                {hours}h {mins}m
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: 'note',
        header: 'Notes',
        cell: ({ getValue }) => {
          const note = getValue() || 'No notes';

          return (
            <div className="flex items-start gap-2 max-w-md">
              <MessageSquareIcon className="text-muted-foreground flex-shrink-0 mt-0.5 w-4 h-4" />
              <span className="text-sm text-muted-foreground line-clamp-2">
                {note}
              </span>
            </div>
          );
        }
      }
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  // ✅ SOC 2: Safe date formatting
  const displayDate = new Date(selectedDate);
  const formattedDate = displayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <BarChartIcon className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              User Activity Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              View user activity and time logs for a specific date
            </p>
          </div>
        </div>
      </div>

      {/* ========== DATE SELECTOR ========== */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="w-5 h-5" />
            <label className="text-sm font-medium">Select Date:</label>
          </div>

          {/* Date Input */}
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            max={getFormattedDate(new Date())}
            className="px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            aria-label="Select date for work logs"
          />

          {/* Date Display */}
          <div className="ml-auto text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* ========== STATISTICS ========== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Entries */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.totalEntries}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChartIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.uniqueUsers}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <UserIcon className="text-green-600 dark:text-green-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projects</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.uniqueProjects}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FolderIcon className="text-purple-600 dark:text-purple-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Hours */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {statistics.totalHours}h
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ClockIcon className="text-orange-600 dark:text-orange-400 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* ========== WORK LOGS TABLE ========== */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {workLogs.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No work logs found
            </h3>
            <p className="text-muted-foreground">
              No work logs were found for {formattedDate}.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try selecting a different date or check if users have logged any
              time.
            </p>
          </div>
        ) : (
          <DataTable
            data={workLogs}
            columns={columns}
            title={`Work Logs - ${formattedDate}`}
          />
        )}
      </div>
    </div>
  );
};

export default UserTrackerPage;
