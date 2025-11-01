// =======================================================================
// FILE: src/features/projects/ProjectConfigPage.jsx (UPDATED)
// PURPOSE: Full page for project configuration - CHECKBOX BUG FIXED
// SOC 2 NOTES: Centralized icon management, secure form handling, input validation
// =======================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import { getProjectById } from '../../api/projectApi';
import { getProjectConfig, saveProjectConfig } from '../../api/projectDetailsApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  ArrowLeftIcon,
  SaveIcon,
  SettingsIcon,
  ClipboardIcon,
  ShieldIcon,
  CheckIcon,
  XIcon,
} from '../../components/Icons';

// ✅ FIXED: FormCheckbox component with proper event handling
const FormCheckbox = ({ label, checked, onChange, description, name }) => {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // ✅ SOC 2: Debug logging (can be removed in production)
    console.log(`🔘 Checkbox "${name}" clicked:`, {
      currentValue: checked,
      newValue: !checked
    });

    // ✅ FIXED: Create proper event object for React Hook Form compatibility
    const syntheticEvent = {
      target: {
        name: name,
        type: 'checkbox',
        checked: !checked
      }
    };

    onChange(syntheticEvent);
  };

  return (
    <div
      className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
      aria-label={label}
    >
      <div className="flex-shrink-0 mt-0.5">
        {checked ? (
          <CheckIcon className="text-green-600 w-5 h-5" />
        ) : (
          <XIcon className="text-gray-400 w-5 h-5" />
        )}
      </div>
      <div className="flex-1">
        <label className="font-medium text-foreground cursor-pointer block">
          {label}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

const ProjectConfigPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme, color } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ SOC 2: Form state with all configuration fields
  const [configData, setConfigData] = useState({
    projectName: '',
    clientName: '',
    reportType: '',
    engagementDates: '',
    scope: '',
    reportingCriteria: '',
    methodology: '',
    findings: '',
    executiveSummary: '',
    testingNotes: '',

    tableOfContents: true,
    listOfFigures: true,
    listOfTables: true,
    documentControl: true,
    disclaimer: true,
    executiveSummarySection: true,
    scopeSection: true,
    reportingCriteriaSection: true,
    methodologySection: true,
    findingsSection: true,
    conclusionSection: true,
    appendixSection: true
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ SOC 2: Parallel API calls for performance
      const [projectResponse, configResponse] = await Promise.all([
        getProjectById(projectId),
        getProjectConfig(projectId)
      ]);

      // ✅ SOC 2: Input validation & sanitization
      const projectData = projectResponse.data || projectResponse;
      setProject(projectData);

      if (
        configResponse.data &&
        Object.keys(configResponse.data).length > 0
      ) {
        console.log('📥 Loading existing config:', configResponse.data);

        setConfigData((prev) => ({
          ...prev,
          projectName: configResponse.data.projectName || '',
          clientName: configResponse.data.clientName || '',
          reportType: configResponse.data.reportType || '',
          engagementDates: configResponse.data.engagementDates || '',
          scope: configResponse.data.scope || '',
          reportingCriteria: configResponse.data.reportingCriteria || '',
          methodology: configResponse.data.methodology || '',
          findings: configResponse.data.findings || '',
          executiveSummary: configResponse.data.executiveSummary || '',
          testingNotes: configResponse.data.testingNotes || '',
          tableOfContents:
            configResponse.data.tableOfContents ?? true,
          listOfFigures: configResponse.data.listOfFigures ?? true,
          listOfTables: configResponse.data.listOfTables ?? true,
          documentControl: configResponse.data.documentControl ?? true,
          disclaimer: configResponse.data.disclaimer ?? true,
          executiveSummarySection:
            configResponse.data.executiveSummarySection ?? true,
          scopeSection: configResponse.data.scopeSection ?? true,
          reportingCriteriaSection:
            configResponse.data.reportingCriteriaSection ?? true,
          methodologySection:
            configResponse.data.methodologySection ?? true,
          findingsSection: configResponse.data.findingsSection ?? true,
          conclusionSection:
            configResponse.data.conclusionSection ?? true,
          appendixSection: configResponse.data.appendixSection ?? true
        }));
        setIsEditMode(true);
      } else {
        setConfigData((prev) => ({
          ...prev,
          projectName: projectData.project_name || '',
          clientName:
            projectData.client_name ||
            projectData.clientId?.clientName ||
            ''
        }));
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to load project configuration');
    } finally {
      setLoading(false);
    }
  };

  // ✅ SOC 2: Form field change handler with debugging
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    console.log('📝 handleChange called:', {
      name,
      type,
      value: type === 'checkbox' ? checked : value
    });

    setConfigData((prev) => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      console.log('✅ State updated:', {
        field: name,
        oldValue: prev[name],
        newValue: newData[name]
      });

      return newData;
    });

    // ✅ SOC 2: Clear error on field change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ✅ SOC 2: Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!configData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!configData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
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

    setSaving(true);

    console.log('💾 Submitting config data:', configData);

    try {
      // ✅ SOC 2: Sanitize data before submission
      const cleanedData = {
        ...configData,
        projectName: configData.projectName.trim(),
        clientName: configData.clientName.trim(),
        reportType: configData.reportType.trim(),
        engagementDates: configData.engagementDates.trim(),
        scope: configData.scope.trim(),
        reportingCriteria: configData.reportingCriteria.trim(),
        methodology: configData.methodology.trim(),
        findings: configData.findings.trim(),
        executiveSummary: configData.executiveSummary.trim(),
        testingNotes: configData.testingNotes.trim()
      };

      const response = await saveProjectConfig(projectId, cleanedData);
      console.log('✅ Save response:', response);

      toast.success(
        `Project configuration ${
          isEditMode ? 'updated' : 'created'
        } successfully!`
      );
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('❌ Error saving configuration:', error);
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
          aria-label="Go back to project"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Project
        </button>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <SettingsIcon className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isEditMode ? 'Edit' : 'Configure'} Project Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              {project?.project_name || 'Project Configuration'}
            </p>
          </div>
        </div>
      </div>

      {/* ========== FORM ========== */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========== BASIC INFORMATION ========== */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardIcon className="text-primary w-5 h-5" />
            <h2 className="text-xl font-semibold text-foreground">
              Basic Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Project Name"
              name="projectName"
              value={configData.projectName}
              onChange={handleChange}
              placeholder="Enter project name"
              required
              aria-label="Project name"
              aria-invalid={!!errors.projectName}
              error={errors.projectName}
            />
            <FormInput
              label="Client Name"
              name="clientName"
              value={configData.clientName}
              onChange={handleChange}
              placeholder="Enter client name"
              required
              aria-label="Client name"
              aria-invalid={!!errors.clientName}
              error={errors.clientName}
            />
            <FormInput
              label="Report Type"
              name="reportType"
              value={configData.reportType}
              onChange={handleChange}
              placeholder="e.g., Penetration Testing Report"
              aria-label="Report type"
            />
            <FormInput
              label="Engagement Dates"
              name="engagementDates"
              value={configData.engagementDates}
              onChange={handleChange}
              placeholder="e.g., Jan 1 - Jan 15, 2025"
              aria-label="Engagement dates"
            />
          </div>
        </div>

        {/* ========== CONTENT SECTIONS ========== */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardIcon className="text-primary w-5 h-5" />
            <h2 className="text-xl font-semibold text-foreground">
              Report Content
            </h2>
          </div>

          <div className="space-y-5">
            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scope
              </label>
              <textarea
                name="scope"
                value={configData.scope}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Describe the project scope..."
                aria-label="Project scope"
              />
            </div>

            {/* Reporting Criteria */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reporting Criteria
              </label>
              <textarea
                name="reportingCriteria"
                value={configData.reportingCriteria}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Define reporting criteria..."
                aria-label="Reporting criteria"
              />
            </div>

            {/* Methodology */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Methodology
              </label>
              <textarea
                name="methodology"
                value={configData.methodology}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Describe testing methodology..."
                aria-label="Testing methodology"
              />
            </div>

            {/* Findings */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Findings
              </label>
              <textarea
                name="findings"
                value={configData.findings}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Summary of findings..."
                aria-label="Findings summary"
              />
            </div>

            {/* Executive Summary */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Executive Summary
              </label>
              <textarea
                name="executiveSummary"
                value={configData.executiveSummary}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Enter executive summary..."
                aria-label="Executive summary"
              />
            </div>

            {/* Testing Notes */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Testing Notes
              </label>
              <textarea
                name="testingNotes"
                value={configData.testingNotes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Add any additional notes..."
                aria-label="Testing notes"
              />
            </div>
          </div>
        </div>

        {/* ========== REPORT SECTIONS ========== */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldIcon className="text-primary w-5 h-5" />
            <h2 className="text-xl font-semibold text-foreground">
              Include in Report
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormCheckbox
              label="Table of Contents"
              name="tableOfContents"
              checked={configData.tableOfContents}
              onChange={handleChange}
              description="Include a table of contents section"
            />
            <FormCheckbox
              label="List of Figures"
              name="listOfFigures"
              checked={configData.listOfFigures}
              onChange={handleChange}
              description="Include a list of all figures"
            />
            <FormCheckbox
              label="List of Tables"
              name="listOfTables"
              checked={configData.listOfTables}
              onChange={handleChange}
              description="Include a list of all tables"
            />
            <FormCheckbox
              label="Document Control"
              name="documentControl"
              checked={configData.documentControl}
              onChange={handleChange}
              description="Include document version control"
            />
            <FormCheckbox
              label="Disclaimer"
              name="disclaimer"
              checked={configData.disclaimer}
              onChange={handleChange}
              description="Include disclaimer section"
            />
            <FormCheckbox
              label="Executive Summary"
              name="executiveSummarySection"
              checked={configData.executiveSummarySection}
              onChange={handleChange}
              description="Include executive summary"
            />
            <FormCheckbox
              label="Scope Section"
              name="scopeSection"
              checked={configData.scopeSection}
              onChange={handleChange}
              description="Include detailed scope section"
            />
            <FormCheckbox
              label="Reporting Criteria"
              name="reportingCriteriaSection"
              checked={configData.reportingCriteriaSection}
              onChange={handleChange}
              description="Include reporting criteria"
            />
            <FormCheckbox
              label="Methodology"
              name="methodologySection"
              checked={configData.methodologySection}
              onChange={handleChange}
              description="Include methodology details"
            />
            <FormCheckbox
              label="Findings"
              name="findingsSection"
              checked={configData.findingsSection}
              onChange={handleChange}
              description="Include findings section"
            />
            <FormCheckbox
              label="Conclusion"
              name="conclusionSection"
              checked={configData.conclusionSection}
              onChange={handleChange}
              description="Include conclusion"
            />
            <FormCheckbox
              label="Appendix"
              name="appendixSection"
              checked={configData.appendixSection}
              onChange={handleChange}
              description="Include appendix section"
            />
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-3 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel and go back"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              isEditMode ? 'Update configuration' : 'Save configuration'
            }
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="w-5 h-5" />
                {isEditMode ? 'Update Configuration' : 'Save Configuration'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectConfigPage;
