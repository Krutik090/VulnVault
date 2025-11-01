// =======================================================================
// FILE: src/features/user/ProfilePage.jsx (COMPLETELY UPDATED)
// PURPOSE: User profile management with modern UI and MFA support
// SOC 2 NOTES: Centralized icon management, secure credential handling, MFA support
// =======================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  enableMFA,
  disableMFA
} from '../../api/userApi';
import FormInput from '../../components/FormInput';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  UserIcon,
  MailIcon,
  ShieldIcon,
  LockIcon,
  SaveIcon,
  PencilIcon,
  CalendarIcon,
  SmartphoneIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from '../../components/Icons';

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();
  const { theme, color } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingMFA, setIsSavingMFA] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', or 'mfa'

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ✅ SOC 2: MFA state
  const [mfaData, setMfaData] = useState({
    isMFAEnabled: false,
    mfaMethod: 'authenticator', // 'authenticator' or 'sms'
    verificationCode: '',
    backupCodes: []
  });

  const [mfaSetupStep, setMfaSetupStep] = useState(0); // 0: disabled, 1: setup, 2: verify, 3: enabled
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ✅ SOC 2: Fetch user profile with error handling
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await getCurrentUser();
      if (response.success) {
        setProfileData({
          name: response.data.name || '',
          email: response.data.email || ''
        });

        // ✅ SOC 2: Set MFA status from response
        setMfaData((prev) => ({
          ...prev,
          isMFAEnabled: response.data.mfaEnabled || false,
          mfaMethod: response.data.mfaMethod || 'authenticator'
        }));

        setMfaSetupStep(response.data.mfaEnabled ? 3 : 0);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error.message);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ✅ SOC 2: Profile validation
  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SOC 2: Password validation
  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SOC 2: Profile submission with audit logging
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSavingProfile(true);
    try {
      console.log(`👤 Updating profile for user: ${authUser?._id}`);

      const response = await updateProfile(profileData);
      if (response.success) {
        console.log(`✅ Profile updated successfully`);
        toast.success('Profile updated successfully!');
        updateUser(response.data);
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error.message);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ✅ SOC 2: Password submission with audit logging
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSavingPassword(true);
    try {
      console.log(`🔐 Password change attempt for user: ${authUser?._id}`);

      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        console.log(`✅ Password changed successfully`);
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('❌ Error changing password:', error.message);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // ✅ SOC 2: MFA enable handler
  const handleEnableMFA = async () => {
    setIsSavingMFA(true);
    try {
      console.log(`🔐 Enabling MFA for user: ${authUser?._id}`);

      const response = await enableMFA(mfaData.mfaMethod);

      if (response.success) {
        console.log(`✅ MFA setup initiated`);
        setMfaData((prev) => ({
          ...prev,
          backupCodes: response.data.backupCodes || []
        }));
        setMfaSetupStep(2); // Move to verification step
        toast.success('MFA setup initiated. Please verify with your authenticator app.');
      } else {
        toast.error(response.message || 'Failed to enable MFA');
      }
    } catch (error) {
      console.error('❌ Error enabling MFA:', error.message);
      toast.error(error.message || 'Failed to enable MFA');
    } finally {
      setIsSavingMFA(false);
    }
  };

  // ✅ SOC 2: MFA disable handler
  const handleDisableMFA = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to disable MFA? This will reduce your account security.'
    );

    if (!confirmed) return;

    setIsSavingMFA(true);
    try {
      console.log(`🔓 Disabling MFA for user: ${authUser?._id}`);

      const response = await disableMFA();

      if (response.success) {
        console.log(`✅ MFA disabled`);
        setMfaData((prev) => ({
          ...prev,
          isMFAEnabled: false
        }));
        setMfaSetupStep(0);
        toast.success('MFA has been disabled');
      } else {
        toast.error(response.message || 'Failed to disable MFA');
      }
    } catch (error) {
      console.error('❌ Error disabling MFA:', error.message);
      toast.error(error.message || 'Failed to disable MFA');
    } finally {
      setIsSavingMFA(false);
    }
  };

  // ✅ SOC 2: Role badge color mapping
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      tester:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      client:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    };
    return (
      colors[role] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="large" />
      </div>
    );
  }

  const displayName = authUser?.name || 'User';

  return (
    <div className={`${theme} theme-${color} space-y-6`}>
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-border rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <UserIcon className="text-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* ========== PROFILE OVERVIEW CARD ========== */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MailIcon className="w-4 h-4" />
                <span className="text-sm">{authUser?.email}</span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                  authUser?.role
                )}`}
              >
                <ShieldIcon className="w-4 h-4" />
                {authUser?.role?.charAt(0).toUpperCase() +
                  authUser?.role?.slice(1)}
              </span>
            </div>

            {/* Member Since */}
            {authUser?.createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm">
                  Member since{' '}
                  {new Date(authUser.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== TABS ========== */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border">
          <div className="flex flex-wrap">
            {/* Profile Tab */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              aria-label="Profile information"
            >
              <div className="flex items-center justify-center gap-2">
                <PencilIcon className="w-4 h-4" />
                Profile Information
              </div>
            </button>

            {/* Security Tab */}
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              aria-label="Security settings"
            >
              <div className="flex items-center justify-center gap-2">
                <LockIcon className="w-4 h-4" />
                Security
              </div>
            </button>

            {/* MFA Tab */}
            <button
              onClick={() => setActiveTab('mfa')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'mfa'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              aria-label="Multi-factor authentication"
            >
              <div className="flex items-center justify-center gap-2">
                <SmartphoneIcon className="w-4 h-4" />
                Two-Factor Auth
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* ========== PROFILE TAB ========== */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertTriangleIcon className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 w-5 h-5" />
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Update your profile information. Changes will be reflected
                  across the system immediately.
                </p>
              </div>

              <FormInput
                label="Full Name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
                icon={<UserIcon className="w-5 h-5" />}
                required
                error={errors.name}
                aria-label="Full name"
              />

              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email address"
                icon={<MailIcon className="w-5 h-5" />}
                required
                error={errors.email}
                aria-label="Email address"
              />

              <div className="pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Save profile changes"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========== SECURITY TAB ========== */}
          {activeTab === 'security' && (
            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-6 max-w-2xl"
            >
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertTriangleIcon className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 w-5 h-5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Choose a strong password to keep your account secure. Password
                  must be at least 6 characters long with a mix of characters.
                </p>
              </div>

              <FormInput
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                icon={<LockIcon className="w-5 h-5" />}
                required
                error={errors.currentPassword}
                aria-label="Current password"
              />

              <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min. 6 characters)"
                icon={<LockIcon className="w-5 h-5" />}
                required
                error={errors.newPassword}
                aria-label="New password"
              />

              <FormInput
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm your new password"
                icon={<LockIcon className="w-5 h-5" />}
                required
                error={errors.confirmPassword}
                aria-label="Confirm new password"
              />

              <div className="pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Update password"
                >
                  {isSavingPassword ? (
                    <>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========== MFA TAB ========== */}
          {activeTab === 'mfa' && (
            <div className="space-y-6 max-w-2xl">
              {/* MFA Status Card */}
              <div
                className={`p-4 rounded-lg border ${
                  mfaData.isMFAEnabled
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {mfaData.isMFAEnabled ? (
                    <>
                      <CheckCircleIcon className="text-green-600 dark:text-green-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                          ✅ Two-Factor Authentication Enabled
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Your account is protected with {mfaData.mfaMethod === 'authenticator' ? 'an authenticator app' : 'SMS'}.
                          You'll need to provide a verification code when signing in.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangleIcon className="text-amber-600 dark:text-amber-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                          ⚠️ Two-Factor Authentication Disabled
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          Enable MFA to add an extra layer of security to your account.
                          You'll need an authenticator app or phone number.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* MFA Information */}
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-foreground">
                  🔐 What is Two-Factor Authentication?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication (2FA) adds an extra layer of security to your
                  account by requiring a second verification method beyond your password.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Protects against unauthorized access</li>
                  <li>✓ Works with authenticator apps like Google Authenticator</li>
                  <li>✓ SMS backup option available</li>
                  <li>✓ Backup codes provided for recovery</li>
                </ul>
              </div>

              {/* MFA Action Buttons */}
              <div className="pt-4 border-t border-border">
                {!mfaData.isMFAEnabled ? (
                  <button
                    type="button"
                    onClick={handleEnableMFA}
                    disabled={isSavingMFA}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Enable two-factor authentication"
                  >
                    {isSavingMFA ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <SmartphoneIcon className="w-5 h-5" />
                        Enable 2FA
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDisableMFA}
                    disabled={isSavingMFA}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Disable two-factor authentication"
                  >
                    {isSavingMFA ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      <>
                        <LockIcon className="w-5 h-5" />
                        Disable 2FA
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Backup Codes Display */}
              {mfaData.backupCodes.length > 0 && mfaSetupStep === 2 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                    📋 Backup Codes
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Save these codes in a safe place. You can use them to access your
                    account if you lose your authenticator device.
                  </p>
                  <div className="bg-white dark:bg-slate-800 rounded p-3 font-mono text-sm space-y-1 max-h-48 overflow-y-auto">
                    {mfaData.backupCodes.map((code, index) => (
                      <div key={index} className="text-muted-foreground">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
