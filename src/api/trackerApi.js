// =======================================================================
// FILE: src/api/trackerApi.js (NEW FILE)
// PURPOSE: Centralizes API calls for time tracking.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all user work logs for a specific date. (Admin only)
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<object>} The list of work logs.
 */
export const getWorkLogsByDate = async (date) => {
  const response = await fetch(`${API_URL}/users/work-logs/${date}`, {
    credentials: 'include',
  });
  // The backend returns 404 if no logs are found, which is okay.
  // We will handle that in the component.
  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to fetch work logs.');
  }
  return response.json();
};


/**
 * Fetches the projects assigned to the currently logged-in user.
 * @returns {Promise<object>} The list of assigned projects.
 */
export const getMyProjects = async () => {
  const response = await fetch(`${API_URL}/users/profile/projects`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch projects.');
  }
  return response.json();
};

/**
 * Logs time for the currently logged-in user.
 * @param {object} timeLogData - { projectName, hours, mins, note }
 * @returns {Promise<object>} The API response.
 */
export const logTime = async (timeLogData) => {
  const response = await fetch(`${API_URL}/users/time-log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(timeLogData),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to log time.');
  return data;
};
