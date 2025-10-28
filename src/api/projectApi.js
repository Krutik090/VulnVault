// =======================================================================
// FILE: src/api/projectApi.js (UPDATED - COMPLETE CRUD)
// PURPOSE: Centralizes all API calls for project management
// =======================================================================

const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Helper function to handle API responses
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};

/**
 * Create a new project
 * @param {object} projectData - Project data
 * @returns {Promise<object>} Created project
 */
export const createProject = async (projectData) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Get a single project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<object>} Project data
 */
export const getProjectById = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    credentials: 'include'
  });
  
  return handleResponse(response);
};

/**
 * Update a project
 * @param {string} projectId - Project ID
 * @param {object} projectData - Updated data
 * @returns {Promise<object>} Updated project
 */
export const updateProject = async (projectId, projectData) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Delete a project
 * @param {string} projectId - Project ID
 * @returns {Promise<object>} Deletion result
 */
export const deleteProject = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Get all projects with optional filters
 * @param {object} filters - { status, clientId, testerId }
 * @returns {Promise<object>} List of projects
 */
export const getAllProjects = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.clientId) queryParams.append('clientId', filters.clientId);
  if (filters.testerId) queryParams.append('testerId', filters.testerId);
  
  const queryString = queryParams.toString();
  const url = `${API_URL}/projects${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, { credentials: 'include' });
  
  return handleResponse(response);
};

/**
 * Get all active projects (Not Started, Active, Retest)
 * @returns {Promise<object>} List of active projects
 */
export const getActiveProjects = async () => {
  const response = await fetch(`${API_URL}/projects/active`, {
    credentials: 'include'
  });
  
  return handleResponse(response);
};

/**
 * Get all projects for a specific client
 * @param {string} clientId - Client ID
 * @returns {Promise<object>} List of client projects
 */
export const getClientProjects = async (clientId) => {
  const response = await fetch(`${API_URL}/projects/client/${clientId}`, {
    credentials: 'include'
  });
  
  return handleResponse(response);
};

/**
 * Update project status
 * @param {string} projectId - Project ID
 * @param {string} status - New status
 * @returns {Promise<object>} Updated project
 */
export const updateProjectStatus = async (projectId, status) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Get project timesheet
 * @param {string} projectId - Project ID
 * @returns {Promise<object>} Timesheet data
 */
export const getProjectTimesheet = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/timesheet`, {
    credentials: 'include'
  });
  
  return handleResponse(response);
};

/**
 * Add a note to a project
 * @param {string} projectId - Project ID
 * @param {object} noteData - { text, addedBy }
 * @returns {Promise<object>} Updated project
 */
export const addProjectNote = async (projectId, noteData) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
    credentials: 'include',
  });
  
  return handleResponse(response);
};

/**
 * Get all notes for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<object>} List of notes
 */
export const getProjectNotes = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/notes`, {
    credentials: 'include'
  });
  
  return handleResponse(response);
};

/**
 * Get client info by project ID
 * @param {string} projectId - Project ID
 * @returns {Promise<object>} Client information
 */
export const getClientByProjectId = async (projectId) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/client`, {
    credentials: 'include'
  });
  
  return handleResponse(response);
};
