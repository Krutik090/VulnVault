/**
 * ======================================================================
 * FILE: src/api/testerApi.js (FIXED - NO DUPLICATES)
 * ======================================================================
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6001/api';

/**
 * Get tester dashboard
 */
export const getTesterDashboard = async () => {
    try {
        const response = await fetch(`${API_URL}/testers/dashboard`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch dashboard');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching tester dashboard:', error.message);
        throw error;
    }
};

/**
 * Get my projects
 */
export const getMyProjects = async () => {
    try {
        const response = await fetch(`${API_URL}/testers/projects`, {
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch projects');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching my projects:', error.message);
        throw error;
    }
};

/**
 * ✅ SINGLE METHOD: Get project details
 */
export const getProjectDetails = async (projectId) => {
    try {
        if (!projectId) {
            throw new Error('Project ID is required');
        }

        console.log(`🔍 Fetching project details: ${projectId}`);

        const response = await fetch(
            `${API_URL}/testers/projects/${projectId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }
        );

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `HTTP ${response.status}`,
            }));
            throw new Error(errorData.message || 'Failed to load project');
        }

        const data = await response.json();
        console.log('✅ Project data:', data);

        if (!data.data) {
            throw new Error('Invalid response format');
        }

        return data;
    } catch (error) {
        console.error('❌ Error fetching project details:', error.message);
        throw error;
    }
};

/**
 * Alternative name for getProjectDetails
 */
export const getTesterProjectById = async (projectId) => {
    return getProjectDetails(projectId);
};

/**
 * Verify project access
 */
export const verifyProjectAccess = async (projectId) => {
    try {
        const response = await fetch(
            `${API_URL}/testers/verify-access/${projectId}`,
            {
                credentials: 'include',
            }
        );

        if (!response.ok) {
            throw new Error('Access verification failed');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error verifying access:', error.message);
        throw error;
    }
};

/**
 * Record activity
 */
export const recordActivity = async (activityData) => {
    try {
        const response = await fetch(`${API_URL}/testers/activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(activityData),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to record activity');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error recording activity:', error.message);
        throw error;
    }
};


/**
 * Get all vulnerabilities for a project
 */
export const getProjectVulnerabilities = async (projectId) => {
    try {
        if (!projectId) {
            throw new Error('Project ID is required');
        }

        const response = await fetch(
            `${API_URL}/testers/projects/${projectId}/vulnerabilities`,
            {
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch vulnerabilities');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching vulnerabilities:', error.message);
        throw error;
    }
};

/**
 * Update vulnerability visibility
 */
export const updateVulnerabilityVisibility = async (
    vulnerabilityId,
    visibilityData
) => {
    try {
        const response = await fetch(
            `${API_URL}/testers/vulnerabilities/${vulnerabilityId}/visibility`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(visibilityData),
                credentials: 'include',
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update visibility');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error updating visibility:', error.message);
        throw error;
    }
};