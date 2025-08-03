// =======================================================================
// FILE: src/api/adminApi.js (NEW FILE)
// PURPOSE: Centralizes all API calls for admin-level user management.
// =======================================================================
const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all users from the server. (Admin only)
 * @returns {Promise<object>} The list of all users.
 */
export const getAllUsers = async () => {
  const response = await fetch(`${API_URL}/users`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch users.');
  return response.json();
};

/**
 * Fetches only users with the 'tester' role. (Admin only)
 * @returns {Promise<object>} The list of testers.
 */
export const getTesters = async () => {
    const response = await fetch(`${API_URL}/users/testers`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch testers.');
    return response.json();
};

/**
 * Creates a new user. (Admin only)
 * @param {object} userData - { name, email, password, role }
 * @returns {Promise<object>} The API response.
 */
export const createUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
    credentials: 'include',
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create user.');
  return data;
};

/**
 * Resets a user's password. (Admin only)
 * @param {string} userId - The ID of the user.
 * @param {string} newPassword - The new password.
 * @returns {Promise<object>} The API response.
 */
export const resetPassword = async (userId, newPassword) => {
    const response = await fetch(`${API_URL}/users/${userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to reset password.');
    return data;
};

/**
 * Deletes a user. (Admin only)
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<object>} The API response.
 */
export const deleteUser = async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to delete user.');
    return data;
};