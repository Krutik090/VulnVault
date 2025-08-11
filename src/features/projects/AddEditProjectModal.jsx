// =======================================================================
// FILE: src/features/projects/AddEditProjectModal.jsx (UPDATED)
// PURPOSE: Modal for adding and editing projects with theme support.
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import MultiSelect from '../../components/MultiSelect';
import SearchableDropdown from '../../components/SearchableDropdown';
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
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const AddEditProjectModal = ({ isOpen, onClose, onSave, projectToEdit, clientId }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    project_name: '',
    projectType: [],
    projectStart: '',
    projectEnd: '',
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
            : projectToEdit.projectType ? [projectToEdit.projectType] : [],
          projectStart: projectToEdit.projectStart 
            ? new Date(projectToEdit.projectStart).toISOString().split('T')[0] 
            : '',
          projectEnd: projectToEdit.projectEnd 
            ? new Date(projectToEdit.projectEnd).toISOString().split('T')[0] 
            : '',
          assets: Array.isArray(projectToEdit.assets) 
            ? projectToEdit.assets.map(a => a._id || a) 
            : []
        });
      } else {
        setFormData({
          clientId: clientId || '',
          project_name: '',
          projectType: [],
          projectStart: '',
          projectEnd: '',
          assets: []
        });
      }
      setErrors({});
    }
  }, [projectToEdit, isOpen, isEditMode, clientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleMultiSelectChange = (field, values) => {
    setFormData(prev => ({ ...prev, [field]: values }));
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
    
    if (formData.projectStart && formData.projectEnd) {
      if (new Date(formData.projectStart) > new Date(formData.projectEnd)) {
        newErrors.projectEnd = 'End date must be after start date';
      }
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
      if (isEditMode) {
        await updateProject(projectToEdit._id, formData);
        toast.success("Project updated successfully!");
      } else {
        await createProject(formData);
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
      projectStart: '',
      projectEnd: '',
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

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ProjectIcon className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {isEditMode ? 'Edit Project' : 'Add New Project'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update project details' : 'Create a new penetration testing project'}
              </p>
            </div>
          </div>
        }
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div>
            <SearchableDropdown
              label="Client *"
              options={clientOptions}
              value={formData.clientId}
              onChange={(value) => handleMultiSelectChange('clientId', value)}
              placeholder="Select a client"
              error={errors.clientId}
              required
              disabled={isSaving}
            />
          </div>

          {/* Project Name */}
          <div>
            <label htmlFor="project_name" className="block text-sm font-medium text-card-foreground mb-2">
              Project Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ProjectIcon className="text-muted-foreground" />
              </div>
              <input
                type="text"
                id="project_name"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                  ${errors.project_name ? 'border-red-500' : 'border-input'}
                  transition-all duration-200
                `}
                placeholder="Enter project name"
                disabled={isSaving}
              />
            </div>
            {errors.project_name && (
              <p className="mt-1 text-sm text-red-500">{errors.project_name}</p>
            )}
          </div>

          {/* Project Types */}
          <div>
            <MultiSelect
              label="Project Types *"
              options={projectTypeOptions}
              selected={formData.projectType || []}
              onChange={(values) => handleMultiSelectChange('projectType', values)}
              placeholder="Select project types..."
              error={errors.projectType}
              disabled={isSaving}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label htmlFor="projectStart" className="block text-sm font-medium text-card-foreground mb-2">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="text-muted-foreground" />
                </div>
                <input
                  type="date"
                  id="projectStart"
                  name="projectStart"
                  value={formData.projectStart}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="projectEnd" className="block text-sm font-medium text-card-foreground mb-2">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="text-muted-foreground" />
                </div>
                <input
                  type="date"
                  id="projectEnd"
                  name="projectEnd"
                  value={formData.projectEnd}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground 
                    focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                    ${errors.projectEnd ? 'border-red-500' : 'border-input'}
                    transition-all duration-200
                  `}
                  disabled={isSaving}
                />
              </div>
              {errors.projectEnd && (
                <p className="mt-1 text-sm text-red-500">{errors.projectEnd}</p>
              )}
            </div>
          </div>

          {/* Assigned Testers */}
          <div>
            <MultiSelect
              label="Assigned Testers"
              options={testerOptions}
              selected={formData.assets || []}
              onChange={(values) => handleMultiSelectChange('assets', values)}
              placeholder="Select testers..."
              disabled={isSaving}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-border">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2.5 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
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
        </form>
      </Modal>
    </div>
  );
};

export default AddEditProjectModal;
