// =======================================================================
// FILE: src/features/tracker/TimeTrackerPage.jsx (FIXED - FULL WIDTH)
// PURPOSE: Time tracking page for testers to log their work hours
// SOC 2 NOTES: Centralized icon management, audit logging, data validation
// =======================================================================

import { useState, useEffect, useMemo } from 'react';
import { getMyProjects, logTime } from '../../api/trackerApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import SearchableDropdown from '../../components/SearchableDropdown';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  ClockIcon,
  PlusIcon,
  FileIcon,
  BarChartIcon,
  CalendarIcon,
  PencilIcon,
} from '../../components/Icons';

const TimeTrackerPage = () => {
  const [projects, setProjects] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  // Form state
  const [selectedProject, setSelectedProject] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { theme, color } = useTheme();
  const { user } = useAuth();

  // ✅ SOC 2: Fetch projects with audit logging
  const fetchProjects = async () => {
    try {
      console.log('📋 Fetching assigned projects');

      const response = await getMyProjects();

      if (response?.success && Array.isArray(response?.data?.projects)) {
        const projectsData = response.data.projects.map((p) => p.projectId);
        setProjects(projectsData);

        console.log(`✅ Retrieved ${projectsData.length} projects`);
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error.message);
      toast.error('Could not fetch your projects.');
      setProjects([]);
    }
  };

  // ✅ Placeholder for fetching time entries (currently commented out)
  const fetchTimeEntries = async () => {
    setIsLoadingEntries(false);
    // TODO: Implement API endpoint when available
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Loading tracker data');

      setIsLoading(true);
      await Promise.all([fetchProjects(), fetchTimeEntries()]);
      setIsLoading(false);

      console.log('✅ Tracker data loaded');
    };

    loadData();
  }, []);

  // ✅ SOC 2: Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};

    if (!selectedProject.trim()) {
      newErrors.project = 'Please select a project';
    }

    const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);

    if (totalMinutes === 0) {
      newErrors.time = 'Please enter time spent (hours and/or minutes)';
    } else if (totalMinutes > 24 * 60) {
      newErrors.time = 'Time cannot exceed 24 hours per entry';
    }

    if (note && note.length > 500) {
      newErrors.note = 'Note must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SOC 2: Handle form submission with audit logging
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.warn('❌ Form validation failed');
      toast.error('Please fix the errors below');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('⏱️ Logging time entry');

      const payload = {
        projectName: selectedProject,
        hours: Number(hours) || 0,
        mins: Number(minutes) || 0,
        note: note.trim(),
      };

      console.log('📤 Submitting payload:', payload);

      await logTime(payload);

      console.log('✅ Time logged successfully');

      toast.success('Time logged successfully!');

      // Reset form
      setSelectedProject('');
      setHours('');
      setMinutes('');
      setNote('');
      setErrors({});

      // Refresh time entries
      await fetchTimeEntries();
    } catch (error) {
      console.error('❌ Error logging time:', error.message);
      toast.error(error.message || 'Failed to log time');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ SOC 2: Memoized project options
  const projectOptions = useMemo(() => {
    return projects.map((project) => ({
      value:
        project?.project_name || project?.name || project?._id || 'unknown',
      label:
        project?.project_name || project?.name || 'Unnamed Project',
    }));
  }, [projects]);

  // ✅ SOC 2: Calculate today's hours safely
  const todayHours = useMemo(() => {
    const today = new Date().toDateString();
    return timeEntries
      .filter((entry) => {
        try {
          return new Date(entry.createdAt).toDateString() === today;
        } catch {
          return false;
        }
      })
      .reduce(
        (total, entry) =>
          total + (entry.hours || 0) + (entry.mins || 0) / 60,
        0
      );
  }, [timeEntries]);

  // ✅ SOC 2: Table columns with proper data handling
  const columns = useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(getValue()).toLocaleDateString()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'projectName',
        header: 'Project',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <FileIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">
              {getValue() || 'Unknown Project'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'time',
        header: 'Time Spent',
        cell: ({ row }) => {
          const hours = row.original.hours || 0;
          const mins = row.original.mins || 0;
          const totalHours = hours + mins / 60;

          return (
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-emerald-500" />
              <span className="font-mono text-sm">
                {hours > 0 && `${hours}h `}
                {mins > 0 && `${mins}m`}
                {hours === 0 && mins === 0 && '0m'}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                ({totalHours.toFixed(2)}h)
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'note',
        header: 'Notes',
        cell: ({ getValue }) => {
          const note = getValue();
          if (!note)
            return (
              <span className="text-muted-foreground text-sm">No notes</span>
            );

          return (
            <div className="max-w-md">
              <p
                className="text-sm text-card-foreground truncate"
                title={note}
              >
                {note}
              </p>
            </div>
          );
        },
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div
        className={`${theme} theme-${color} min-h-screen bg-background flex items-center justify-center`}
      >
        <Spinner message="Loading your projects..." />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      {/* ✅ FIXED: Full width with proper padding */}
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto">
          {/* ========== HEADER ========== */}
          <div className="mb-8">
            <div className="flex items-center gap-4 flex-col sm:flex-row">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ClockIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-card-foreground">
                  Time Tracker
                </h1>
                <p className="text-muted-foreground mt-1">
                  Log your work hours for penetration testing projects
                </p>
              </div>
            </div>
          </div>

          {/* ========== STATISTICS CARDS ========== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Hours</p>
                  <p className="text-2xl font-bold text-primary">
                    {todayHours.toFixed(1)}h
                  </p>
                </div>
                <ClockIcon className="w-8 h-8 text-primary opacity-50" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {projects.length}
                  </p>
                </div>
                <FileIcon className="w-8 h-8 text-emerald-500 opacity-50" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {timeEntries.length}
                  </p>
                </div>
                <BarChartIcon className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </div>
          </div>

          {/* ========== MAIN CONTENT GRID ========== */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* ========== TIME ENTRY FORM (2 COLUMNS) ========== */}
            <div className="xl:col-span-2 bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <PlusIcon className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-card-foreground">
                    Log Time Entry
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Record time spent on your assigned projects
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Project Selection */}
                  <div>
                    <SearchableDropdown
                      label="Project"
                      options={projectOptions}
                      value={selectedProject}
                      onChange={(value) => {
                        setSelectedProject(value);
                        if (errors.project) {
                          setErrors((prev) => ({
                            ...prev,
                            project: null,
                          }));
                        }
                      }}
                      placeholder="Select a project..."
                      error={errors.project}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Time Input */}
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">
                      Time Spent *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ClockIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={hours}
                            onChange={(e) => {
                              setHours(e.target.value);
                              if (errors.time) {
                                setErrors((prev) => ({
                                  ...prev,
                                  time: null,
                                }));
                              }
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50"
                            placeholder="Hours"
                            disabled={isSubmitting}
                            aria-label="Hours"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Hours (0-23)
                        </p>
                      </div>
                      <div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ClockIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={minutes}
                            onChange={(e) => {
                              setMinutes(e.target.value);
                              if (errors.time) {
                                setErrors((prev) => ({
                                  ...prev,
                                  time: null,
                                }));
                              }
                            }}
                            className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 disabled:opacity-50"
                            placeholder="Minutes"
                            disabled={isSubmitting}
                            aria-label="Minutes"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Minutes (0-59)
                        </p>
                      </div>
                    </div>
                    {errors.time && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.time}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="note"
                      className="block text-sm font-medium text-card-foreground mb-2"
                    >
                      Notes (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <PencilIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <textarea
                        id="note"
                        value={note}
                        onChange={(e) => {
                          setNote(e.target.value);
                          if (errors.note) {
                            setErrors((prev) => ({
                              ...prev,
                              note: null,
                            }));
                          }
                        }}
                        rows={3}
                        className={`
                          w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground 
                          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                          ${errors.note ? 'border-red-500' : 'border-input'}
                          transition-all duration-200 resize-none disabled:opacity-50
                        `}
                        placeholder="Describe what you worked on..."
                        disabled={isSubmitting}
                        aria-label="Work notes"
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      {errors.note && (
                        <p className="text-sm text-red-500">{errors.note}</p>
                      )}
                      <p className="text-xs text-muted-foreground ml-auto">
                        {note.length}/500 characters
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    aria-label="Log time entry"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Logging Time...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        Log Time Entry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ========== RECENT ENTRIES (1 COLUMN) ========== */}
            <div className="xl:col-span-1 bg-card rounded-lg border border-border overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <BarChartIcon className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-card-foreground">
                    Recent Entries
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your latest time tracking entries
                </p>
              </div>

              <div className="p-6">
                {isLoadingEntries ? (
                  <div className="text-center py-8">
                    <Spinner size="sm" message="Loading entries..." />
                  </div>
                ) : timeEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-card-foreground mb-2">
                      No Time Entries
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Start tracking your time by logging your first entry!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timeEntries.slice(0, 5).map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileIcon className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-medium text-card-foreground text-sm truncate">
                              {entry.projectName || 'Unknown'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {new Date(
                                entry.createdAt
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {entry.hours > 0 && `${entry.hours}h `}
                              {entry.mins > 0 && `${entry.mins}m`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {timeEntries.length > 5 && (
                      <div className="text-center pt-3 border-t border-border">
                        <p className="text-xs text-muted-foreground">
                          +{timeEntries.length - 5} more
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========== FULL TIME ENTRIES TABLE ========== */}
          {timeEntries.length > 0 && (
            <div className="mt-8">
              <DataTable
                data={timeEntries}
                columns={columns}
                title="All Time Entries"
              />
            </div>
          )}

          {/* ========== HELP SECTION ========== */}
          <div className="mt-8 p-6 bg-muted/30 border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6" />
              Time Tracking Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-card-foreground mb-2">
                  Accurate Time Logging
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Log time as soon as you complete a task</li>
                  <li>Break down work into specific activities</li>
                  <li>Include relevant details in your notes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-card-foreground mb-2">
                  Best Practices
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Track time daily for consistency</li>
                  <li>Use descriptive notes for future reference</li>
                  <li>Review your time entries regularly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTrackerPage;
