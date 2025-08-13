// =======================================================================
// FILE: src/features/projects/AddEditProjectModal.jsx (COMPLETE WITH MODERN DATEPICKER)
// PURPOSE: Modal for adding and editing projects with modern date picker integration
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import MultiSelect from '../../components/MultiSelect';
import SearchableDropdown from '../../components/SearchableDropdown';
import DatePicker from '../../components/DatePicker';
import { createProject, updateProject } from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import { getTesters } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AddEditProjectModal = ({ isOpen, onClose, onSave, projectToEdit, clientId }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    project_name: '',
    projectType: [],
    projectStart: null,  // ✅ Changed to null for Date objects
    projectEnd: null,    // ✅ Changed to null for Date objects
    assets: []
  });

  const [clients, setClients] = useState([]);
  const [testers, setTesters] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { theme, color } = useTheme();

  const isEditMode = !!projectToEdit;

  const projectTypeOptions = [
    { value: 'Web Application', label: 'Web Application' },
    { value: 'Mobile Application', label: 'Mobile Application' },
    { value: 'Network', label: 'Network' },
    { value: 'API', label: 'API Testing' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Social Engineering', label: 'Social Engineering' },
    { value: 'Physical Security', label: 'Physical Security' },
    { value: 'Wireless', label: 'Wireless Security' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, testersRes] = await Promise.all([
          getAllClients(),
          getTesters()
        ]);
        setClients(clientsRes.data || []);
        setTesters(testersRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load necessary data.");
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && projectToEdit) {
        setFormData({
          clientId: projectToEdit.clientId || '',
          project_name: projectToEdit.project_name || '',
          projectType: Array.isArray(projectToEdit.projectType) 
            ? projectToEdit.projectType 
            : projectToEdit.projectType 
              ? [projectToEdit.projectType] 
              : [],
          // ✅ Properly handle Date objects
          projectStart: projectToEdit.projectStart ? new Date(projectToEdit.projectStart) : null,
          projectEnd: projectToEdit.projectEnd ? new Date(projectToEdit.projectEnd) : null,
          assets: Array.isArray(projectToEdit.assets) 
            ? projectToEdit.assets.map(a => a._id || a) 
            : []
        });
      } else {
        setFormData({
          clientId: clientId || '',
          project_name: '',
          projectType: [],
          projectStart: null,
          projectEnd: null,
          assets: []
        });
      }
      setErrors({});
    }
  }, [projectToEdit, isOpen, isEditMode, clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // ✅ Enhanced date change handler
  const handleDateChange = (field, date) => {
    setFormData(prev => ({ ...prev, [field]: date }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMultiSelectChange = (field, values) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: Array.isArray(values) ? values : []
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Please select a client';
    }
    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required';
    }
    if (!formData.projectType || formData.projectType.length === 0) {
      newErrors.projectType = 'Please select at least one project type';
    }
    // ✅ Enhanced date validation
    // if (formData.projectStart && formData.projectEnd) {
    //   if (formData.projectStart >= formData.projectEnd) {
    //     newErrors.projectEnd = 'End date must be after start date';
    //   }
    // }

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
      // ✅ Prepare data for API (convert dates to ISO strings if needed)
      const submitData = {
        ...formData,
        projectStart: formData.projectStart ? formData.projectStart.toISOString() : null,
        projectEnd: formData.projectEnd ? formData.projectEnd.toISOString() : null,
      };

      if (isEditMode) {
        await updateProject(projectToEdit._id, submitData);
        toast.success("Project updated successfully!");
      } else {
        await createProject(submitData);
        toast.success("Project created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error(error.message || 'Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      clientId: clientId || '',
      project_name: '',
      projectType: [],
      projectStart: null,
      projectEnd: null,
      assets: []
    });
    setErrors({});
    onClose();
  };

  // Convert clients to dropdown options
  const clientOptions = clients.map(client => ({
    value: client._id,
    label: client.clientName || 'Unknown Client'
  }));

  // Convert testers to multiselect options
  const testerOptions = testers.map(tester => ({
    value: tester._id,
    label: tester.name || 'Unknown Tester'
  }));

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl" showCloseButton={false}>
      <div className={`${theme} theme-${color} flex flex-col max-h-[90vh]`}>
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ProjectIcon className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isEditMode ? 'Edit Project' : 'Create Project'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditMode ? 'Update project information' : 'Create a new penetration testing project'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
            disabled={isSaving}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <InfoIcon className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={clientOptions}
                    value={formData.clientId}
                    onChange={(value) => handleChange({ target: { name: 'clientId', value } })}
                    placeholder="Select a client..."
                    error={errors.clientId}
                    className="w-full"
                  />
                  {errors.clientId && <p className="text-sm text-red-600">{errors.clientId}</p>}
                </div>

                {/* Project Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                    placeholder="Enter project name"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.project_name && <p className="text-sm text-red-600">{errors.project_name}</p>}
                </div>
              </div>

              {/* Project Types */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Types <span className="text-red-500">*</span>
                </label>
                <MultiSelect
                  options={projectTypeOptions}
                  value={formData.projectType || []}
                  onChange={(values) => handleMultiSelectChange('projectType', values)}
                  placeholder="Select project types..."
                  error={errors.projectType}
                />
                {errors.projectType && <p className="text-sm text-red-600">{errors.projectType}</p>}
                <p className="text-sm text-gray-500">Select one or more testing types for this project</p>
              </div>
            </div>

            {/* Project Timeline Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <CalendarIcon className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Timeline</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ✅ Modern Start Date Picker */}
                <DatePicker
                  label="Start Date"
                  value={formData.projectStart}
                  onChange={(date) => handleDateChange('projectStart', date)}
                  placeholder="Select start date"
                  showToday={true}
                  // minDate={new Date()} // Disable past dates
                />

                {/* ✅ Modern End Date Picker */}
                <DatePicker
                  label="End Date"
                  value={formData.projectEnd}
                  onChange={(date) => handleDateChange('projectEnd', date)}
                  placeholder="Select end date"
                  showToday={true}
                  minDate={formData.projectStart || new Date()} // End date can't be before start date
                  error={errors.projectEnd}
                />
              </div>

              {/* Timeline Preview */}
              {(formData.projectStart || formData.projectEnd) && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                    <CalendarIcon />
                    Project Timeline Preview
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.projectStart && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 dark:text-green-300">Start:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {formData.projectStart.toLocaleDateString('en-GB', { 
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {formData.projectEnd && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-green-700 dark:text-green-300">End:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {formData.projectEnd.toLocaleDateString('en-GB', { 
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {formData.projectStart && formData.projectEnd && (
                      <div className="md:col-span-2 pt-2 border-t border-green-200 dark:border-green-700">
                        <span className="text-green-700 dark:text-green-300 text-sm">Duration: </span>
                        <span className="font-medium text-green-800 dark:text-green-200 text-sm">
                          {Math.ceil((formData.projectEnd - formData.projectStart) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Team Assignment Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                <TeamIcon className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Team Assignment</h3>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned Testers
                </label>
                <MultiSelect
                  options={testerOptions}
                  value={formData.assets || []}
                  onChange={(values) => handleMultiSelectChange('assets', values)}
                  placeholder="Select team members..."
                />
                <p className="text-sm text-gray-500">Select penetration testers to assign to this project</p>
              </div>
            </div>

            {/* Project Summary */}
            {(formData.projectType.length > 0 || formData.assets.length > 0) && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <SettingsIcon className="text-blue-600" />
                  Project Summary
                </h4>
                
                {formData.projectType.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Testing Types ({formData.projectType.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.projectType.map((type, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-lg font-medium">
                          <SettingsIcon className="w-3 h-3 mr-2" />
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {formData.assets.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Team Members ({formData.assets.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.assets.map(testerId => {
                        const tester = testers.find(t => t._id === testerId);
                        return (
                          <div key={testerId} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <UserIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                                {tester?.name || 'Unknown Tester'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {tester?.email || 'No email provided'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <SaveIcon />
                {isEditMode ? 'Update Project' : 'Create Project'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddEditProjectModal;
