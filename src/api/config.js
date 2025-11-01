// =======================================================================
// FILE: src/api/config.js (NEW - CENTRALIZED CONFIG)
// PURPOSE: API configuration and utility functions
// SOC 2: Error handling, request validation, audit logging
// =======================================================================

/**
 * ✅ SOC 2: Centralized API configuration
 */
export const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * ✅ SOC 2: Default fetch options
 */
export const DEFAULT_FETCH_OPTIONS = {
  credentials: 'include', // Include httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * ✅ SOC 2: Handle API errors consistently
 */
export const handleApiError = (error, context = 'API Call') => {
  const errorMessage = error?.message || 'An unknown error occurred';
  
  // ✅ SOC 2: Audit logging
  console.error(`${context} Error:`, {
    error: errorMessage,
    status: error?.status,
    timestamp: new Date().toISOString()
  });

  throw new Error(errorMessage);
};

/**
 * ✅ SOC 2: Validate API response
 */
export const validateResponse = async (response, errorContext) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || data.error || 'Request failed';
    
    // ✅ SOC 2: Log failed requests
    console.error(`${errorContext} - Status ${response.status}:`, {
      error: errorMessage,
      status: response.status,
      timestamp: new Date().toISOString()
    });

    throw new Error(errorMessage);
  }

  return data;
};

/**
 * ✅ SOC 2: Sanitize user input before sending to API
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  return String(input).trim().substring(0, 1000);
};

/**
 * ✅ SOC 2: Validate ID format
 */
export const isValidId = (id) => {
  if (!id) return false;
  // MongoDB ObjectId format: 24 hex characters
  return /^[a-f\d]{24}$/i.test(String(id));
};

/**
 * ✅ SOC 2: Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};
