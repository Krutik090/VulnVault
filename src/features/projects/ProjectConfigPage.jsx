// =======================================================================
// FILE: src/features/projects/ProjectConfigPage.jsx (NEW - FULL PAGE)
// PURPOSE: Full page for project configuration (replaces modal)
// =======================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../../components/FormInput';
import { getProjectById } from '../../api/projectApi';
import { getProjectConfig, saveProjectConfig } from '../../api/projectDetailsApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ConfigIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ScopeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckboxIcon = ({ checked }) => (
  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
    checked 
      ? 'bg-primary border-primary' 
      : 'border-input bg-background'
  }`}>
    {checked && (
      <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
);

const FormCheckbox = ({ label, checked, onChange, description, name }) => (
  <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
       onClick={() => onChange({ target: { name, checked: !checked } })}>
    <div className="flex-shrink-0 mt-0.5">
      <CheckboxIcon checked={checked} />
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

const ProjectConfigPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { theme, color } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
      const [projectResponse, configResponse] = await Promise.all([
        getProjectById(projectId),
        getProjectConfig(projectId)
      ]);

      const projectData = projectResponse.data || projectResponse;
      setProject(projectData);

      if (configResponse.data && Object.keys(configResponse.data).length > 0) {
        setConfigData(prev => ({ ...prev, ...configResponse.data }));
        setIsEditMode(true);
      } else {
        // Pre-fill with project data
        setConfigData(prev => ({
          ...prev,
          projectName: projectData.project_name || '',
          clientName: projectData.client_name || projectData.clientId?.clientName || ''
        }));
        setIsEditMode(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load project configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfigData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await saveProjectConfig(projectId, configData);
      toast.success(`Project configuration ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error saving configuration:', error);
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
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm"
        >
          <ArrowLeftIcon />
          Back to Project
        </button>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <ConfigIcon className="text-primary" />
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ScopeIcon className="text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Project Name"
              name="projectName"
              value={configData.projectName}
              onChange={handleChange}
              placeholder="Enter project name"
            />
            <FormInput
              label="Client Name"
              name="clientName"
              value={configData.clientName}
              onChange={handleChange}
              placeholder="Enter client name"
            />
            <FormInput
              label="Report Type"
              name="reportType"
              value={configData.reportType}
              onChange={handleChange}
              placeholder="e.g., Penetration Testing Report"
            />
            <FormInput
              label="Engagement Dates"
              name="engagementDates"
              value={configData.engagementDates}
              onChange={handleChange}
              placeholder="e.g., Jan 1 - Jan 15, 2024"
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ReportIcon className="text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Report Content</h2>
          </div>

          <div className="space-y-5">
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
              />
            </div>

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
              />
            </div>

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
              />
            </div>

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
              />
            </div>

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
              />
            </div>
          </div>
        </div>

        {/* Report Sections */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldIcon className="text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Include in Report</h2>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="px-6 py-3 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon />
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
