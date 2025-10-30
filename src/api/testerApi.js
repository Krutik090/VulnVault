// =======================================================================
// FILE: src/api/testerApi.js (UPDATED WITH ALL METHODS)
// PURPOSE: API calls for tester-specific operations
// =======================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6001/api';

/**
 * Helper function to make authenticated fetch requests
 */
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // ✅ CRITICAL - Sends cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
};

/**
 * Get tester dashboard with comprehensive statistics
 */
export const getTesterDashboard = async () => {
  try {
    return await fetchWithAuth('/tester/dashboard');
  } catch (error) {
    console.error('❌ Error fetching tester dashboard:', error);
    throw error;
  }
};

/**
 * Get all projects assigned to the tester
 */
export const getMyProjects = async () => {
  try {
    return await fetchWithAuth('/tester/projects');
  } catch (error) {
    console.error('❌ Error fetching assigned projects:', error);
    throw error;
  }
};

/**
 * Get single project details (only if assigned)
 */
export const getMyProjectById = async (projectId) => {
  try {
    return await fetchWithAuth(`/tester/projects/${projectId}`);
  } catch (error) {
    console.error('❌ Error fetching project details:', error);
    throw error;
  }
};

/**
 * Verify if tester has access to a project
 */
export const verifyProjectAccess = async (projectId) => {
  try {
    return await fetchWithAuth(`/tester/verify-access/${projectId}`);
  } catch (error) {
    console.error('❌ Error verifying project access:', error);
    throw error;
  }
};

/**
 * Record tester activity
 */
export const recordActivity = async (activityData) => {
  try {
    return await fetchWithAuth('/tester/activity', {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  } catch (error) {
    console.error('❌ Error recording activity:', error);
    throw error;
  }
};
