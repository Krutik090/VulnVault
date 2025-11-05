import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getProjectDetails, getProjectVulnerabilities } from '../../api/testerApi'; // ✅ ADD getProjectVulnerabilities
import AddVulnerabilityPage from '../projects/AddVulnerabilityPage';
import ProjectConfigPage from '../projects/ProjectConfigPage';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import VulnerabilitiesListTab from './VulnerabilitiesListTab';

import {
    ArrowLeftIcon,
    ShieldIcon,
    FileIcon,
    BugIcon,
    CheckCircleIcon,
    AlertTriangleIcon,
    TrendingUpIcon,
    CalendarIcon,
    CopyIcon,
} from '../../components/Icons';

const TesterProjectDetailsPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, color } = useTheme();

    const [activeTab, setActiveTab] = useState('overview');
    const [projectData, setProjectData] = useState(null);
    const [myVulnerabilityCount, setMyVulnerabilityCount] = useState(0); // ✅ NEW
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjectDetails();
    }, [projectId]);

    /**
     * ✅ Fetch project details AND my vulnerabilities count
     */
    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`🔍 Fetching project details: ${projectId}`);

            // ✅ Fetch both project details and my vulnerabilities
            const [projectResponse, vulnResponse] = await Promise.all([
                getProjectDetails(projectId),
                getProjectVulnerabilities(projectId),
            ]);

            if (projectResponse.data) {
                setProjectData(projectResponse.data);
                console.log('✅ Project loaded successfully');
            } else {
                throw new Error('Invalid response format');
            }

            // ✅ Count only MY vulnerabilities
            if (vulnResponse.data && vulnResponse.data.vulnerabilities) {
                const myVulns = vulnResponse.data.vulnerabilities.filter(
                    (v) => v.isOwnVulnerability
                ).length;
                setMyVulnerabilityCount(myVulns);
                console.log(`✅ My vulnerabilities: ${myVulns}`);
            }
        } catch (err) {
            console.error('❌ Error:', err.message);
            setError(err.message);
            toast.error(err.message || 'Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✅ Calculate days remaining
     */
    const getDaysRemaining = (endDate) => {
        const today = new Date();
        const end = new Date(endDate);
        const diff = end.getTime() - today.getTime();
        const days = Math.ceil(diff / (1000 * 3600 * 24));
        return days;
    };

    /**
     * ✅ Get severity color
     */
    const getSeverityColor = (severity) => {
        const colors = {
            Critical:
                'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
            High: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700',
            Medium:
                'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700',
            Low: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
            Informational:
                'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700',
        };
        return colors[severity] || colors.Informational;
    };

    /**
     * ✅ Get status color
     */
    const getStatusColor = (status) => {
        const colors = {
            Active: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
            Completed:
                'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',
            Retest: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700',
            'Not Started':
                'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-700',
        };
        return colors[status] || colors['Not Started'];
    };

    if (loading) {
        return (
            <div className={`${theme} theme-${color}`}>
                <Spinner message="Loading project details..." />
            </div>
        );
    }

    if (error || !projectData) {
        return (
            <div className={`${theme} theme-${color}`}>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                    <AlertTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        Error Loading Project
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        {error || 'Unable to load project details'}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchProjectDetails}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => navigate('/tester/projects')}
                            className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-accent"
                        >
                            Back to Projects
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const daysRemaining = getDaysRemaining(projectData.end_date);

    return (
        <div className={`${theme} theme-${color} space-y-6 p-6`}>
            {/* ========== HEADER ========== */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/tester/projects')}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Back to projects"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <FileIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">
                        {projectData.project_name}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {projectData.clientName} •{' '}
                        <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                projectData.status
                            )}`}
                        >
                            {projectData.status}
                        </span>
                    </p>
                </div>
            </div>

            {/* ========== TABS ========== */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="border-b border-border flex overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'overview'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        📋 Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('vulnerabilities')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'vulnerabilities'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        📋 All Vulnerabilities
                    </button>
                    <button
                        onClick={() => setActiveTab('add-vulnerability')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'add-vulnerability'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        🔍 Add Vulnerability
                    </button>
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                            activeTab === 'config'
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        ⚙️ Configuration
                    </button>
                </div>

                <div className="p-6">
                    {/* ========== OVERVIEW TAB ========== */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* ✅ UPDATED: Total Vulnerabilities (ALL testers) */}
                                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-red-700 dark:text-red-400">
                                                Total Vulnerabilities
                                            </p>
                                            <h3 className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                                                {projectData.vulnerabilityCount || 0}
                                            </h3>
                                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                                                (My: {myVulnerabilityCount})
                                            </p>
                                        </div>
                                        <BugIcon className="w-8 h-8 text-red-500 opacity-20" />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                                                Project Status
                                            </p>
                                            <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                                                {projectData.status}
                                            </h3>
                                        </div>
                                        <CheckCircleIcon className="w-8 h-8 text-blue-500 opacity-20" />
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                                                Days Remaining
                                            </p>
                                            <h3 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                                                {daysRemaining > 0
                                                    ? daysRemaining
                                                    : 'Expired'}
                                            </h3>
                                        </div>
                                        <CalendarIcon className="w-8 h-8 text-purple-500 opacity-20" />
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                                End Date
                                            </p>
                                            <h3 className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
                                                {new Date(
                                                    projectData.end_date
                                                ).toLocaleDateString()}
                                            </h3>
                                        </div>
                                        <TrendingUpIcon className="w-8 h-8 text-green-500 opacity-20" />
                                    </div>
                                </div>
                            </div>

                            {/* Project Details & Severity Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Column */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Client */}
                                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Client
                                        </p>
                                        <p className="text-lg font-semibold text-foreground mt-1">
                                            {projectData.clientName}
                                        </p>
                                    </div>

                                    {/* Testing Types */}
                                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                        <p className="text-sm font-medium text-muted-foreground mb-3">
                                            Testing Types
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(projectData.project_type) ? (
                                                projectData.project_type.map(
                                                    (type, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                                                        >
                                                            {type}
                                                        </span>
                                                    )
                                                )
                                            ) : (
                                                <span className="text-muted-foreground text-sm">
                                                    N/A
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Project ID */}
                                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                        <p className="text-sm font-medium text-muted-foreground mb-2">
                                            Project ID
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm font-mono text-foreground bg-background px-2 py-1 rounded border border-border flex-1 truncate">
                                                {projectId}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        projectId
                                                    );
                                                    toast.success(
                                                        'Copied to clipboard'
                                                    );
                                                }}
                                                className="p-2 hover:bg-background rounded transition-colors"
                                                aria-label="Copy project ID"
                                            >
                                                <CopyIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Severity Breakdown */}
                                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <ShieldIcon className="w-5 h-5" />
                                        Vulnerabilities by Severity
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        (All testers combined)
                                    </p>

                                    <div className="space-y-3">
                                        {[
                                            'Critical',
                                            'High',
                                            'Medium',
                                            'Low',
                                            'Informational',
                                        ].map((severity) => {
                                            const count =
                                                projectData
                                                    .vulnerabilitiesBySeverity?.[
                                                    severity
                                                ] || 0;
                                            const total =
                                                projectData.vulnerabilityCount ||
                                                1;
                                            const percentage =
                                                total > 0
                                                    ? Math.round(
                                                          (count / total) *
                                                              100
                                                      )
                                                    : 0;

                                            return (
                                                <div key={severity}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm font-medium text-foreground">
                                                            {severity}
                                                        </span>
                                                        <span
                                                            className={`text-xs font-bold px-2 py-0.5 rounded border ${getSeverityColor(
                                                                severity
                                                            )}`}
                                                        >
                                                            {count} (
                                                            {percentage}%)
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${
                                                                severity ===
                                                                'Critical'
                                                                    ? 'bg-red-500'
                                                                    : severity ===
                                                                      'High'
                                                                    ? 'bg-orange-500'
                                                                    : severity ===
                                                                      'Medium'
                                                                    ? 'bg-amber-500'
                                                                    : severity ===
                                                                      'Low'
                                                                    ? 'bg-blue-500'
                                                                    : 'bg-gray-500'
                                                            }`}
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== VULNERABILITIES TAB ========== */}
                    {activeTab === 'vulnerabilities' && (
                        <VulnerabilitiesListTab projectId={projectId} testerId={user.id} />
                    )}

                    {/* ========== ADD VULNERABILITY TAB ========== */}
                    {activeTab === 'add-vulnerability' && (
                        <AddVulnerabilityPage />
                    )}

                    {/* ========== CONFIG TAB ========== */}
                    {activeTab === 'config' && <ProjectConfigPage />}
                </div>
            </div>
        </div>
    );
};

export default TesterProjectDetailsPage;
