/**
 * ======================================================================
 * FILE: src/features/user/ProfilePage.jsx (COMPLETELY FIXED)
 * PURPOSE: User profile management with modern UI and MFA support
 * FIXES: Added missing imports, functions, proper MFA flow, error handling
 * SOC 2: Centralized icon management, secure credential handling, MFA support
 * ======================================================================
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  enableMFA,
  disableMFA,
  verifyMFAToken,
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
  InfoIcon,
  DownloadIcon,
  CopyIcon,
} from '../../components/Icons';

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();
  const { theme, color } = useTheme();

  // ✅ Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingMFA, setIsSavingMFA] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', or 'mfa'

  // ✅ Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });

  // ✅ Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // ✅ MFA state
  const [mfaData, setMfaData] = useState({
    isMFAEnabled: false,
    mfaMethod: 'authenticator',
    secret: '',
    qrCode: null,
    verificationCode: '',
    backupCodes: [],
  });

  const [mfaSetupStep, setMfaSetupStep] = useState(0); // 0: disabled, 1: setup, 2: verify, 3: enabled
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ✅ SOC 2: Fetch user profile with MFA status
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      console.log(`👤 Fetching user profile for: ${authUser?._id}`);

      const response = await getCurrentUser();

      if (response.success) {
        console.log(`✅ Profile fetched successfully`);

        setProfileData({
          name: response.data.name || '',
          email: response.data.email || '',
        });

        // ✅ Set MFA data from response
        setMfaData((prev) => ({
          ...prev,
          isMFAEnabled: response.data.mfaEnabled || false,
          mfaMethod: response.data.mfaMethod || 'authenticator',
        }));

        // ✅ Set appropriate MFA setup step
        setMfaSetupStep(response.data.mfaEnabled ? 3 : 0);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error.message);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // ✅ Handle password input change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // ✅ Handle MFA verification code input (6 digits only)
  const handleMFAVerificationCodeChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, '') // Remove non-digits
      .slice(0, 6); // Limit to 6 digits

    setMfaData((prev) => ({
      ...prev,
      verificationCode: value,
    }));

    if (errors.verificationCode) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: '',
      }));
    }
  };

  // ✅ Profile validation
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

  // ✅ Password validation
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

  // ✅ Profile submission
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

  // ✅ Password submission
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
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        console.log(`✅ Password changed successfully`);
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
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

  // ✅ MFA enable handler
  const handleEnableMFA = async () => {
    setIsSavingMFA(true);
    try {
      console.log(`🔐 Enabling MFA for user: ${authUser?._id}`);

      const response = await enableMFA('authenticator');

      if (response.success) {
        console.log(`✅ MFA setup initiated`);

        setMfaData((prev) => ({
          ...prev,
          qrCode: response.data.qrCode,
          secret: response.data.secret,
          backupCodes: response.data.backupCodes || [],
          mfaMethod: 'authenticator',
        }));

        setMfaSetupStep(1);
        toast.success('📱 Scan the QR code with your authenticator app');
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

  // ✅ MFA verify handler
  const handleVerifyMFA = async () => {
    if (mfaData.verificationCode.length !== 6) {
      toast.error('⚠️ Please enter a 6-digit code');
      return;
    }

    setIsSavingMFA(true);
    try {
      console.log(`🔐 Verifying MFA token for user: ${authUser?._id}`);

      const response = await verifyMFAToken(mfaData.verificationCode);

      if (response.success) {
        console.log(`✅ MFA token verified and enabled`);

        setMfaData((prev) => ({
          ...prev,
          isMFAEnabled: true,
          verificationCode: '',
        }));

        setMfaSetupStep(3);
        toast.success('✅ Two-factor authentication enabled successfully!');
      } else {
        toast.error(response.message || 'Failed to verify MFA token');
      }
    } catch (error) {
      console.error('❌ Error verifying MFA:', error.message);
      toast.error(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsSavingMFA(false);
    }
  };

  // ✅ MFA disable handler
  const handleDisableMFA = async () => {
    const confirmed = window.confirm(
      '⚠️ Are you sure you want to disable two-factor authentication?\n\nThis will reduce your account security.'
    );

    if (!confirmed) return;

    setIsSavingMFA(true);
    try {
      console.log(`🔓 Disabling MFA for user: ${authUser?._id}`);

      const response = await disableMFA();

      if (response.success) {
        console.log(`✅ MFA disabled successfully`);

        setMfaData((prev) => ({
          ...prev,
          isMFAEnabled: false,
          qrCode: null,
          secret: '',
          backupCodes: [],
          verificationCode: '',
        }));

        setMfaSetupStep(0);
        toast.success('🔓 Two-factor authentication has been disabled');
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

  // ✅ Copy single backup code
  const handleCopyBackupCode = (code, index) => {
    try {
      navigator.clipboard.writeText(code);
      toast.success(`✓ Code ${index + 1} copied!`);
    } catch (error) {
      console.error('❌ Failed to copy code:', error);
      toast.error('Failed to copy code');
    }
  };

  // ✅ Copy all backup codes
  const handleCopyAllBackupCodes = () => {
    try {
      const allCodes = mfaData.backupCodes.join('\n');
      navigator.clipboard.writeText(allCodes);
      toast.success('✓ All codes copied to clipboard!');
    } catch (error) {
      console.error('❌ Failed to copy codes:', error);
      toast.error('Failed to copy codes');
    }
  };

  // ✅ Download backup codes
  const handleDownloadBackupCodes = () => {
    try {
      const content = `Tribastion - MFA Backup Codes\n${'='.repeat(40)}\n\nIMPORTANT: Store these codes safely!\nEach code can only be used once.\n\n${mfaData.backupCodes
        .map((code, i) => `${i + 1}. ${code}`)
        .join(
          '\n'
        )}\n\nGenerated: ${new Date().toLocaleString()}`;

      const element = document.createElement('a');
      element.setAttribute(
        'href',
        `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
      );
      element.setAttribute('download', `mfa-backup-codes-${Date.now()}.txt`);
      element.style.display = 'none';

      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success('✓ Backup codes downloaded!');
    } catch (error) {
      console.error('❌ Failed to download codes:', error);
      toast.error('Failed to download codes');
    }
  };

  // ✅ MFA step navigation
  const handleMFAStepBack = () => {
    setMfaSetupStep(1);
    setMfaData((prev) => ({
      ...prev,
      verificationCode: '',
    }));
  };

  const handleMFASetupCancel = () => {
    setMfaSetupStep(0);
    setMfaData((prev) => ({
      ...prev,
      qrCode: null,
      secret: '',
      backupCodes: [],
      verificationCode: '',
    }));
    toast.info('MFA setup cancelled');
  };

  // ✅ Role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
      tester:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      client:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
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
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-4xl font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>

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

            {authUser?.createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm">
                  Member since{' '}
                  {new Date(authUser.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
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
            <div className="space-y-6 max-w-4xl">
              {/* MFA Status Card */}
              <div
                className={`p-6 rounded-lg border ${
                  mfaData.isMFAEnabled
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  {mfaData.isMFAEnabled ? (
                    <>
                      <CheckCircleIcon className="text-green-600 dark:text-green-400 w-6 h-6 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                          ✅ Two-Factor Authentication Enabled
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-green-700 dark:text-green-400">
                            Your account is protected with{' '}
                            <span className="font-semibold">
                              {mfaData.mfaMethod === 'authenticator'
                                ? 'an authenticator app (TOTP)'
                                : 'SMS verification'}
                            </span>
                            . You'll need to provide a verification code when
                            signing in.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              🔐 Protected
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              ✓ Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangleIcon className="text-amber-600 dark:text-amber-400 w-6 h-6 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
                          ⚠️ Two-Factor Authentication Disabled
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            Enable MFA to add an extra layer of security to your
                            account. Your account is currently protected only by
                            your password.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                              ⚠️ Not Protected
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
                              💡 Recommended
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* MFA Information */}
              <div className="bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldIcon className="text-primary w-6 h-6" />
                  <h4 className="text-lg font-semibold text-foreground">
                    🔐 What is Two-Factor Authentication?
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Two-factor authentication (2FA) adds an extra layer of security
                  to your account by requiring a second verification method
                  beyond your password. This makes it extremely difficult for
                  unauthorized users to access your account.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex gap-3">
                    <CheckCircleIcon className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        Enhanced Security
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Protects against password breaches and phishing attacks
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircleIcon className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        Authenticator App
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Works with Google Authenticator, Microsoft Authenticator,
                        Authy, etc.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircleIcon className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        Backup Codes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recovery codes provided if you lose your authenticator
                        device
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircleIcon className="text-green-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        Easy to Use
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Simple setup process with clear step-by-step instructions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 0: Disabled - Show Enable Button */}
              {!mfaData.isMFAEnabled && mfaSetupStep === 0 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                    <InfoIcon className="text-blue-600 dark:text-blue-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                        Get Started
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Click the button below to start setting up two-factor
                        authentication on your account.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
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
                  </div>
                </div>
              )}

              {/* Step 1: QR Code Display */}
              {!mfaData.isMFAEnabled && mfaSetupStep === 1 && mfaData.qrCode && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <InfoIcon className="text-blue-600 dark:text-blue-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          📱 Step 1: Scan QR Code
                        </p>
                        <ol className="text-sm text-blue-700 dark:text-blue-400 space-y-1 ml-4 list-decimal">
                          <li>
                            Download an authenticator app (Google Authenticator,
                            Authy, Microsoft Authenticator)
                          </li>
                          <li>Open the app and create a new account</li>
                          <li>
                            Scan the QR code below or enter the secret key
                            manually
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center gap-4">
                    <img
                      src={mfaData.qrCode}
                      alt="MFA QR Code"
                      className="w-64 h-64 border border-border rounded-lg p-2 bg-white"
                    />
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Or enter this key manually:
                      </p>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="text-sm font-mono text-foreground flex-1">
                          {mfaData.secret || 'Loading...'}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(mfaData.secret);
                            toast.success('Secret key copied!');
                          }}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded transition-colors"
                          title="Copy to clipboard"
                          aria-label="Copy secret key"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={handleMFASetupCancel}
                      disabled={isSavingMFA}
                      className="px-4 py-2 border border-input text-foreground rounded-lg font-medium transition-colors hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setMfaSetupStep(2)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90"
                    >
                      Next: Verify Code
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Verification Code */}
              {!mfaData.isMFAEnabled && mfaSetupStep === 2 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <InfoIcon className="text-blue-600 dark:text-blue-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                          📱 Step 2: Verify Your Code
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Enter the 6-digit code from your authenticator app to
                          confirm the setup.
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormInput
                    label="6-Digit Verification Code"
                    name="verificationCode"
                    type="text"
                    value={mfaData.verificationCode}
                    onChange={handleMFAVerificationCodeChange}
                    placeholder="000000"
                    maxLength="6"
                    required
                    icon={<SmartphoneIcon className="w-5 h-5" />}
                    aria-label="6-digit verification code"
                  />

                  <div className="flex gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={handleMFAStepBack}
                      disabled={isSavingMFA}
                      className="px-4 py-2 border border-input text-foreground rounded-lg font-medium transition-colors hover:bg-accent"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyMFA}
                      disabled={isSavingMFA || mfaData.verificationCode.length !== 6}
                      className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg font-medium transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingMFA ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-2" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Enable'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Backup Codes */}
              {mfaSetupStep === 3 && mfaData.backupCodes.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircleIcon className="text-green-600 dark:text-green-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                          ✅ Setup Complete!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Your two-factor authentication is now enabled. Save
                          your backup codes in a secure location.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <LockIcon className="text-amber-600 w-5 h-5" />
                      <h4 className="text-lg font-semibold text-foreground">
                        📋 Backup Codes
                      </h4>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                      <AlertTriangleIcon className="text-amber-600 dark:text-amber-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                          ⚠️ Save These Codes
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          You can use backup codes to access your account if you
                          lose your authenticator device. Each code can only be
                          used once. Store them in a safe place.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950 dark:bg-slate-900 rounded-lg p-4 font-mono text-sm space-y-2 max-h-64 overflow-y-auto">
                      {mfaData.backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-slate-300 hover:text-white transition-colors py-1 px-2 hover:bg-slate-800 rounded"
                        >
                          <span>
                            {index + 1}. {code}
                          </span>
                          <button
                            onClick={() =>
                              handleCopyBackupCode(code, index)
                            }
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy code"
                            aria-label={`Copy backup code ${index + 1}`}
                          >
                            <CopyIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                      <button
                        onClick={handleCopyAllBackupCodes}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        <CopyIcon className="w-4 h-4" />
                        Copy All Codes
                      </button>

                      <button
                        onClick={handleDownloadBackupCodes}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-input text-foreground rounded-lg hover:bg-accent transition-colors font-medium"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Download Codes
                      </button>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <button
                        onClick={() => {
                          setMfaSetupStep(0);
                          setMfaData((prev) => ({
                            ...prev,
                            verificationCode: '',
                            qrCode: null,
                            secret: '',
                          }));
                        }}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MFA Enabled: Show Disable Button */}
              {mfaData.isMFAEnabled && mfaSetupStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-900/30 border border-border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-foreground">
                      🔧 MFA Management
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your two-factor authentication is active and protecting
                      your account. You can disable it below if needed.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border">
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
