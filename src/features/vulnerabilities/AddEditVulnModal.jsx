// =======================================================================
// FILE: src/features/vulnerabilities/AddEditVulnModal.jsx (FINAL - BACKEND ALIGNED)
// PURPOSE: Modal for adding and editing vulnerabilities with enhanced layout
// CHANGES: Field names now match backend exactly (vuln_type, vulnerability_name, etc.)
// SOC 2 NOTES: Centralized icon management, secure form handling, audit logging
// =======================================================================

import { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import RichTextEditor from '../../components/RichTextEditor';
import { createVulnerability, updateVulnerability } from '../../api/vulnerabilityApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  SaveIcon,
  AlertTriangleIcon,
  BugIcon,
  InfoIcon,
  ShieldIcon,
  FileTextIcon,
  XIcon,
} from '../../components/Icons';

const AddEditVulnModal = ({ isOpen, onClose, onSave, vulnToEdit }) => {
  // ✅ UPDATED: Field names match backend exactly
  const [formData, setFormData] = useState({
    vulnerability_name: '',      // Backend: vulnerability_name
    vuln_type: 'Web Application', // Backend: vuln_type
    severity: 'Medium',           // Backend: severity
    description: '',              // Backend: description
    impact: '',                   // Backend: impact
    recommendation: '',           // Backend: recommendation
    references: '',               // Backend: references
    cvss_score: '',               // Backend: CVSS (optional)
    cwe: '',                       // Backend: cwe (optional)
    owasp_family: '',             // Backend: owasp_family (optional)
    poc: '',                       // Backend: poc (optional)
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const { theme, color } = useTheme();

  const isEditMode = !!vulnToEdit;

  // ✅ SOC 2: Vulnerability type options
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
    { value: 'Other', label: 'Other' },
  ];

  // ✅ SOC 2: Severity options
  const severityOptions = [
    { value: 'Critical', label: 'Critical' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' },
    { value: 'Info', label: 'Info' },
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      High: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
      Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
      Low: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      Info: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    };
    return (
      colors[severity] ||
      'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
    );
  };

  // ✅ SOC 2: Initialize form data with backend field names
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && vulnToEdit) {
        console.log(`✏️ Editing vulnerability: ${vulnToEdit._id}`);
        // ✅ Map from database to form using exact backend field names
        setFormData({
          vulnerability_name: vulnToEdit.vulnerability_name || '',
          vuln_type: vulnToEdit.vuln_type || 'Web Application',
          severity: vulnToEdit.severity || 'Medium',
          description: vulnToEdit.description || '',
          impact: vulnToEdit.impact || '',
          recommendation: vulnToEdit.recommendation || '',
          references: vulnToEdit.references || '',
          cvss_score: vulnToEdit.cvss_score || '',
          cwe: vulnToEdit.cwe || '',
          owasp_family: vulnToEdit.owasp_family || '',
          poc: vulnToEdit.poc || '',
        });
      } else {
        console.log('➕ Opening add vulnerability modal');
        setFormData({
          vulnerability_name: '',
          vuln_type: 'Web Application',
          severity: 'Medium',
          description: '',
          impact: '',
          recommendation: '',
          references: '',
          cvss_score: '',
          cwe: '',
          owasp_family: '',
          poc: '',
        });
      }
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, vulnToEdit, isEditMode]);

  // ✅ SOC 2: Memoized handlers to prevent re-creation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleRichTextChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // ✅ SOC 2: Form validation with defensive checks
  const validateForm = () => {
    const newErrors = {};

    // ✅ UPDATED: Validate exact backend field names
    if (!formData.vulnerability_name.trim()) {
      newErrors.vulnerability_name = 'Vulnerability name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.impact.trim()) {
      newErrors.impact = 'Impact description is required';
    }
    if (!formData.recommendation.trim()) {
      newErrors.recommendation = 'Recommendation is required';
    }

    // Optional: CVSS validation only if provided
    if (
      formData.cvss_score &&
      (isNaN(formData.cvss_score) ||
        parseFloat(formData.cvss_score) < 0 ||
        parseFloat(formData.cvss_score) > 10)
    ) {
      newErrors.cvss_score = 'CVSS Score must be a number between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SOC 2: Submit handler with audit logging
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSaving(true);
    try {
      // ✅ UPDATED: Send exact backend field names
      const dataToSubmit = {
        vulnerability_name: formData.vulnerability_name.trim(),
        vuln_type: formData.vuln_type,
        severity: formData.severity,
        description: formData.description.trim(),
        impact: formData.impact.trim(),
        recommendation: formData.recommendation.trim(),
        references: formData.references.trim() || undefined,
        cvss_score: formData.cvss_score ? parseFloat(formData.cvss_score) : undefined,
        cwe: formData.cwe.trim() || undefined,
        owasp_family: formData.owasp_family.trim() || undefined,
        poc: formData.poc.trim() || undefined,
      };

      if (isEditMode) {
        console.log(`💾 Updating vulnerability: ${vulnToEdit._id}`);
        await updateVulnerability(vulnToEdit._id, dataToSubmit);
        console.log(`✅ Vulnerability updated successfully`);
        toast.success('Vulnerability updated successfully!');
      } else {
        console.log('💾 Creating new vulnerability');
        await createVulnerability(dataToSubmit);
        console.log('✅ Vulnerability created successfully');
        toast.success('Vulnerability created successfully!');
      }
      onSave?.();
      onClose?.();
    } catch (error) {
      console.error('❌ Error saving vulnerability:', error.message);
      toast.error(error.message || 'Failed to save vulnerability');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      vulnerability_name: '',
      vuln_type: 'Web Application',
      severity: 'Medium',
      description: '',
      impact: '',
      recommendation: '',
      references: '',
      cvss_score: '',
      cwe: '',
      owasp_family: '',
      poc: '',
    });
    setErrors({});
    setActiveTab('basic');
    onClose?.();
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: InfoIcon },
    { id: 'details', label: 'Details & Remediation', icon: FileTextIcon },
    { id: 'classification', label: 'Classification (Optional)', icon: ShieldIcon },
  ];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="7xl"
      showCloseButton={false}
    >
      <div className={`${theme} theme-${color} flex flex-col max-h-[90vh]`}>
        {/* ========== HEADER ========== */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <BugIcon className="text-red-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {isEditMode ? 'Edit Vulnerability Template' : 'Add New Vulnerability Template'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? 'Update predefined vulnerability in the database'
                  : 'Create a new predefined vulnerability template'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
            disabled={isSaving}
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* ========== TAB NAVIGATION ========== */}
        <div className="border-b border-border bg-muted/30">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
                aria-label={tab.label}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========== FORM CONTENT ========== */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ========== BASIC INFORMATION TAB ========== */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {/* Info Banner */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex gap-3">
                    <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">📋 Creating a Vulnerability Template</p>
                      <p>
                        This generic template will be used as a reference when testers discover actual vulnerabilities in projects.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ✅ UPDATED: Vulnerability Name */}
                  <div className="lg:col-span-2">
                    <FormInput
                      label="Vulnerability Name"
                      name="vulnerability_name"
                      value={formData.vulnerability_name}
                      onChange={handleChange}
                      placeholder="e.g., SQL Injection, Cross-Site Scripting"
                      required
                      error={errors.vulnerability_name}
                      description="A clear, descriptive name for this vulnerability type"
                    />
                  </div>

                  {/* ✅ UPDATED: Vulnerability Type */}
                  <FormSelect
                    label="Vulnerability Type / Category"
                    name="vuln_type"
                    value={formData.vuln_type}
                    onChange={handleChange}
                    options={vulnTypeOptions}
                    required
                    description="Category of vulnerability"
                  />

                  {/* ✅ UPDATED: Severity */}
                  <FormSelect
                    label="Severity Level"
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    options={severityOptions}
                    required
                    description="Default severity level"
                  />
                </div>

                {/* Current Selection Display */}
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Current Classification
                  </h4>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div
                      className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold border ${getSeverityColor(
                        formData.severity
                      )}`}
                    >
                      <AlertTriangleIcon className="w-4 h-4 mr-2" />
                      {formData.severity}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type:{' '}
                      <span className="font-medium text-foreground">
                        {formData.vuln_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== DETAILS & REMEDIATION TAB ========== */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* ✅ UPDATED: Description */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(data) => handleRichTextChange('description', data)}
                    placeholder="Provide a detailed description of the vulnerability..."
                    height={200}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Technical details and nature of this vulnerability type
                  </p>
                </div>

                {/* ✅ UPDATED: Impact */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Impact <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.impact}
                    onChange={(data) => handleRichTextChange('impact', data)}
                    placeholder="Describe the potential impact of this vulnerability..."
                    height={200}
                  />
                  {errors.impact && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4" />
                      {errors.impact}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    What could happen if this vulnerability is exploited
                  </p>
                </div>

                {/* ✅ UPDATED: Recommendation */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Recommendation <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={formData.recommendation}
                    onChange={(data) => handleRichTextChange('recommendation', data)}
                    placeholder="Provide steps to fix or mitigate this vulnerability..."
                    height={200}
                  />
                  {errors.recommendation && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
                      <AlertTriangleIcon className="w-4 h-4" />
                      {errors.recommendation}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Clear remediation steps
                  </p>
                </div>

                {/* References (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    References (Optional)
                  </label>
                  <RichTextEditor
                    value={formData.references}
                    onChange={(data) => handleRichTextChange('references', data)}
                    placeholder="Add references, links, or documentation..."
                    height={150}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    CVE numbers, articles, or documentation
                  </p>
                </div>
              </div>
            )}

            {/* ========== CLASSIFICATION TAB (OPTIONAL) ========== */}
            {activeTab === 'classification' && (
              <div className="space-y-6">
                {/* Optional Info Banner */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex gap-3">
                    <AlertTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium mb-1">ℹ️ Optional Classification Fields</p>
                      <p>
                        These fields are optional and provide additional context for categorization.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ✅ UPDATED: CWE (not cwe_id) */}
                  <FormInput
                    label="CWE ID (Optional)"
                    name="cwe"
                    value={formData.cwe}
                    onChange={handleChange}
                    placeholder="e.g., CWE-79, CWE-89"
                    description="Common Weakness Enumeration identifier"
                  />

                  {/* ✅ UPDATED: CVSS Score */}
                  <FormInput
                    label="CVSS Score (Optional)"
                    name="cvss_score"
                    type="number"
                    value={formData.cvss_score}
                    onChange={handleChange}
                    placeholder="0.0 - 10.0"
                    min="0"
                    max="10"
                    step="0.1"
                    error={errors.cvss_score}
                    description="Common Vulnerability Scoring System"
                  />

                  {/* ✅ UPDATED: OWASP Family */}
                  <FormInput
                    label="OWASP Category (Optional)"
                    name="owasp_family"
                    value={formData.owasp_family}
                    onChange={handleChange}
                    placeholder="e.g., A03:2021-Injection"
                    description="OWASP Top 10 category"
                  />

                  {/* POC Template */}
                  <FormInput
                    label="POC Template (Optional)"
                    name="poc"
                    value={formData.poc}
                    onChange={handleChange}
                    placeholder="Example or template for testing"
                    description="Proof of concept template"
                  />
                </div>

                {/* Classification Summary */}
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center gap-2">
                    <ShieldIcon className="text-blue-600 w-5 h-5" />
                    Vulnerability Classification Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Category
                      </p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        {formData.vuln_type}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Severity
                      </p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        {formData.severity}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        CVSS Score
                      </p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        {formData.cvss_score || 'Not specified'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        CWE
                      </p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        {formData.cwe || 'Not specified'}
                      </p>
                    </div>
                    {formData.owasp_family && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 lg:col-span-2">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          OWASP Category
                        </p>
                        <p className="font-semibold text-blue-800 dark:text-blue-200 line-clamp-2">
                          {formData.owasp_family}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-300 dark:border-blue-700">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Note:</strong> This is a generic template. Severity varies when testers record actual findings in projects.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6 py-2.5 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-colors disabled:opacity-50"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            aria-label={isEditMode ? 'Update vulnerability template' : 'Create vulnerability template'}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <SaveIcon className="w-4 h-4" />
                {isEditMode ? 'Update Template' : 'Create Template'}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddEditVulnModal;
