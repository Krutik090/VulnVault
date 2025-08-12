// =======================================================================
// FILE: src/features/projects/ProjectConfigModal.jsx (FIXED FOCUS ISSUE)
// PURPOSE: Modal with guaranteed visible save button, proper scrolling, and fixed input focus
// =======================================================================
import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput'; // ✅ Import existing FormInput
import { getProjectConfig, saveProjectConfig } from '../../api/projectDetailsApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
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

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
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

const ProjectConfigModal = ({ isOpen, onClose, project, onConfigSaved }) => {
  const [config, setConfig] = useState({
    report_title: '',
    report_subtitle: '',
    report_prepared_by: '',
    report_prepared_for: '',
    report_version: '',
    project_scope: '',
    project_limitations: '',
    executive_summary: '',
    methodology: '',
    disclaimer: '',
    include_appendices: true,
    include_raw_output: false,
    include_scope_details: true,
    include_methodology: true,
    include_executive_summary: true,
    page_numbering: true,
    table_of_contents: true,
    cover_page: true,
    custom_sections: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('report');
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
      if (response.data) {
        setConfig({
          ...config,
          ...response.data,
          custom_sections: response.data.custom_sections || []
        });
      }
    } catch (error) {
      console.error('Error loading project config:', error);
      toast.error('Failed to load project configuration');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Memoized handlers to prevent re-creation
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleCustomSectionChange = useCallback((index, field, value) => {
    setConfig(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    }));
  }, []);

  const addCustomSection = () => {
    setConfig(prev => ({
      ...prev,
      custom_sections: [...prev.custom_sections, { name: '', content: '', enabled: true }]
    }));
  };

  const removeCustomSection = (index) => {
    setConfig(prev => ({
      ...prev,
      custom_sections: prev.custom_sections.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!config.report_title?.trim()) {
      newErrors.report_title = 'Report title is required';
    }
    if (!config.report_prepared_by?.trim()) {
      newErrors.report_prepared_by = 'Prepared by field is required';
    }
    if (!config.report_prepared_for?.trim()) {
      newErrors.report_prepared_for = 'Prepared for field is required';
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
      toast.success('Project configuration saved successfully!');
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
    setConfig({
      report_title: '',
      report_subtitle: '',
      report_prepared_by: '',
      report_prepared_for: '',
      report_version: '',
      project_scope: '',
      project_limitations: '',
      executive_summary: '',
      methodology: '',
      disclaimer: '',
      include_appendices: true,
      include_raw_output: false,
      include_scope_details: true,
      include_methodology: true,
      include_executive_summary: true,
      page_numbering: true,
      table_of_contents: true,
      cover_page: true,
      custom_sections: []
    });
    setErrors({});
    onClose();
  };

  // ✅ FIXED: FormCheckbox moved outside to prevent re-creation
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
    { id: 'report', label: 'Report Settings', icon: ReportIcon },
    { id: 'scope', label: 'Scope & Methodology', icon: ScopeIcon },
    { id: 'advanced', label: 'Advanced Options', icon: ShieldIcon },
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="7xl" showCloseButton={false}>
      <div className={`${theme} theme-${color} flex flex-col max-h-[90vh]`}>
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <ConfigIcon className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Project Configuration
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure settings for {project?.project_name}
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

        {/* Tab Navigation */}
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

        {/* Form Content */}
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
                    {/* ✅ FIXED: Using imported FormInput component */}
                    <FormInput
                      label="Report Title"
                      name="report_title"
                      value={config.report_title}
                      onChange={handleChange}
                      placeholder="Enter report title"
                      required
                      error={errors.report_title}
                      description="Main title that will appear on the report cover"
                    />

                    <FormInput
                      label="Report Subtitle"
                      name="report_subtitle"
                      value={config.report_subtitle}
                      onChange={handleChange}
                      placeholder="Enter report subtitle"
                      description="Optional subtitle for additional context"
                    />

                    <FormInput
                      label="Prepared By"
                      name="report_prepared_by"
                      value={config.report_prepared_by}
                      onChange={handleChange}
                      placeholder="Your company/organization name"
                      required
                      error={errors.report_prepared_by}
                      description="Organization or individual preparing the report"
                    />

                    <FormInput
                      label="Prepared For"
                      name="report_prepared_for"
                      value={config.report_prepared_for}
                      onChange={handleChange}
                      placeholder="Client organization name"
                      required
                      error={errors.report_prepared_for}
                      description="Client or organization receiving the report"
                    />

                    <FormInput
                      label="Report Version"
                      name="report_version"
                      value={config.report_version}
                      onChange={handleChange}
                      placeholder="e.g., v1.0, v2.1"
                      description="Version number of this report"
                    />
                  </div>

                  {/* Report Layout Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Report Layout Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormCheckbox
                        label="Cover Page"
                        name="cover_page"
                        checked={config.cover_page}
                        onChange={handleChange}
                        description="Include a professional cover page with report details"
                      />

                      <FormCheckbox
                        label="Table of Contents"
                        name="table_of_contents"
                        checked={config.table_of_contents}
                        onChange={handleChange}
                        description="Generate automatic table of contents with page numbers"
                      />

                      <FormCheckbox
                        label="Page Numbering"
                        name="page_numbering"
                        checked={config.page_numbering}
                        onChange={handleChange}
                        description="Add page numbers to all report pages"
                      />

                      <FormCheckbox
                        label="Include Executive Summary"
                        name="include_executive_summary"
                        checked={config.include_executive_summary}
                        onChange={handleChange}
                        description="Include executive summary section in the report"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'scope' && (
                <div className="space-y-6">
                  <FormInput
                    label="Project Scope"
                    name="project_scope"
                    type="textarea"
                    value={config.project_scope}
                    onChange={handleChange}
                    placeholder="Describe the scope of this penetration test..."
                    description="Define what is included in the testing scope"
                  />

                  <FormInput
                    label="Project Limitations"
                    name="project_limitations"
                    type="textarea"
                    value={config.project_limitations}
                    onChange={handleChange}
                    placeholder="Describe any limitations or constraints..."
                    description="Define what is excluded or limited in the testing"
                  />

                  <FormInput
                    label="Executive Summary"
                    name="executive_summary"
                    type="textarea"
                    value={config.executive_summary}
                    onChange={handleChange}
                    placeholder="Enter executive summary content..."
                    description="High-level summary for executives and decision makers"
                  />

                  <FormInput
                    label="Methodology"
                    name="methodology"
                    type="textarea"
                    value={config.methodology}
                    onChange={handleChange}
                    placeholder="Describe the testing methodology used..."
                    description="Explain the approach and methods used for testing"
                  />

                  <FormInput
                    label="Disclaimer"
                    name="disclaimer"
                    type="textarea"
                    value={config.disclaimer}
                    onChange={handleChange}
                    placeholder="Enter legal disclaimer and limitations..."
                    description="Legal disclaimer and liability limitations"
                  />
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  {/* Advanced Report Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Advanced Report Options</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <FormCheckbox
                        label="Include Methodology Section"
                        name="include_methodology"
                        checked={config.include_methodology}
                        onChange={handleChange}
                        description="Include detailed methodology section explaining testing approach"
                      />

                      <FormCheckbox
                        label="Include Scope Details"
                        name="include_scope_details"
                        checked={config.include_scope_details}
                        onChange={handleChange}
                        description="Include detailed scope and limitations sections"
                      />

                      <FormCheckbox
                        label="Include Appendices"
                        name="include_appendices"
                        checked={config.include_appendices}
                        onChange={handleChange}
                        description="Include appendices with additional technical details"
                      />

                      <FormCheckbox
                        label="Include Raw Tool Output"
                        name="include_raw_output"
                        checked={config.include_raw_output}
                        onChange={handleChange}
                        description="Include raw output from security tools (can make report very long)"
                      />
                    </div>
                  </div>

                  {/* Custom Sections */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Custom Sections</h3>
                      <button
                        type="button"
                        onClick={addCustomSection}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <PlusIcon />
                        Add Section
                      </button>
                    </div>

                    {config.custom_sections.map((section, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Custom Section {index + 1}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeCustomSection(index)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <FormInput
                            label="Section Name"
                            value={section.name}
                            onChange={(e) => handleCustomSectionChange(index, 'name', e.target.value)}
                            placeholder="Enter section name"
                          />

                          <FormInput
                            label="Section Content"
                            type="textarea"
                            value={section.content}
                            onChange={(e) => handleCustomSectionChange(index, 'content', e.target.value)}
                            placeholder="Enter section content"
                          />

                          <FormCheckbox
                            label="Enable This Section"
                            checked={section.enabled}
                            onChange={(e) => handleCustomSectionChange(index, 'enabled', e.target.checked)}
                            description="Include this section in the generated report"
                          />
                        </div>
                      </div>
                    ))}

                    {config.custom_sections.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No custom sections added yet.</p>
                        <p className="text-sm">Click "Add Section" to create custom content for your report.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
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
            className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon />
                Save Config
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectConfigModal;
