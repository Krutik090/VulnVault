// =======================================================================
// FILE: src/features/tracker/TimeTrackerPage.jsx (UPDATED)
// PURPOSE: Time tracking page for testers to log their work hours with theme support.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { getMyProjects, logTime } from '../../api/trackerApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import SearchableDropdown from '../../components/SearchableDropdown';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Icons
const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const TimeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const NoteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BarChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

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

  const fetchProjects = async () => {
    try {
      const response = await getMyProjects();
      if (response.success && response.data.projects) {
        setProjects(response.data.projects.map(p => p.projectId));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("Could not fetch your projects.");
    }
  };

  // const fetchTimeEntries = async () => {
  //   setIsLoadingEntries(true);
  //   try {
  //     const response = await getMyTimeEntries();
  //     if (response.success && response.data) {
  //       setTimeEntries(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching time entries:', error);
  //     // Don't show error toast as this might be a new feature
  //   } finally {
  //     setIsLoadingEntries(false);
  //   }
  // };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProjects(), fetchTimeEntries()]);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedProject) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsSubmitting(true);
    try {
      await logTime({
        projectName: selectedProject,
        hours: Number(hours) || 0,
        mins: Number(minutes) || 0,
        note: note.trim(),
      });
      
      toast.success("Time logged successfully!");
      
      // Reset form
      setSelectedProject('');
      setHours('');
      setMinutes('');
      setNote('');
      setErrors({});
      
      // Refresh time entries
      await fetchTimeEntries();
    } catch (error) {
      console.error('Error logging time:', error);
      toast.error(error.message || 'Failed to log time');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Project options for dropdown
  const projectOptions = useMemo(() => {
    return projects.map(project => ({
      value: project.project_name || project.name || project._id,
      label: project.project_name || project.name || 'Unnamed Project'
    }));
  }, [projects]);

  // Calculate total hours for today
  const todayHours = useMemo(() => {
    const today = new Date().toDateString();
    return timeEntries
      .filter(entry => new Date(entry.createdAt).toDateString() === today)
      .reduce((total, entry) => total + (entry.hours || 0) + (entry.mins || 0) / 60, 0);
  }, [timeEntries]);

  // Table columns for time entries
  const columns = useMemo(() => [
    { 
      accessorKey: 'createdAt', 
      header: 'Date',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <CalendarIcon className="text-muted-foreground" />
          <span className="text-sm">
            {new Date(getValue()).toLocaleDateString()}
          </span>
        </div>
      )
    },
    { 
      accessorKey: 'projectName', 
      header: 'Project',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <ProjectIcon className="text-primary" />
          <span className="font-medium">{getValue() || 'Unknown Project'}</span>
        </div>
      )
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
            <TimeIcon className="text-emerald-500" />
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
      }
    },
    { 
      accessorKey: 'note', 
      header: 'Notes',
      cell: ({ getValue }) => {
        const note = getValue();
        if (!note) return <span className="text-muted-foreground text-sm">No notes</span>;
        
        return (
          <div className="max-w-md">
            <p className="text-sm text-card-foreground truncate" title={note}>
              {note}
            </p>
          </div>
        );
      }
    },
  ], []);

  if (isLoading) {
    return (
      <div className={`${theme} theme-${color} min-h-screen bg-background flex items-center justify-center`}>
        <Spinner message="Loading your projects..." />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ClockIcon className="text-primary" />
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Hours</p>
                <p className="text-2xl font-bold text-primary">{todayHours.toFixed(1)}h</p>
              </div>
              <ClockIcon className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-emerald-600">{projects.length}</p>
              </div>
              <ProjectIcon className="w-8 h-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold text-blue-600">{timeEntries.length}</p>
              </div>
              <BarChartIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Time Entry Form */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <PlusIcon className="text-primary" />
                <h2 className="text-xl font-semibold text-card-foreground">Log Time Entry</h2>
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
                        setErrors(prev => ({ ...prev, project: null }));
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
                          <TimeIcon className="text-muted-foreground" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={hours}
                          onChange={(e) => {
                            setHours(e.target.value);
                            if (errors.time) {
                              setErrors(prev => ({ ...prev, time: null }));
                            }
                          }}
                          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                          placeholder="Hours"
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Hours (0-23)</p>
                    </div>
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <TimeIcon className="text-muted-foreground" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={minutes}
                          onChange={(e) => {
                            setMinutes(e.target.value);
                            if (errors.time) {
                              setErrors(prev => ({ ...prev, time: null }));
                            }
                          }}
                          className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                          placeholder="Minutes"
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Minutes (0-59)</p>
                    </div>
                  </div>
                  {errors.time && (
                    <p className="mt-1 text-sm text-red-500">{errors.time}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-card-foreground mb-2">
                    Notes (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <NoteIcon className="text-muted-foreground" />
                    </div>
                    <textarea
                      id="note"
                      value={note}
                      onChange={(e) => {
                        setNote(e.target.value);
                        if (errors.note) {
                          setErrors(prev => ({ ...prev, note: null }));
                        }
                      }}
                      rows={3}
                      className={`
                        w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground 
                        placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                        ${errors.note ? 'border-red-500' : 'border-input'}
                        transition-all duration-200 resize-none
                      `}
                      placeholder="Describe what you worked on..."
                      disabled={isSubmitting}
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
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Logging Time...
                    </>
                  ) : (
                    <>
                      <PlusIcon />
                      Log Time Entry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Entries */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <BarChartIcon className="text-primary" />
                <h2 className="text-xl font-semibold text-card-foreground">Recent Entries</h2>
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
                  <ClockIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">No Time Entries</h3>
                  <p className="text-muted-foreground">
                    Start tracking your time by logging your first entry!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeEntries.slice(0, 5).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ProjectIcon className="w-4 h-4 text-primary" />
                          <span className="font-medium text-card-foreground">
                            {entry.projectName || 'Unknown Project'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon />
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <TimeIcon />
                            {entry.hours > 0 && `${entry.hours}h `}
                            {entry.mins > 0 && `${entry.mins}m`}
                          </div>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {timeEntries.length > 5 && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing latest 5 entries. Total: {timeEntries.length}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full Time Entries Table */}
        {timeEntries.length > 0 && (
          <div className="mt-8">
            <DataTable 
              data={timeEntries} 
              columns={columns} 
              title="All Time Entries"
            />
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 p-6 bg-muted/30 border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <ClockIcon />
            Time Tracking Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Accurate Time Logging</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Log time as soon as you complete a task</li>
                <li>Break down work into specific activities</li>
                <li>Include relevant details in your notes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Best Practices</h4>
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
  );
};

export default TimeTrackerPage;
