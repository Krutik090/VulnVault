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
