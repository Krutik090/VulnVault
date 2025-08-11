// =======================================================================
// FILE: src/api/toolsApi.js (NEW FILE)
// PURPOSE: Centralizes API calls for security tools.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches subdomains for a given domain from the backend.
 * @param {string} domain - The domain to search.
 * @returns {Promise<object>} The list of subdomains.
 */
export const findSubdomains = async (domain) => {
  const response = await fetch(`${API_URL}/tools/subdomains?domain=${encodeURIComponent(domain)}`, {
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to find subdomains.');
  }
  return data;
};
