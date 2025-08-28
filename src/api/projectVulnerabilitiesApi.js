const API_URL = import.meta.env.VITE_API_BASE_URL;
import toast from 'react-hot-toast';

const AI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`;

export const getProjectVulnerabilities = async (projectId) => {
    // FIX: Use the correct, more specific route for fetching vulnerabilities by project.
    const response = await fetch(`${API_URL}/project-vulnerabilities/by-project/${projectId}`, { credentials: 'include' });
    if (!response.ok) {
        throw new Error('Failed to fetch project vulnerabilities.');
    }
    return response.json();
};

/**
 * Adds a new vulnerability instance to a project.
 * @param {string} projectId - The ID of the project.
 * @param {FormData} formData - The form data, including file uploads.
 */
export const addProjectVulnerability = async (projectId, formData) => {
    // When sending FormData, we don't set the Content-Type header.
    // The browser will set it automatically with the correct boundary.
    const response = await fetch(`${API_URL}/project-vulnerabilities/${projectId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add vulnerability.');
    return data;
};

/**
 * Fetches all instances of a specific vulnerability for a given project.
 * @param {string} projectName - The name of the project.
 * @param {string} vulnName - The name of the vulnerability.
 */
export const getVulnerabilityInstances = async (projectName, vulnName) => {
    const params = new URLSearchParams({ projectName, vulnName });
    const response = await fetch(`${API_URL}/project-vulnerabilities/instances?${params}`, {
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch vulnerability instances.');
    return response.json();
};

/**
 * Fetches the full details of a single vulnerability instance.
 * @param {string} vulnId - The ID of the vulnerability instance.
 */
export const getVulnerabilityInstance = async (vulnId) => {
    const response = await fetch(`${API_URL}/project-vulnerabilities/${vulnId}`, {
        credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch vulnerability details.');
    return response.json();
};

/**
 * Updates a specific vulnerability instance.
 * @param {string} vulnId - The ID of the instance to update.
 * @param {object} data - The updated data.
 */
export const updateVulnerabilityInstance = async (vulnId, data) => {
    const response = await fetch(`${API_URL}/project-vulnerabilities/${vulnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to update vulnerability.');
    return result;
};


/**
 * Adds new images to an existing vulnerability instance.
 * @param {string} vulnId - The ID of the vulnerability instance.
 * @param {FormData} formData - The form data containing the new files.
 */
export const addUploads = async (vulnId, formData) => {
    const response = await fetch(`${API_URL}/project-vulnerabilities/${vulnId}/uploads`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to upload images.');
    return result;
};

/**
 * Deletes a specific image from a vulnerability instance.
 * @param {string} vulnId - The ID of the vulnerability instance.
 * @param {string} uploadId - The ID of the image to delete.
 */
export const deleteUpload = async (vulnId, uploadId) => {
    const response = await fetch(`${API_URL}/project-vulnerabilities/${vulnId}/uploads/${uploadId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Failed to delete image.');
    return result;
};

// Add missing functions:
export const getVulnerabilityNames = async () => {
  const response = await fetch(`${API_URL}/project-vulnerabilities/names`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch vulnerability names.');
  return response.json();
};

export const deleteVulnerabilityInstance = async (vulnId) => {
  const response = await fetch(`${API_URL}/project-vulnerabilities/${vulnId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Failed to delete vulnerability.');
  return result;
};


/**
 * Generates vulnerability details using the Gemini API with exponential backoff.
 * @param {string} vulnName - The name of the vulnerability to get details for.
 * @returns {Promise<object>} The parsed JSON response from the API.
 */
export const generateVulnerabilityDetails = async (vulnName) => {
    const systemPrompt = "You are a cybersecurity expert. For the given vulnerability name, provide a detailed description, impact, and recommendation. Format the response as a JSON object with three keys: 'description', 'impact', and 'recommendation'.";
    
    const payload = {
        contents: [{ parts: [{ text: `Vulnerability Name: ${vulnName}` }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: "application/json" }
    };

    let attempts = 0;
    const maxAttempts = 5;
    let delay = 1000; // Start with a 1-second delay

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(AI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.status === 429) {
                // Rate limit error, wait and retry
                toast.error(`Rate limited. Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Double the delay for the next attempt
                attempts++;
                continue; // Skip to the next iteration
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'AI generation failed.');
            }

            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            return JSON.parse(text); // Success, exit the loop

        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error; // Re-throw the final error to be caught by the component
        }
    }

    throw new Error('AI generation failed after multiple retries. Please try again later.');
};
