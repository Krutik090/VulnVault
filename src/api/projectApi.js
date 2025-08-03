// =======================================================================
// FILE: src/api/projectApi.js (UPDATED)
// PURPOSE: Centralizes all API calls for project management.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all projects with resolved details. (Admin only)
 */
export const getAllProjects = async () => {
  const response = await fetch(`${API_URL}/projects`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch projects.');
  return response.json();
};

/**
 * Creates a new project. (Admin only)
 */
export const createProject = async (projectData) => {
    const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to create project.');
    return data;
};

/**
 * Updates an existing project. (Admin only)
 */
export const updateProject = async (projectId, projectData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update project.');
    return data;
};

/**
 * Deletes a project. (Admin only)
 */
export const deleteProject = async (projectId) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete project.');
    return data;
};


/**
 * Fetches the configuration for a specific project.
 */
export const getProjectConfig = async (projectId) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/config`, { credentials: 'include' });
    if (!response.ok && response.status !== 404) {
        throw new Error('Failed to fetch project configuration.');
    }
    return response.json();
};

/**
 * Creates or updates the configuration for a project.
 */
export const saveProjectConfig = async (projectId, configData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to save configuration.');
    return data;
};