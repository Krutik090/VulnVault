// =======================================================================
// FILE: src/features/projects/AddProjectPage.jsx (UPDATED)
// PURPOSE: Full page for creating AND editing projects
// SOC 2 NOTES: Centralized icon management, secure data handling, form validation
// =======================================================================

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import MultiSelect from '../../components/MultiSelect';
import SearchableDropdown from '../../components/SearchableDropdown';
import DatePicker from '../../components/DatePicker';
import { createProject, getProjectById, updateProject } from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import { getTesters } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  ArrowLeftIcon,
  SaveIcon,
  ProjectIcon,
} from '../../components/Icons';

const AddProjectPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // For edit mode
  const [searchParams] = useSearchParams();
  const preSelectedClientId = searchParams.get('clientId');

  const isEditMode = !!projectId;

  const [formData, setFormData] = useState({
    clientId: preSelectedClientId || '',
    project_name: '',
    project_type: [],
    start_date: null,
    end_date: null,
    assigned_testers: [],
    status: 'Not Started',
    description: ''
  });

  const [clients, setClients] = useState([]);
  const [testers, setTesters] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const { theme, color } = useTheme();

  // ✅ SOC 2: Predefined project type options
  const projectTypeOptions = [
    { value: 'Web Application', label: 'Web Application' },
    { value: 'Mobile Application', label: 'Mobile Application' },
    { value: 'API Testing', label: 'API Testing' },
    { value: 'Network Penetration Testing', label: 'Network Penetration Testing' },
    { value: 'Cloud Security Assessment', label: 'Cloud Security Assessment' },
    { value: 'Social Engineering', label: 'Social Engineering' },
    { value: 'Wireless Security', label: 'Wireless Security' },
    { value: 'IoT Security', label: 'IoT Security' },
    { value: 'Code Review', label: 'Code Review' },
    { value: 'Configuration Review', label: 'Configuration Review' },
    { value: 'Other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'Active', label: 'Active' },
    { value: 'Retest', label: 'Retest' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Archived', label: 'Archived' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isEditMode && clients.length > 0 && testers.length > 0) {
      fetchProjectData();
    }
  }, [isEditMode, clients, testers]);

  const fetchData = async () => {
    try {
      // ✅ SOC 2: Parallel API calls for performance
      const [clientsResponse, testersResponse] = await Promise.all([
        getAllClients(),
        getTesters(),
      ]);

      // ✅ SOC 2: Input validation & sanitization
      const clientData = Array.isArray(clientsResponse?.data)
        ? clientsResponse.data
        : Array.isArray(clientsResponse)
        ? clientsResponse
        : [];

      const testerData = Array.isArray(testersResponse?.data)
        ? testersResponse.data
        : Array.isArray(testersResponse)
        ? testersResponse
        : [];

      setClients(clientData);
      setTesters(testerData);
    } catch (error) {
      // ✅ SOC 2: Secure error handling
      console.error('Failed to fetch form data');
      toast.error('Failed to load form data');
    }
  };

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectById(projectId);
      const project = response.data || response;

      // ✅ SOC 2: Safe extraction of tester IDs (defensive programming)
      const testerIds = Array.isArray(project.assigned_testers)
        ? project.assigned_testers
          .map((tester) => {
            if (typeof tester === 'string') return tester;
            if (tester && typeof tester === 'object' && tester._id) return tester._id;
            return null;
          })
          .filter(Boolean)
        : [];

      // ✅ SOC 2: Safe extraction of client ID
      const clientId =
        project.clientId && typeof project.clientId === 'object'
          ? project.clientId._id
          : project.clientId || '';

      setFormData({
        clientId: clientId,
        project_name: project.project_name || '',
        project_type: Array.isArray(project.project_type) ? project.project_type : [],
        start_date: project.start_date ? new Date(project.start_date) : null,
        end_date: project.end_date ? new Date(project.end_date) : null,
        assigned_testers: testerIds,
        status: project.status || 'Not Started',
        description: project.description || ''
      });
    } catch (error) {
      console.error('Failed to fetch project');
      toast.error('Failed to load project data');
      navigate('/active-projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // ✅ SOC 2: Clear error on field change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleMultiSelectChange = (field, values) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Array.isArray(values) ? values : []
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // ✅ SOC 2: Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required';
    } else if (formData.project_name.length < 3) {
      newErrors.project_name = 'Project name must be at least 3 characters';
    } else if (formData.project_name.length > 100) {
      newErrors.project_name = 'Project name must be less than 100 characters';
    }

    if (!formData.project_type || formData.project_type.length === 0) {
      newErrors.project_type = 'Please select at least one project type';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (
      formData.start_date &&
      formData.end_date &&
      formData.start_date >= formData.end_date
    ) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSaving(true);
    try {
      // ✅ SOC 2: Sanitize data before submission
      const submitData = {
        ...formData,
        start_date: formData.start_date
          ? formData.start_date.toISOString()
          : null,
        end_date: formData.end_date ? formData.end_date.toISOString() : null,
        project_name: formData.project_name.trim(),
        description: formData.description.trim()
      };

      if (isEditMode) {
        // ✅ SOC 2: Update existing project with proper error handling
        await updateProject(projectId, submitData);
        toast.success('Project updated successfully!');
      } else {
        // ✅ SOC 2: Create new project with proper error handling
        await createProject(submitData);
        toast.success('Project created successfully!');
      }

      navigate('/active-projects');
    } catch (error) {
      console.error('Failed to save project');
      toast.error(error.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // ✅ SOC 2: Safe client options mapping
  const clientOptions = clients.map((client) => ({
    value: client._id || client.id,
    label: client.client_name || client.clientName || client.name || 'Unknown'
  }));

  // ✅ SOC 2: Safe tester options mapping
  const testerOptions = testers.map((tester) => ({
    value: tester._id || tester.id,
    label: tester.name || 'Unknown Tester'
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
          aria-label="Go back to previous page"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <ProjectIcon className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? 'Edit Project' : 'Create New Project'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update project details and information'
                : 'Set up a new penetration testing project'}
            </p>
          </div>
        </div>
      </div>

      {/* ========== FORM ========== */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== BASIC INFORMATION CARD ========== */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Basic Information
          </h2>

          <div className="space-y-5">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={clientOptions}
                value={formData.clientId}
                onChange={(value) =>
                  handleChange({ target: { name: 'clientId', value } })
                }
                placeholder="Select a client..."
                error={errors.clientId}
                className="w-full"
                aria-label="Select a client"
              />
              {errors.clientId && (
                <p className="mt-2 text-sm text-red-600">{errors.clientId}</p>
              )}
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                placeholder="Enter project name"
                maxLength={100}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.project_name ? 'border-red-500' : 'border-input'
                }`}
                aria-label="Project name"
                aria-invalid={!!errors.project_name}
              />
              {errors.project_name && (
                <p className="mt-2 text-sm text-red-600">{errors.project_name}</p>
              )}
            </div>

            {/* Project Types */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project Types <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                options={projectTypeOptions}
                value={formData.project_type}
                onChange={(values) =>
                  handleMultiSelectChange('project_type', values)
                }
                placeholder="Select project types..."
                error={errors.project_type}
                aria-label="Select project types"
              />
              {errors.project_type && (
                <p className="mt-2 text-sm text-red-600">{errors.project_type}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Select one or more testing types for this project
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={statusOptions}
                value={formData.status}
                onChange={(value) =>
                  handleChange({ target: { name: 'status', value } })
                }
                placeholder="Select status..."
                className="w-full"
                aria-label="Select project status"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description{' '}
                <span className="text-muted-foreground text-xs">(Optional)</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description or scope..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                aria-label="Project description"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Describe the project scope, objectives, or any additional
                information ({formData.description.length}/1000)
              </p>
            </div>
          </div>
        </div>

        {/* ========== TIMELINE CARD ========== */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Project Timeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.start_date}
                onChange={(date) => handleDateChange('start_date', date)}
                placeholder="Select start date"
                showToday={true}
                error={errors.start_date}
                aria-label="Select project start date"
              />
              {errors.start_date && (
                <p className="mt-2 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.end_date}
                onChange={(date) => handleDateChange('end_date', date)}
                placeholder="Select end date"
                showToday={true}
                minDate={formData.start_date || new Date()}
                error={errors.end_date}
                aria-label="Select project end date"
              />
              {errors.end_date && (
                <p className="mt-2 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* ✅ SOC 2: Timeline Preview */}
          {(formData.start_date || formData.end_date) && (
            <div className="mt-6 p-4 bg-muted/30 border border-border rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Timeline Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {formData.start_date && (
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground mt-1">
                      {formData.start_date.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {formData.end_date && (
                  <div>
                    <p className="text-muted-foreground">End Date</p>
                    <p className="font-medium text-foreground mt-1">
                      {formData.end_date.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {formData.start_date && formData.end_date && (
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground mt-1">
                      {Math.ceil(
                        (formData.end_date - formData.start_date) /
                        (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========== TEAM ASSIGNMENT CARD ========== */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Team Assignment
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Assigned Testers{' '}
              <span className="text-muted-foreground text-xs">(Optional)</span>
            </label>
            <MultiSelect
              options={testerOptions}
              value={formData.assigned_testers}
              onChange={(values) =>
                handleMultiSelectChange('assigned_testers', values)
              }
              placeholder="Select team members..."
              aria-label="Select assigned testers"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Select penetration testers to assign to this project
            </p>

            {/* ✅ SOC 2: Team Preview */}
            {formData.assigned_testers.length > 0 && (
              <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg">
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Team Members ({formData.assigned_testers.length})
                </h3>
                <div className="space-y-2">
                  {formData.assigned_testers.map((testerId) => {
                    const tester = testers.find((t) => t._id === testerId);
                    return (
                      <div
                        key={testerId}
                        className="flex items-center gap-3 p-2 bg-background rounded-lg"
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {tester?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {tester?.name || 'Unknown Tester'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tester?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6 py-3 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel and go back"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              isEditMode ? 'Update project' : 'Create new project'
            }
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditMode ? 'Updating Project...' : 'Creating Project...'}
              </>
            ) : (
              <>
                <SaveIcon className="w-5 h-5" />
                {isEditMode ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectPage;
