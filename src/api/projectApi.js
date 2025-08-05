// =======================================================================
// FILE: src/api/projectApi.js (REVERTED & CLEANED)
// PURPOSE: Centralizes API calls for project lists and core CRUD.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

// --- Core Project CRUD Functions ---
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

export const deleteProject = async (projectId) => {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete project.');
    return data;
};

// --- Project List Functions (for Dashboards) ---
export const getAllProjects = async () => {
  const response = await fetch(`${API_URL}/projects`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch projects.');
  return response.json();
};

export const getActiveProjects = async () => {
  const response = await fetch(`${API_URL}/projects/active`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch active projects.');
  return response.json();
};

export const getClientProjects = async (clientId) => {
    const response = await fetch(`${API_URL}/projects/client/${clientId}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch client projects.');
    return response.json();
};
