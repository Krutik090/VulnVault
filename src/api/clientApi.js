// =======================================================================
// FILE: src/api/clientApi.js (COMPLETE - USING FETCH)
// PURPOSE: API functions for client module with native fetch
// =======================================================================

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6001';
const BASE_URL = `${API_URL}/clients`;

/**
 * Helper function to handle fetch responses
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      status: response.status,
      message: data.message || 'An error occurred',
      data: data
    };
  }
  
  return data;
};

/**
 * Helper function to get fetch options with credentials
 */
const getFetchOptions = (method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: This sends cookies with the request
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  return options;
};

/**
 * Get all clients
 */
export const getAllClients = async () => {
  try {
    const response = await fetch(BASE_URL, getFetchOptions('GET'));
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

/**
 * Get client by ID
 */
export const getClientById = async (clientId) => {
  try {
    const response = await fetch(`${BASE_URL}/${clientId}`, getFetchOptions('GET'));
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching client:', error);
    throw error;
  }
};

/**
 * Get all projects for a client
 */
export const getClientProjects = async (clientId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${clientId}/projects`, 
      getFetchOptions('GET')
    );
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching client projects:', error);
    throw error;
  }
};

/**
 * Get client dashboard data
 */
export const getClientDashboard = async (clientId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${clientId}/dashboard`, 
      getFetchOptions('GET')
    );
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching client dashboard:', error);
    throw error;
  }
};

/**
 * Create new client
 */
export const addClient = async (clientData) => {
  try {
    const response = await fetch(
      BASE_URL, 
      getFetchOptions('POST', clientData)
    );
    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

/**
 * Update client
 */
export const updateClient = async (clientId, clientData) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${clientId}`, 
      getFetchOptions('PUT', clientData)
    );
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

/**
 * Delete client (CASCADE)
 * ⚠️ WARNING: This will delete the client and ALL associated data:
 * - All projects
 * - All vulnerabilities
 * - All uploaded images
 * - User account
 */
export const deleteClient = async (clientId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/${clientId}`, 
      getFetchOptions('DELETE')
    );
    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};
