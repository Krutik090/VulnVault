// =======================================================================
// FILE: src/api/clientApi.js (UPDATED - COMPLETE CRUD)
// PURPOSE: Centralizes all API calls for client management
// =======================================================================

const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Helper function to handle API responses
 * @param {Response} response - The fetch response
 * @returns {Promise<any>} The parsed JSON data
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};

/**
 * Fetches all clients with their project counts
 * @param {object} filters - Optional filters { isActive, search }
 * @returns {Promise<object>} The list of all clients
 */
export const getAllClients = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.isActive !== undefined) {
    queryParams.append('isActive', filters.isActive);
  }
  if (filters.search) {
    queryParams.append('search', filters.search);
  }
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/clients${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, { 
    credentials: 'include' 
  });
  
  return handleResponse(response);
};

/**
 * Fetches a single client by ID
 * @param {string} clientId - The client ID
 * @returns {Promise<object>} The client data
 */
export const getClientById = async (clientId) => {
  const response = await fetch(`${API_URL}/clients/${clientId}`, { 
    credentials: 'include' 
  });
  
  return handleResponse(response);
};

/**
 * Fetches all projects for a specific client
 * @param {string} clientId - The client ID
 * @returns {Promise<object>} The list of client projects
 */
export const getClientProjects = async (clientId) => {
  const response = await fetch(`${API_URL}/clients/${clientId}/projects`, { 
    credentials: 'include' 
  });
  
  return handleResponse(response);
};

/**
 * Fetches all client names (for dropdowns)
 * @param {boolean} activeOnly - Whether to fetch only active clients
 * @returns {Promise<object>} The list of client names
 */
export const getClientNames = async (activeOnly = false) => {
  const url = `${API_URL}/clients/names${activeOnly ? '?activeOnly=true' : ''}`;
  
  const response = await fetch(url, { 
    credentials: 'include' 
  });
  
  return handleResponse(response);
};

/**
 * Creates a new client
 * @param {object} clientData - The client data { clientName, email, location, ... }
 * @returns {Promise<object>} The API response with created client
 */
export const addClient = async (clientData) => {
  const response = await fetch(`${API_URL}/clients/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Updates an existing client
 * @param {string} clientId - The client ID
 * @param {object} clientData - The updated client data
 * @returns {Promise<object>} The API response with updated client
 */
export const updateClient = async (clientId, clientData) => {
  const response = await fetch(`${API_URL}/clients/${clientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientData),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Deletes a client
 * @param {string} clientId - The client ID
 * @returns {Promise<object>} The API response
 */
export const deleteClient = async (clientId) => {
  const response = await fetch(`${API_URL}/clients/${clientId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Toggles the active status of a client
 * @param {string} clientId - The client ID
 * @returns {Promise<object>} The API response with updated client
 */
export const toggleClientStatus = async (clientId) => {
  const response = await fetch(`${API_URL}/clients/${clientId}/toggle-status`, {
    method: 'PATCH',
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Fetches client statistics
 * @returns {Promise<object>} Client statistics (total, active, etc.)
 */
export const getClientStatistics = async () => {
  const response = await fetch(`${API_URL}/clients/statistics`, { 
    credentials: 'include' 
  });
  
  return handleResponse(response);
};
