// =======================================================================
// FILE: src/features/vulnerabilities/AddEditVulnModal.jsx (UPDATED)
// PURPOSE: Modal for adding and editing vulnerabilities with theme support.
// =======================================================================
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import RichTextEditor from '../../components/RichTextEditor';
import SearchableDropdown from '../../components/SearchableDropdown';
import { createVulnerability, updateVulnerability } from '../../api/vulnerabilityApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const BugIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m0 0V6a2 2 0 012-2h6a2 2 0 012 2v2m-3 0V4" />
  </svg>
);

const AddEditVulnModal = ({ isOpen, onClose, onSave, vulnToEdit }) => {
  const [formData, setFormData] = useState({
    vulnName: '',
    vulnType: 'Web Application',
    severity: 'Medium',
    description: '',
    impact: '',
    remediation: '',
    references: '',
    cvssScore: '',
    cweId: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { theme, color } = useTheme();
  
  const isEditMode = !!vulnToEdit;

  // Vulnerability type options
  const vulnTypeOptions = [
    { value: 'Web Application', label: 'Web Application' },
    { value: 'Network', label: 'Network' },
    { value: 'Mobile Application', label: 'Mobile Application' },
    { value: 'API', label: 'API' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Social Engineering', label: 'Social Engineering' },
    { value: 'Physical Security', label: 'Physical Security' },
    { value: 'Other', label: 'Other' }
  ];

  // Severity options with colors
  const severityOptions = [
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Informational', label: 'Informational' }
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'text-red-600 bg-red-50 border-red-200',
      'High': 'text-orange-600 bg-orange-50 border-orange-200',
      'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Low': 'text-green-600 bg-green-50 border-green-200',
      'Informational': 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[severity] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && vulnToEdit) {
        setFormData({
          vulnName: vulnToEdit.vulnName || '',
          vulnType: vulnToEdit.vulnType || 'Web Application',
          severity: vulnToEdit.severity || 'Medium',
          description: vulnToEdit.description || '',
          impact: vulnToEdit.impact || '',
          remediation: vulnToEdit.remediation || '',
          references: vulnToEdit.references || '',
          cvssScore: vulnToEdit.cvssScore || '',
          cweId: vulnToEdit.cweId || ''
        });
      } else {
        setFormData({
          vulnName: '',
          vulnType: 'Web Application',
          severity: 'Medium',
          description: '',
          impact: '',
          remediation: '',
          references: '',
          cvssScore: '',
          cweId: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, vulnToEdit, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRichTextChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vulnName.trim()) {
      newErrors.vulnName = 'Vulnerability name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.impact.trim()) {
      newErrors.impact = 'Impact description is required';
    }
    
    if (!formData.remediation.trim()) {
      newErrors.remediation = 'Remediation steps are required';
    }
    
    if (formData.cvssScore && (isNaN(formData.cvssScore) || formData.cvssScore < 0 || formData.cvssScore > 10)) {
      newErrors.cvssScore = 'CVSS Score must be a number between 0 and 10';
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
        await updateVulnerability(vulnToEdit._id, formData);
        toast.success("Vulnerability updated successfully!");
      } else {
        await createVulnerability(formData);
        toast.success("Vulnerability created successfully!");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving vulnerability:', error);
      toast.error(error.message || 'Failed to save vulnerability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      vulnName: '',
      vulnType: 'Web Application',
      severity: 'Medium',
      description: '',
      impact: '',
      remediation: '',
      references: '',
      cvssScore: '',
      cweId: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BugIcon className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {isEditMode ? 'Edit Vulnerability' : 'Add New Vulnerability'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update vulnerability details' : 'Create a new vulnerability entry'}
              </p>
            </div>
          </div>
        }
        size="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vulnerability Name */}
            <div className="md:col-span-2">
              <label htmlFor="vulnName" className="block text-sm font-medium text-card-foreground mb-2">
                Vulnerability Name *
              </label>
              <input
                type="text"
                id="vulnName"
                name="vulnName"
                value={formData.vulnName}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 border rounded-lg bg-background text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                  ${errors.vulnName ? 'border-red-500' : 'border-input'}
                  transition-all duration-200
                `}
                placeholder="e.g., SQL Injection in Login Form"
                disabled={isSaving}
              />
              {errors.vulnName && (
                <p className="mt-1 text-sm text-red-500">{errors.vulnName}</p>
              )}
            </div>

            {/* Vulnerability Type */}
            <div>
              <SearchableDropdown
                label="Vulnerability Type"
                options={vulnTypeOptions}
                value={formData.vulnType}
                onChange={(value) => handleChange({ target: { name: 'vulnType', value } })}
                placeholder="Select vulnerability type"
                disabled={isSaving}
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Severity Level *
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                disabled={isSaving}
              >
                {severityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {formData.severity && (
                <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getSeverityColor(formData.severity)}`}>
                  <AlertTriangleIcon className="w-3 h-3 mr-1" />
                  {formData.severity}
                </div>
              )}
            </div>

            {/* CVSS Score */}
            <div>
              <label htmlFor="cvssScore" className="block text-sm font-medium text-card-foreground mb-2">
                CVSS Score (Optional)
              </label>
              <input
                type="number"
                id="cvssScore"
                name="cvssScore"
                min="0"
                max="10"
                step="0.1"
                value={formData.cvssScore}
                onChange={handleChange}
                className={`
                  w-full px-4 py-3 border rounded-lg bg-background text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                  ${errors.cvssScore ? 'border-red-500' : 'border-input'}
                  transition-all duration-200
                `}
                placeholder="0.0 - 10.0"
                disabled={isSaving}
              />
              {errors.cvssScore && (
                <p className="mt-1 text-sm text-red-500">{errors.cvssScore}</p>
              )}
            </div>

            {/* CWE ID */}
            <div>
              <label htmlFor="cweId" className="block text-sm font-medium text-card-foreground mb-2">
                CWE ID (Optional)
              </label>
              <input
                type="text"
                id="cweId"
                name="cweId"
                value={formData.cweId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                placeholder="e.g., CWE-89"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <RichTextEditor
              label="Description *"
              value={formData.description}
              onChange={(value) => handleRichTextChange('description', value)}
              placeholder="Provide a detailed description of the vulnerability..."
              error={errors.description}
              disabled={isSaving}
              height={150}
            />
          </div>

          {/* Impact */}
          <div>
            <RichTextEditor
              label="Impact *"
              value={formData.impact}
              onChange={(value) => handleRichTextChange('impact', value)}
              placeholder="Describe the potential impact if this vulnerability is exploited..."
              error={errors.impact}
              disabled={isSaving}
              height={150}
            />
          </div>

          {/* Remediation */}
          <div>
            <RichTextEditor
              label="Remediation Steps *"
              value={formData.remediation}
              onChange={(value) => handleRichTextChange('remediation', value)}
              placeholder="Provide step-by-step remediation instructions..."
              error={errors.remediation}
              disabled={isSaving}
              height={150}
            />
          </div>

          {/* References */}
          <div>
            <RichTextEditor
              label="References (Optional)"
              value={formData.references}
              onChange={(value) => handleRichTextChange('references', value)}
              placeholder="Add relevant links, CVE numbers, or other references..."
              disabled={isSaving}
              height={100}
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
                  {isEditMode ? 'Update Vulnerability' : 'Create Vulnerability'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AddEditVulnModal;
