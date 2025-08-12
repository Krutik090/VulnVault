// =======================================================================
// FILE: src/features/admin/ResetPasswordModal.jsx (UPDATED)
// PURPOSE: Modal for resetting user passwords with theme support and enhanced validation.
// =======================================================================
import { useState } from 'react';
import Modal from '../../components/Modal';
import { resetPassword } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const ResetPasswordModal = ({ user, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { theme, color } = useTheme();

  const validateForm = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSaving(true);
    try {
      await resetPassword(user._id, newPassword);
      toast.success(`Password for ${user.name} has been reset successfully.`);
      handleClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    onClose();
  };

  const handlePasswordChange = (field, value) => {
    if (field === 'newPassword') {
      setNewPassword(value);
    } else {
      setConfirmPassword(value);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  if (!user) return null;

  return (
    <div className={`${theme} theme-${color}`}>
      <Modal
        isOpen={!!user}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LockIcon className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Reset Password</h3>
              <p className="text-sm text-muted-foreground">
                Set a new password for this user
              </p>
            </div>
          </div>
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <UserIcon className="text-primary" />
              <div>
                <h4 className="font-medium text-card-foreground">Resetting password for:</h4>
                <p className="text-sm text-muted-foreground">{user.name} ({user.email})</p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertIcon className="text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-1">Security Notice</h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  The user will need to use this new password on their next login. 
                  Make sure to communicate the new password securely.
                </p>
              </div>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-card-foreground mb-2">
              New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className={`
                  w-full pl-10 pr-12 py-3 border rounded-lg bg-background text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                  ${errors.newPassword ? 'border-red-500' : 'border-input'}
                  transition-all duration-200
                `}
                placeholder="Enter new password"
                disabled={isSaving}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSaving}
              >
                {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className={`
                  w-full pl-10 pr-12 py-3 border rounded-lg bg-background text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                  ${errors.confirmPassword ? 'border-red-500' : 'border-input'}
                  transition-all duration-200
                `}
                placeholder="Confirm new password"
                disabled={isSaving}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSaving}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Match Indicator */}
          {newPassword && confirmPassword && (
            <div className={`p-3 rounded-lg border ${
              newPassword === confirmPassword 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm font-medium ${
                newPassword === confirmPassword 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {newPassword === confirmPassword 
                  ? '✓ Passwords match' 
                  : '✗ Passwords do not match'
                }
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-6 py-2.5 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <SaveIcon />
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
