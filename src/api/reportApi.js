// =======================================================================
// FILE: src/api/reportApi.js (NEW FILE)
// PURPOSE: Centralizes API calls for report generation.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Requests a report from the backend and handles the file download.
 * @param {string} projectId - The ID of the project.
 * @param {string} reportType - The type of report (e.g., 'WebApp', 'Network').
 * @returns {Promise<void>}
 */
export const generateReport = async (projectId, reportType) => {
  const response = await fetch(`${API_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, reportType }),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Report generation failed.');
  }

  // Handle the file download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectId}_report.docx`; // Set a default filename
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
