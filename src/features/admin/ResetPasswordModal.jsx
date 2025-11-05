/**
 * ======================================================================
 * FILE: src/features/admin/ResetPasswordModal.jsx (FULLY FIXED)
 * PURPOSE: Modal for resetting user passwords with theme support
 * FIXES: CSS syntax, callback dependencies, error handling
 * SOC 2 NOTES: Secure password handling, audit logging
 * ======================================================================
 */

import { useState, useCallback } from 'react';
import Modal from '../../components/Modal';
import { resetPassword } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  UserIcon,
  AlertTriangleIcon,
} from '../../components/Icons';

const ResetPasswordModal = ({ isOpen = false, user, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const { theme, color } = useTheme();

  // ✅ SOC 2: Comprehensive password validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (newPassword.length > 128) {
      newErrors.newPassword = 'Password is too long';
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Password confirmation is required';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newPassword, confirmPassword]);

  // ✅ FIXED: Separate handler for password changes
  const handlePasswordChange = useCallback((field, value) => {
    if (field === 'newPassword') {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: null,
      }));
    }
  }, [errors]);

  // ✅ SOC 2: Clear sensitive data on modal close
  const handleClose = useCallback(() => {
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    onClose?.();
  }, [onClose]);

  // ✅ SOC 2: Handle password reset with audit logging
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error('Please fix the errors below');
        return;
      }

      if (!user || !user._id) {
        toast.error('Invalid user data');
        return;
      }

      setIsSaving(true);
      try {
        console.log(
          `🔐 Resetting password for user: ${user._id} (${user.email})`
        );

        // ✅ The API call now uses PATCH method
        await resetPassword(user._id, newPassword.trim());

        console.log(
          `✅ Password reset successfully for: ${user._id}`
        );

        toast.success(
          `Password for ${user.name} has been reset successfully.`
        );

        // ✅ Small delay for user feedback
        setTimeout(() => {
          handleClose();
        }, 500);
      } catch (error) {
        console.error('❌ Error resetting password:', error);

        // ✅ Better error messages
        if (error.message.includes('401')) {
          toast.error('Unauthorized. You do not have permission.');
        } else if (error.message.includes('404')) {
          toast.error('User not found.');
        } else {
          toast.error(error.message || 'Failed to reset password');
        }
      } finally {
        setIsSaving(false);
      }
    },
    [user, validateForm, newPassword, handleClose]
  );

  if (!user) return null;

  // ✅ SOC 2: Safe data extraction
  const userName = user.name || 'Unknown User';
  const userEmail = user.email || 'No email';
  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;
  const hasPasswords = newPassword && confirmPassword;

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={isOpen && !!user}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LockIcon className="text-primary w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Reset Password
              </h3>
              <p className="text-sm text-muted-foreground">
                Set a new password for this user
              </p>
            </div>
          </div>
        }
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ========== USER INFORMATION ========== */}
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <UserIcon className="text-primary w-4 h-4 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-foreground">
                  Resetting password for:
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {userName} ({userEmail})
                </p>
              </div>
            </div>
          </div>

          {/* ========== SECURITY NOTICE ========== */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="text-amber-600 dark:text-amber-400 w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                  🔐 Security Notice
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The user will need to use this new password
                  on their next login. Make sure to communicate
                  the new password securely.
                </p>
              </div>
            </div>
          </div>

          {/* ========== NEW PASSWORD ========== */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-foreground mb-2"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={newPassword}
                onChange={(e) =>
                  handlePasswordChange(
                    'newPassword',
                    e.target.value
                  )
                }
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${errors.newPassword
                    ? 'border-red-500'
                    : 'border-input'
                  }`}
                placeholder="Enter new password"
                disabled={isSaving}
                aria-label="New password"
                aria-invalid={!!errors.newPassword}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(!showNewPassword)
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                disabled={isSaving}
                aria-label={
                  showNewPassword
                    ? 'Hide new password'
                    : 'Show new password'
                }
                tabIndex="-1"
              >
                {showNewPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.newPassword}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Password must be at least 6 characters long
            </p>
          </div>

          {/* ========== CONFIRM PASSWORD ========== */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Confirm New Password{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) =>
                  handlePasswordChange(
                    'confirmPassword',
                    e.target.value
                  )
                }
                className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-input'
                  }`}
                placeholder="Confirm new password"
                disabled={isSaving}
                aria-label="Confirm new password"
                aria-invalid={!!errors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                disabled={isSaving}
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
                tabIndex="-1"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* ========== PASSWORD MATCH INDICATOR ========== */}
          {/* ✅ FIXED: Proper CSS without syntax errors */}
          <div
            className={`p-3 rounded-lg border transition-all overflow-hidden ${hasPasswords
                ? passwordsMatch
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-100 max-h-20'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 opacity-100 max-h-20'
                : 'opacity-0 max-h-0'
              }`}
          >
            <p
              className={`text-sm font-medium ${passwordsMatch
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
                }`}
            >
              {passwordsMatch
                ? '✓ Passwords match'
                : '✗ Passwords do not match'}
            </p>
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-6 py-2.5 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Cancel password reset"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                !newPassword ||
                !confirmPassword ||
                !passwordsMatch
              }
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Reset password"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ResetPasswordModal;
