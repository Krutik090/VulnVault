
// =======================================================================
// FILE: src/api/projectDetailsApi.js (UPDATED)
// PURPOSE: Centralizes API calls specifically for the Project Details page.
// =======================================================================
const API_URL_DETAILS = import.meta.env.VITE_API_BASE_URL;

export const getProjectById = async (projectId) => {
  const response = await fetch(`${API_URL_DETAILS}/projects/${projectId}`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch project details.');
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

export const getProjectVulnerabilities = async (projectId) => {
    // FIX: Use the correct, more specific route for fetching vulnerabilities by project.
    const response = await fetch(`${API_URL_DETAILS}/project-vulnerabilities/by-project/${projectId}`, { credentials: 'include' });
    if (!response.ok) {
        throw new Error('Failed to fetch project vulnerabilities.');
    }
    return response.json();
};
