// =======================================================================
// FILE: src/api/userApi.js (NEW FILE)
// PURPOSE: Centralizes all API calls related to user management.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches the profile of the currently logged-in user.
 * @returns {Promise<object>} The user profile data.
 */
export const getProfile = async () => {
  const response = await fetch(`${API_URL}/users/profile`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

/**
 * Updates the profile of the currently logged-in user.
 * @param {object} profileData - The data to update { name, bio }.
 * @returns {Promise<object>} The updated user profile data.
 */
export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to update profile');
  }
  return response.json();
};

/**
 * Updates the password for the currently logged-in user.
 * @param {object} passwordData - { currentPassword, newPassword }.
 * @returns {Promise<object>} The success message from the API.
 */
export const updatePassword = async (passwordData) => {
  const response = await fetch(`${API_URL}/users/profile/password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passwordData),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update password');
  }
  return data;
};