// =======================================================================
// FILE: src/api/userApi.js (COMPLETE & UPDATED)
// PURPOSE: Centralizes all API calls related to user management
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


/**
 * Fetches all users (Admin only).
 * @returns {Promise<object>} List of all users.
 */
export const getAllUsers = async () => {
  const response = await fetch(`${API_URL}/users`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
};

/**
 * Fetches a specific user by ID (Admin only).
 * @param {string} userId - The ID of the user to fetch.
 * @returns {Promise<object>} The user data.
 */
export const getUserById = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
};

/**
 * Creates a new user (Admin only).
 * @param {object} userData - { name, email, password, role }.
 * @returns {Promise<object>} The created user data.
 */
export const createUser = async (userData) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create user');
  }
  
  return data;
};

/**
 * Updates a user by ID (Admin only).
 * @param {string} userId - The ID of the user to update.
 * @param {object} userData - { name, email, role }.
 * @returns {Promise<object>} The updated user data.
 */
export const updateUser = async (userId, userData) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user');
  }
  
  return data;
};

/**
 * Deletes a user by ID (Admin only).
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<object>} Success message.
 */
export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete user');
  }
  
  return data;
};

/**
 * Resets a user's password (Admin only).
 * @param {string} userId - The ID of the user.
 * @param {string} newPassword - The new password.
 * @returns {Promise<object>} Success message.
 */
export const resetUserPassword = async (userId, newPassword) => {
  const response = await fetch(`${API_URL}/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword }),
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to reset password');
  }
  
  return data;
};

/**
 * Updates user avatar/profile picture.
 * @param {FormData} formData - Form data containing the avatar file.
 * @returns {Promise<object>} The updated user data with new avatar URL.
 */
export const updateAvatar = async (formData) => {
  const response = await fetch(`${API_URL}/users/profile/avatar`, {
    method: 'PUT',
    body: formData, // Don't set Content-Type header - browser will set it with boundary
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update avatar');
  }
  
  return data;
};

/**
 * Deletes user avatar/profile picture.
 * @returns {Promise<object>} Success message.
 */
export const deleteAvatar = async () => {
  const response = await fetch(`${API_URL}/users/profile/avatar`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete avatar');
  }
  
  return data;
};

/**
 * Fetches user activity/statistics.
 * @param {string} userId - Optional user ID (defaults to current user).
 * @returns {Promise<object>} User activity data.
 */
export const getUserActivity = async (userId = null) => {
  const url = userId 
    ? `${API_URL}/users/${userId}/activity`
    : `${API_URL}/users/profile/activity`;
    
  const response = await fetch(url, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user activity');
  }
  
  return response.json();
};

/**
 * Updates user preferences/settings.
 * @param {object} preferences - User preferences object.
 * @returns {Promise<object>} Updated preferences.
 */
export const updatePreferences = async (preferences) => {
  const response = await fetch(`${API_URL}/users/profile/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update preferences');
  }
  
  return data;
};

/**
 * ✅ Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch current user');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('❌ Error fetching current user:', error.message);
    throw error;
  }
};

/**
 * ✅ Update user profile
 */
export const updateProfile = async (profileData) => {
  try {
    if (!profileData.name || !profileData.email) {
      throw new Error('Name and email are required');
    }

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error('❌ Error updating profile:', error.message);
    throw error;
  }
};

/**
 * ✅ Change password
 */
export const changePassword = async (passwordData) => {
  try {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) {
      throw new Error('Current and new password are required');
    }

    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('❌ Error changing password:', error.message);
    throw error;
  }
};

/**
 * ✅ NEW: Enable MFA
 */
export const enableMFA = async (mfaMethod = 'authenticator') => {
  try {
    console.log(`🔐 Enabling MFA with method: ${mfaMethod}`);

    const response = await fetch(`${API_URL}/users/mfa/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaMethod }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to enable MFA');
    }

    console.log('✅ MFA setup initiated:', data);

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    console.error('❌ Error enabling MFA:', error.message);
    throw error;
  }
};

/**
 * ✅ NEW: Verify MFA token
 */
export const verifyMFAToken = async (token) => {
  try {
    if (!token) {
      throw new Error('Verification token is required');
    }

    console.log('🔐 Verifying MFA token...');

    const response = await fetch(`${API_URL}/users/mfa/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify MFA token');
    }

    console.log('✅ MFA token verified');

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('❌ Error verifying MFA:', error.message);
    throw error;
  }
};

/**
 * ✅ NEW: Disable MFA
 */
export const disableMFA = async () => {
  try {
    console.log('🔓 Disabling MFA...');

    const response = await fetch(`${API_URL}/users/mfa/disable`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to disable MFA');
    }

    console.log('✅ MFA disabled');

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('❌ Error disabling MFA:', error.message);
    throw error;
  }
};
