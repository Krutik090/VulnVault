// =======================================================================
// FILE: src/features/projects/ProjectConfigModal.jsx (UPDATED)
// PURPOSE: Modal for configuring project settings and report details with theme support.
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { getProjectConfig, saveProjectConfig } from '../../api/projectDetailsApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const ConfigIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckboxIcon = ({ checked }) => (
  <svg className={`w-4 h-4 ${checked ? 'text-primary' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={checked ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
  </svg>
);

const ProjectConfigModal = ({ project, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState({
    reportDetails: {
      version: '',
      classification: '',
      methodology: ''
    },
    scopeInclusions: [],
    scopeExclusions: [],
    testingApproach: {
      blackBox: false,
      whiteBox: false,
      grayBox: false
    },
    complianceFrameworks: {
      owasp: false,
      nist: false,
      pci: false,
      iso27001: false
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { theme, color } = useTheme();

  useEffect(() => {
    if (project && isOpen) {
      const fetchConfig = async () => {
        try {
          const response = await getProjectConfig(project._id);
          if (response.success && response.data) {
            setConfig({
              reportDetails: {
                version: response.data.reportDetails?.version || '',
                classification: response.data.reportDetails?.classification || '',
                methodology: response.data.reportDetails?.methodology || ''
              },
              scopeInclusions: response.data.scopeInclusions || [],
              scopeExclusions: response.data.scopeExclusions || [],
              testingApproach: {
                blackBox: response.data.testingApproach?.blackBox || false,
                whiteBox: response.data.testingApproach?.whiteBox || false,
                grayBox: response.data.testingApproach?.grayBox || false
              },
              complianceFrameworks: {
                owasp: response.data.complianceFrameworks?.owasp || false,
                nist: response.data.complianceFrameworks?.nist || false,
                pci: response.data.complianceFrameworks?.pci || false,
                iso27001: response.data.complianceFrameworks?.iso27001 || false
              }
            });
          }
        } catch (error) {
          console.error('Error loading project config:', error);
          toast.error("Could not load project configuration.");
        }
      };
      fetchConfig();
    }
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!config.reportDetails.version?.trim()) {
      newErrors.version = 'Report version is required';
    }
    
    if (!config.reportDetails.classification?.trim()) {
      newErrors.classification = 'Classification is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSaving(true);
    try {
      await saveProjectConfig(project._id, config);
      toast.success("Configuration saved successfully!");
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (part, field, value) => {
    setConfig(prev => ({
      ...prev,
      [part]: {
        ...prev[part],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSimpleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (part, field, checked) => {
    setConfig(prev => ({
      ...prev,
      [part]: {
        ...prev[part],
        [field]: checked
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setConfig(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const FormInput = ({ label, name, value, onChange, placeholder, required = false, error = null, type = "text", ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-card-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 border rounded-lg bg-background text-foreground 
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          ${error ? 'border-red-500' : 'border-input'}
          transition-all duration-200
        `}
        disabled={isSaving}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );

  const FormTextarea = ({ label, name, value, onChange, placeholder, rows = 3, required = false, error = null }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-card-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full px-4 py-3 border rounded-lg bg-background text-foreground 
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
          ${error ? 'border-red-500' : 'border-input'}
          transition-all duration-200 resize-none
        `}
        disabled={isSaving}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );

  const CheckboxGroup = ({ title, description, options, values, onChange }) => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium text-card-foreground">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <label key={option.key} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={values[option.key] || false}
              onChange={(e) => onChange(option.key, e.target.checked)}
              className="sr-only"
              disabled={isSaving}
            />
            <div className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${values[option.key] ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}
            `}>
              {values[option.key] && <CheckboxIcon checked={true} />}
            </div>
            <span className="text-sm text-card-foreground">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  if (!project) return null;

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ConfigIcon className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Project Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure settings for {project.project_name}
              </p>
            </div>
          </div>
        }
        size="4xl"
      >
        <form onSubmit={handleSave} className="space-y-8">
          {/* Report Details Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <ReportIcon className="text-primary" />
              <h4 className="text-lg font-semibold text-card-foreground">Report Details</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Report Version"
                name="version"
                value={config.reportDetails.version}
                onChange={(e) => handleChange('reportDetails', 'version', e.target.value)}
                placeholder="e.g., v1.0, 2024.1"
                required
                error={errors.version}
              />
              
              <FormInput
                label="Classification"
                name="classification"
                value={config.reportDetails.classification}
                onChange={(e) => handleChange('reportDetails', 'classification', e.target.value)}
                placeholder="e.g., Confidential, Internal Use"
                required
                error={errors.classification}
              />
            </div>

            <FormTextarea
              label="Testing Methodology"
              name="methodology"
              value={config.reportDetails.methodology}
              onChange={(e) => handleChange('reportDetails', 'methodology', e.target.value)}
              placeholder="Describe the testing methodology used for this project..."
              rows={4}
            />
          </div>

          {/* Scope Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <InfoIcon className="text-primary" />
              <h4 className="text-lg font-semibold text-card-foreground">Scope Configuration</h4>
            </div>

            {/* Scope Inclusions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-card-foreground">Scope Inclusions</label>
                <button
                  type="button"
                  onClick={() => addArrayItem('scopeInclusions')}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90 transition-colors"
                  disabled={isSaving}
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {config.scopeInclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('scopeInclusions', index, e.target.value)}
                      placeholder="Enter scope inclusion..."
                      className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('scopeInclusions', index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      disabled={isSaving}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {config.scopeInclusions.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No scope inclusions defined</p>
                )}
              </div>
            </div>

            {/* Scope Exclusions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-card-foreground">Scope Exclusions</label>
                <button
                  type="button"
                  onClick={() => addArrayItem('scopeExclusions')}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-xs hover:bg-secondary/80 transition-colors"
                  disabled={isSaving}
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {config.scopeExclusions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('scopeExclusions', index, e.target.value)}
                      placeholder="Enter scope exclusion..."
                      className="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('scopeExclusions', index)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      disabled={isSaving}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {config.scopeExclusions.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No scope exclusions defined</p>
                )}
              </div>
            </div>
          </div>

          {/* Testing Approach */}
          <div className="space-y-6">
            <CheckboxGroup
              title="Testing Approach"
              description="Select the testing methodologies used for this project"
              options={[
                { key: 'blackBox', label: 'Black Box Testing' },
                { key: 'whiteBox', label: 'White Box Testing' },
                { key: 'grayBox', label: 'Gray Box Testing' }
              ]}
              values={config.testingApproach}
              onChange={(key, checked) => handleCheckboxChange('testingApproach', key, checked)}
            />
          </div>

          {/* Compliance Frameworks */}
          <div className="space-y-6">
            <CheckboxGroup
              title="Compliance Frameworks"
              description="Select applicable compliance frameworks for this assessment"
              options={[
                { key: 'owasp', label: 'OWASP Top 10' },
                { key: 'nist', label: 'NIST Cybersecurity Framework' },
                { key: 'pci', label: 'PCI DSS' },
                { key: 'iso27001', label: 'ISO 27001' }
              ]}
              values={config.complianceFrameworks}
              onChange={(key, checked) => handleCheckboxChange('complianceFrameworks', key, checked)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
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
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectConfigModal;
