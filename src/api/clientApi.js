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


/**
 * Fetches all client names and IDs. (Admin only)
 * @returns {Promise<object>} The list of all client names.
 */
export const getClientNames = async () => {
  const response = await fetch(`${API_URL}/clients/names`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch client names.');
  return response.json();
};


/**
 * Creates a new client. (Admin only)
 * @param {object} clientData - { clientName, serviceType }
 * @returns {Promise<object>} The API response.
 */
export const addClient = async (clientData) => {
  const response = await fetch(`${API_URL}/clients/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add client.');
  return data;
};
