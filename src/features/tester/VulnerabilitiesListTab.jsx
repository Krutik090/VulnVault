/**
 * ======================================================================
 * FILE: src/features/tester/components/VulnerabilitiesListTab.jsx (FIXED)
 * LOGIC: Checkbox = Hide from other testers (private)
 * ======================================================================
 */

import { useState, useEffect, useMemo } from 'react';
import {
    getProjectVulnerabilities,
    updateVulnerabilityVisibility,
} from '../../api/testerApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { LockIcon, GlobeIcon, CheckIcon } from '../../components/Icons';

const VulnerabilitiesListTab = ({ projectId, testerId }) => {
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingVisibility, setUpdatingVisibility] = useState(null);
    const [visibilityFilter, setVisibilityFilter] = useState('all');

    useEffect(() => {
        fetchVulnerabilities();
    }, [projectId]);

    /**
     * ✅ Fetch vulnerabilities
     */
    const fetchVulnerabilities = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(
                `🔍 Fetching vulnerabilities for project: ${projectId}`
            );

            const response = await getProjectVulnerabilities(projectId);

            if (response.data) {
                setVulnerabilities(response.data.vulnerabilities);
                console.log(
                    `✅ Found ${response.data.count} vulnerabilities`
                );
            }
        } catch (err) {
            console.error('❌ Error:', err.message);
            setError(err.message);
            toast.error(err.message || 'Failed to load vulnerabilities');
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✅ FIXED: Handle checkbox change
     * Checked = private (hide from other testers)
     * Unchecked = all (everyone can view)
     */
    const handleVisibilityChange = async (vulnId, isChecked) => {
        try {
            setUpdatingVisibility(vulnId);
            console.log(
                `🔄 Changing visibility: ${isChecked ? 'Hidden from other testers' : 'Visible to all'
                }`
            );

            // ✅ FIXED: Set based on checkbox state
            const newVisibility = isChecked ? 'private' : 'all';

            const response = await updateVulnerabilityVisibility(vulnId, {
                visibility_level: newVisibility,
            });

            // ✅ Update local state
            setVulnerabilities((prev) =>
                prev.map((v) =>
                    v._id === vulnId
                        ? {
                            ...v,
                            visibility_level: newVisibility,
                        }
                        : v
                )
            );

            toast.success(
                `✅ Visibility changed to ${isChecked
                    ? 'Hidden from other testers'
                    : 'Visible to all'
                }`
            );

        } catch (err) {
            console.error('❌ Error updating visibility:', err.message);
            toast.error('Failed to update visibility');
        } finally {
            setUpdatingVisibility(null);
        }
    };

    /**
     * ✅ Get severity color
     */
    const getSeverityColor = (severity) => {
        const colors = {
            Critical:
                'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            Medium:
                'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
            Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            Informational:
                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
        };
        return colors[severity] || colors.Informational;
    };

    /**
     * ✅ Get status color
     */
    const getStatusColor = (status) => {
        const colors = {
            open: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            closed:
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            not_in_scope:
                'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            obsolete:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            unable_to_verify:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        };
        return colors[status] || colors.open;
    };

    /**
     * ✅ Get visibility display
     */
    const getVisibilityDisplay = (vuln) => {
        const isPrivate = vuln.visibility_level === 'private';

        return {
            isPrivate,
            text: isPrivate ? 'Hidden from Others' : 'Visible to All',
            icon: isPrivate ? LockIcon : GlobeIcon,
            color: isPrivate ? 'text-red-600' : 'text-green-600',
        };
    };

    /**
     * ✅ Filter vulnerabilities
     */
    const filteredVulnerabilities = useMemo(() => {
        if (visibilityFilter === 'mine') {
            return vulnerabilities.filter((v) => v.isOwnVulnerability);
        } else if (visibilityFilter === 'others') {
            return vulnerabilities.filter((v) => !v.isOwnVulnerability);
        }
        return vulnerabilities;
    }, [vulnerabilities, visibilityFilter]);

    /**
     * ✅ Table columns
     */
    const columns = useMemo(
        () => [
            {
                accessorKey: 'vulnerability_name',
                header: 'Vulnerability',
                cell: ({ row }) => (
                    <div className="font-medium text-foreground max-w-xs truncate">
                        {row.original.vulnerability_name}
                    </div>
                ),
            },
            {
                accessorKey: 'severity',
                header: 'Severity',
                cell: ({ row }) => (
                    <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                            row.original.severity
                        )}`}
                    >
                        {row.original.severity}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => (
                    <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            row.original.status
                        )}`}
                    >
                        {row.original.status}
                    </span>
                ),
            },
            {
                accessorKey: 'found_by',
                header: 'Added By',
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-foreground font-medium">
                            {row.original.found_by}
                        </span>
                        {row.original.isOwnVulnerability && (
                            <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded">
                                You
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'visibility_level',
                header: 'Visibility',
                cell: ({ row }) => {
                    const display = getVisibilityDisplay(row.original);
                    const Icon = display.icon;
                    const isLoading =
                        updatingVisibility === row.original._id;

                    // ✅ Only allow edit for own vulnerabilities
                    if (!row.original.canChangeVisibility) {
                        return (
                            <div className="flex items-center gap-2">
                                <Icon
                                    className={`w-4 h-4 ${display.color}`}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {display.text}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div className="flex items-center gap-3">
                            <label className="flex items-center cursor-pointer gap-2">
                                <input
                                    type="checkbox"
                                    checked={display.isPrivate}
                                    onChange={(e) =>
                                        handleVisibilityChange(
                                            row.original._id,
                                            e.target.checked
                                        )
                                    }
                                    disabled={isLoading}
                                    className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-primary"
                                    title="Check to hide from other testers"
                                />
                                <span className="text-xs text-foreground font-medium">
                                    {isLoading
                                        ? 'Updating...'
                                        : display.isPrivate
                                            ? 'Hidden'
                                            : 'Visible'}
                                </span>
                            </label>
                            <Icon
                                className={`w-4 h-4 ${display.color}`}
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: 'cvss_score',
                header: 'CVSS Score',
                cell: ({ row }) => (
                    <div className="text-sm text-foreground font-medium">
                        {row.original.cvss_score || 'N/A'}
                    </div>
                ),
            },
            {
                accessorKey: 'createdAt',
                header: 'Date Added',
                cell: ({ row }) => (
                    <div className="text-xs text-muted-foreground">
                        {new Date(row.original.createdAt).toLocaleDateString()}
                    </div>
                ),
            },
        ],
        [updatingVisibility]
    );

    if (loading) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">
                    Loading vulnerabilities...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Error: {error}</p>
                <button
                    onClick={fetchVulnerabilities}
                    className="mt-4 px-3 py-1 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ========== FILTER TABS ========== */}
            <div className="flex gap-2 border-b border-border">
                <button
                    onClick={() => setVisibilityFilter('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${visibilityFilter === 'all'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    All ({vulnerabilities.length})
                </button>
                <button
                    onClick={() => setVisibilityFilter('mine')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${visibilityFilter === 'mine'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    My Vulnerabilities (
                    {vulnerabilities.filter((v) => v.isOwnVulnerability).length}
                    )
                </button>
                <button
                    onClick={() => setVisibilityFilter('others')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${visibilityFilter === 'others'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Others (
                    {vulnerabilities.filter((v) => !v.isOwnVulnerability)
                        .length}
                    )
                </button>
            </div>

            {/* ========== VULNERABILITIES TABLE ========== */}
            {filteredVulnerabilities.length > 0 ? (
                <DataTable
                    data={filteredVulnerabilities}
                    columns={columns}
                    searchable={true}
                    title="Project Vulnerabilities"
                    exportable={true}
                    fileName="vulnerabilities"
                />
            ) : (
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <CheckIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">
                        No vulnerabilities{' '}
                        {visibilityFilter !== 'all' ? 'in this filter' : 'yet'}
                    </p>
                </div>
            )}

            {/* ========== LEGEND ========== */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border text-sm">
                <p className="font-semibold text-foreground mb-3">
                    Visibility Controls:
                </p>
                <div className="space-y-2">
                    <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                checked={false}
                                disabled
                                className="w-4 h-4"
                            />
                            <GlobeIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                ☐ Unchecked (Visible to All)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Everyone can see: admins, clients, and other testers
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                checked={true}
                                disabled
                                className="w-4 h-4"
                            />
                            <LockIcon className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">
                                ☑️ Checked (Hide from Other Testers)
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Hidden from other testers only. Admins and clients can still see this vulnerability.
                            </p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                    💡 You can only manage visibility for vulnerabilities you
                    added
                </p>
            </div>

        </div>
    );
};

export default VulnerabilitiesListTab;
