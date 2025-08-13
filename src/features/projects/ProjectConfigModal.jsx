// =======================================================================
// FILE: src/features/projects/ProjectConfigModal.jsx (DATABASE SCHEMA ALIGNED)
// PURPOSE: Modal for creating and editing project configuration with database schema fields only
// =======================================================================
import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import { getProjectConfig, saveProjectConfig } from '../../api/projectDetailsApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons (keeping all existing icons)
const ConfigIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ScopeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CheckboxIcon = ({ checked }) => (
  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
    checked 
      ? 'bg-primary border-primary text-primary-foreground' 
      : 'border-input bg-background'
  }`}>
    {checked && (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )}
  </div>
);

// ✅ DATABASE SCHEMA ALIGNED: Default configuration values
const defaultConfig = {
  reportDetails: {
    reportDocName: '',
    clientName: '',
    version: '1.0',
    exhibit: ''
  },
  scope: {
    testingType: '',
    domains: [],
    functionalityNotTested: '',
    appDescription: ''
  },
  methodology: {
    // teamMembers: [],
    communicationMethods: '',
    cvssIncluded: true,
    businessRisk: false,
    sessionManagement: '',
    userRoleTested: '',
    limitations: ''
  },
  notes: ''
};

const ProjectConfigModal = ({ isOpen, onClose, project, onConfigSaved }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('report');
  const [isEditMode, setIsEditMode] = useState(false);
  const { theme, color } = useTheme();

  useEffect(() => {
    if (isOpen && project?._id) {
      loadConfig();
    }
  }, [isOpen, project?._id]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectConfig(project._id);
      if (response.data && Object.keys(response.data).length > 0) {
        setIsEditMode(true);
        // ✅ DATABASE SCHEMA ALIGNED: Proper nested structure mapping
        setConfig({
          reportDetails: {
            ...defaultConfig.reportDetails,
            ...response.data.reportDetails
          },
          scope: {
            ...defaultConfig.scope,
            ...response.data.scope,
            domains: response.data.scope?.domains || []
          },
          methodology: {
            ...defaultConfig.methodology,
            ...response.data.methodology,
            // teamMembers: response.data.methodology?.teamMembers || []
          },
          notes: response.data.notes || ''
        });
      } else {
        setIsEditMode(false);
        setConfig({
          ...defaultConfig,
          reportDetails: {
            ...defaultConfig.reportDetails,
            reportDocName: `${project.project_name} - Penetration Testing Report`,
            clientName: project.clientId?.clientName || project.clientName || ''
          },
          scope: {
            ...defaultConfig.scope,
            appDescription: `Penetration testing assessment for ${project.project_name}`
          }
        });
      }
    } catch (error) {
      console.error('Error loading project config:', error);
      setIsEditMode(false);
      setConfig({
        ...defaultConfig,
        reportDetails: {
          ...defaultConfig.reportDetails,
          reportDocName: `${project.project_name} - Penetration Testing Report`,
          clientName: project.clientId?.clientName || project.clientName || ''
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ DATABASE SCHEMA ALIGNED: Handle nested field changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: finalValue
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: finalValue
      }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // ✅ DATABASE SCHEMA ALIGNED: Handle array fields (domains, teamMembers)
  const handleArrayChange = useCallback((section, field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: arrayValue
      }
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!config.reportDetails.reportDocName?.trim()) {
      newErrors['reportDetails.reportDocName'] = 'Report document name is required';
    }
    if (!config.reportDetails.clientName?.trim()) {
      newErrors['reportDetails.clientName'] = 'Client name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsSaving(true);
    try {
      await saveProjectConfig(project._id, config);
      toast.success(isEditMode ? 'Project configuration updated successfully!' : 'Project configuration created successfully!');
      onConfigSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving project config:', error);
      toast.error('Failed to save project configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setConfig(defaultConfig);
    setErrors({});
    setActiveTab('report');
    setIsEditMode(false);
    onClose();
  };

  const FormCheckbox = ({ label, checked, onChange, description, name }) => (
    <div className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <button
        type="button"
        onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
        className="mt-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
      >
        <CheckboxIcon checked={checked} />
      </button>
      <div className="flex-1">
        <label 
          onClick={() => onChange({ target: { name, type: 'checkbox', checked: !checked } })}
          className="text-sm font-semibold text-card-foreground cursor-pointer block"
        >
          {label}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'report', label: 'Report Details', icon: ReportIcon },
    { id: 'scope', label: 'Scope & Testing', icon: ScopeIcon },
    { id: 'methodology', label: 'Methodology', icon: ShieldIcon },
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="7xl" showCloseButton={false}>
      <div className={`${theme} theme-${color} flex flex-col max-h-[90vh]`}>
        {/* Header - UI Unchanged */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ConfigIcon className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isEditMode ? 'Edit Project Configuration' : 'Create Project Configuration'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditMode ? 'Update settings' : 'Configure settings'} for {project?.project_name}
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

        {/* Tab Navigation - UI Unchanged */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-white dark:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content - ✅ ONLY FIELDS CHANGED */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading configuration...
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {activeTab === 'report' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Report Document Name"
                      name="reportDetails.reportDocName"
                      value={config.reportDetails.reportDocName}
                      onChange={handleChange}
                      placeholder="Enter report document name"
                      required
                      error={errors['reportDetails.reportDocName']}
                      description="Name of the report document"
                    />

                    <FormInput
                      label="Client Name"
                      name="reportDetails.clientName"
                      value={config.reportDetails.clientName}
                      onChange={handleChange}
                      placeholder="Enter client name"
                      required
                      error={errors['reportDetails.clientName']}
                      description="Name of the client organization"
                    />

                    <FormInput
                      label="Version"
                      name="reportDetails.version"
                      value={config.reportDetails.version}
                      onChange={handleChange}
                      placeholder="e.g., v1.0, v2.1"
                      description="Version number of this report"
                    />

                    <FormInput
                      label="Exhibit"
                      name="reportDetails.exhibit"
                      value={config.reportDetails.exhibit}
                      onChange={handleChange}
                      placeholder="Enter exhibit information"
                      description="Exhibit reference or identifier"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'scope' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Testing Type"
                      name="scope.testingType"
                      value={config.scope.testingType}
                      onChange={handleChange}
                      placeholder="e.g., Web Application, Network, API"
                      description="Type of penetration testing being performed"
                    />

                    <FormInput
                      label="Domains"
                      name="domains"
                      value={config.scope.domains.join(', ')}
                      onChange={(e) => handleArrayChange('scope', 'domains', e.target.value)}
                      placeholder="domain1.com, domain2.com"
                      description="Comma-separated list of domains in scope"
                    />
                  </div>

                  <FormInput
                    label="Application Description"
                    name="scope.appDescription"
                    type="textarea"
                    value={config.scope.appDescription}
                    onChange={handleChange}
                    placeholder="Describe the application being tested..."
                    description="Detailed description of the application or system"
                  />

                  <FormInput
                    label="Functionality Not Tested"
                    name="scope.functionalityNotTested"
                    type="textarea"
                    value={config.scope.functionalityNotTested}
                    onChange={handleChange}
                    placeholder="Describe any functionality that was not tested..."
                    description="List any features or functionality excluded from testing"
                  />
                </div>
              )}

              {activeTab === 'methodology' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* <FormInput
                      label="Team Members"
                      name="teamMembers"
                      value={config.methodology.teamMembers.join(', ')}
                      onChange={(e) => handleArrayChange('methodology', 'teamMembers', e.target.value)}
                      placeholder="John Doe, Jane Smith"
                      description="Comma-separated list of team members"
                    /> */}

                    <FormInput
                      label="Communication Methods"
                      name="methodology.communicationMethods"
                      value={config.methodology.communicationMethods}
                      onChange={handleChange}
                      placeholder="Email, Slack, Teams"
                      description="Methods used for communication during testing"
                    />

                    <FormInput
                      label="Session Management"
                      name="methodology.sessionManagement"
                      value={config.methodology.sessionManagement}
                      onChange={handleChange}
                      placeholder="Describe session management approach"
                      description="How sessions were managed during testing"
                    />

                    <FormInput
                      label="User Role Tested"
                      name="methodology.userRoleTested"
                      value={config.methodology.userRoleTested}
                      onChange={handleChange}
                      placeholder="Admin, User, Guest"
                      description="User roles that were tested"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormCheckbox
                      label="CVSS Included"
                      name="methodology.cvssIncluded"
                      checked={config.methodology.cvssIncluded}
                      onChange={handleChange}
                      description="Include CVSS scores in vulnerability ratings"
                    />

                    <FormCheckbox
                      label="Business Risk Assessment"
                      name="methodology.businessRisk"
                      checked={config.methodology.businessRisk}
                      onChange={handleChange}
                      description="Include business risk assessment in findings"
                    />
                  </div>

                  <FormInput
                    label="Limitations"
                    name="methodology.limitations"
                    type="textarea"
                    value={config.methodology.limitations}
                    onChange={handleChange}
                    placeholder="Describe any limitations of the testing..."
                    description="Any constraints or limitations that affected the testing"
                  />

                  <FormInput
                    label="Notes"
                    name="notes"
                    type="textarea"
                    value={config.notes}
                    onChange={handleChange}
                    placeholder="Additional notes about the project..."
                    description="General notes about the project configuration"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - UI Unchanged */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving || isLoading}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <SaveIcon />
                {isEditMode ? 'Update Configuration' : 'Save Configuration'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectConfigModal;
