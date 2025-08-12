// =======================================================================
// FILE: src/features/vulnerabilities/AddEditVulnModal.jsx (FIXED FOCUS ISSUE)
// PURPOSE: Modal for adding and editing vulnerabilities with enhanced layout and fixed input focus
// =======================================================================
import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import RichTextEditor from '../../components/RichTextEditor';
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
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const BugIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m0 0V6a2 2 0 012-2h6a2 2 0 012 2v2m-3 0V4" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
    cweId: '',
    owaspFamily: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
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
    { value: 'Wireless', label: 'Wireless Security' },
    { value: 'Cloud Security', label: 'Cloud Security' },
    { value: 'Other', label: 'Other' }
  ];

  // Severity options with enhanced colors
  const severityOptions = [
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Informational', label: 'Informational' }
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      'High': 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
      'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      'Low': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      'Informational': 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    };
    return colors[severity] || 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
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
          cweId: vulnToEdit.cweId || '',
          owaspFamily: vulnToEdit.owaspFamily || ''
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
          cweId: '',
          owaspFamily: ''
        });
      }
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, vulnToEdit, isEditMode]);

  // ✅ FIXED: Memoized handlers to prevent re-creation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleRichTextChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

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
      cweId: '',
      owaspFamily: ''
    });
    setErrors({});
    setActiveTab('basic');
    onClose();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: InfoIcon },
    { id: 'details', label: 'Details & Impact', icon: DocumentIcon },
    { id: 'classification', label: 'Classification', icon: ShieldIcon },
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="7xl" showCloseButton={false}>
      <div className={`${theme} theme-${color} flex flex-col max-h-[90vh]`}>
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <BugIcon className="text-red-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {isEditMode ? 'Edit Vulnerability' : 'Add New Vulnerability'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditMode ? 'Update vulnerability details in the database' : 'Create a new vulnerability entry for the database'}
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
                    ? 'text-red-600 border-b-2 border-red-500 bg-white dark:bg-gray-800'
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
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vulnerability Name */}
                  <div className="lg:col-span-2">
                    <FormInput
                      label="Vulnerability Name"
                      name="vulnName"
                      value={formData.vulnName}
                      onChange={handleChange}
                      placeholder="Enter vulnerability name"
                      required
                      error={errors.vulnName}
                      description="A clear, descriptive name for this vulnerability"
                    />
                  </div>

                  {/* Vulnerability Type */}
                  <FormSelect
                    label="Vulnerability Type"
                    name="vulnType"
                    value={formData.vulnType}
                    onChange={handleChange}
                    options={vulnTypeOptions}
                    required
                    description="Category of vulnerability"
                  />

                  {/* Severity */}
                  <FormSelect
                    label="Severity Level"
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    options={severityOptions}
                    required
                    description="Risk level of this vulnerability"
                  />
                </div>

                {/* Current Selection Display */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Current Classification</h4>
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold border ${getSeverityColor(formData.severity)}`}>
                      <AlertTriangleIcon className="w-4 h-4 mr-2" />
                      {formData.severity}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Type: <span className="font-medium">{formData.vulnType}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(data) => handleRichTextChange('description', data)}
                    placeholder="Provide a detailed description of the vulnerability..."
                    height={200}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                      <AlertTriangleIcon />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">Describe the technical details and nature of this vulnerability</p>
                </div>

                {/* Impact */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Impact <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.impact}
                    onChange={(data) => handleRichTextChange('impact', data)}
                    placeholder="Describe the potential impact of this vulnerability..."
                    height={200}
                  />
                  {errors.impact && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                      <AlertTriangleIcon />
                      {errors.impact}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">Explain what could happen if this vulnerability is exploited</p>
                </div>

                {/* Remediation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Remediation <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.remediation}
                    onChange={(data) => handleRichTextChange('remediation', data)}
                    placeholder="Provide steps to fix or mitigate this vulnerability..."
                    height={200}
                  />
                  {errors.remediation && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                      <AlertTriangleIcon />
                      {errors.remediation}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">Provide clear steps to remediate this vulnerability</p>
                </div>

                {/* References */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    References
                  </label>
                  <RichTextEditor
                    value={formData.references}
                    onChange={(data) => handleRichTextChange('references', data)}
                    placeholder="Add any relevant references, links, or documentation..."
                    height={150}
                  />
                  <p className="text-sm text-gray-500 mt-2">Include relevant CVE numbers, articles, or documentation</p>
                </div>
              </div>
            )}

            {activeTab === 'classification' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CVSS Score */}
                  <FormInput
                    label="CVSS Score"
                    name="cvssScore"
                    type="number"
                    value={formData.cvssScore}
                    onChange={handleChange}
                    placeholder="0.0 - 10.0"
                    min="0"
                    max="10"
                    step="0.1"
                    error={errors.cvssScore}
                    description="Common Vulnerability Scoring System score (0.0 - 10.0)"
                  />

                  {/* CWE ID */}
                  <FormInput
                    label="CWE ID"
                    name="cweId"
                    value={formData.cweId}
                    onChange={handleChange}
                    placeholder="e.g., CWE-79, CWE-89"
                    description="Common Weakness Enumeration identifier"
                  />

                  {/* OWASP Family */}
                  <div className="lg:col-span-2">
                    <FormInput
                      label="OWASP Family"
                      name="owaspFamily"
                      value={formData.owaspFamily}
                      onChange={handleChange}
                      placeholder="e.g., A03-2021-Injection"
                      description="OWASP Top 10 category this vulnerability falls under"
                    />
                  </div>
                </div>

                {/* Classification Summary */}
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                    <ShieldIcon className="text-blue-600" />
                    Vulnerability Classification Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Severity</p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">{formData.severity}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Type</p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">{formData.vulnType}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">CVSS Score</p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">{formData.cvssScore || 'Not specified'}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">CWE ID</p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">{formData.cweId || 'Not specified'}</p>
                    </div>
                  </div>
                  {formData.owaspFamily && (
                    <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">OWASP Category</p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">{formData.owaspFamily}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
            className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
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
      </div>
    </Modal>
  );
};

export default AddEditVulnModal;
