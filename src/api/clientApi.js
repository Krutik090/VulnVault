// =======================================================================
// FILE: src/api/clientApi.js (NEW FILE)
// PURPOSE: Centralizes API calls for client management.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all clients for dropdowns. (Admin only)
 * @returns {Promise<object>} The list of all clients.
 */
export const getAllClients = async () => {
  const response = await fetch(`${API_URL}/clients`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch clients.');
  return response.json();
};