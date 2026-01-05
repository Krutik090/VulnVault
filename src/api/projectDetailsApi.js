// =======================================================================
// FILE: src/api/projectDetailsApi.js (FIXED)
// PURPOSE: Centralizes API calls specifically for the Project Details page.
// =======================================================================

const API_URL_DETAILS = import.meta.env.VITE_API_BASE_URL;

export const getProjectById = async (projectId) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}`, { credentials: 'include' });
  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to fetch project configuration.');
  }
  return response.json();
};

export const getProjectConfig = async (projectId) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}/config`, { credentials: 'include' });
  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to fetch project configuration.');
  }
  return response.json();
};

export const saveProjectConfig = async (projectId, configData) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configData),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to save configuration.');
  return data;
};

export const getProjectNotes = async (projectId) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}/notes`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch notes.');
  return response.json();
};

export const addProjectNote = async (projectId, noteData) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add note.');
  return data;
};

export const getProjectTimesheet = async (projectId) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}/timesheet`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to fetch timesheet.');
  }
  return response.json();
};

/**
 * Generate Project Report (Fetch Implementation)
 * @param {string} projectId 
 */
export const generateProjectReport = async (projectId) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}/report`, {
    method: 'GET',
    // 'credentials: "include"' is the fetch equivalent of axios 'withCredentials: true'
    // It ensures httpOnly cookies (like your secure JWT) are sent with the request.
    credentials: 'include',
    headers: {
      'Cache-Control': 'no-cache' // Force fresh request
    }
  });

  if (!response.ok) {
    // Unlike axios, fetch doesn't throw automatically on 4xx/5xx errors.
    // We try to parse the error message from the backend, or fallback to status text.
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.statusText}`);
  }

  // Return the blob directly so it's easier to use in the component
  return response.blob();
};