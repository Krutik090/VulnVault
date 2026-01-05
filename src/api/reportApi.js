// =======================================================================
// FILE: src/api/reportApi.js (FIXED)
// PURPOSE: Centralizes API calls for report generation.
// =======================================================================

const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ✅ FIXED: Generate and download report
 * @param {string} projectId - The ID of the project.
 * @param {string} reportType - The type of report (optional, defaults to 'WebApp').
 * @returns {Promise}
 */
export const generateReport = async (projectId, reportType = 'WebApp') => {
  try {
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

    // ✅ FIXED: Handle different response types
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // If backend returns JSON with download URL
      const data = await response.json();
      return { 
        success: true, 
        data: data,
        message: 'Report generated successfully' 
      };
    } else {
      // If backend returns file directly
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `${projectId}_report.docx`;
      
      // Auto-download the file
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      return { 
        success: true, 
        data: { reportPath: url },
        message: 'Report downloaded successfully' 
      };
    }
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
};
