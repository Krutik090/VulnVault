// =======================================================================
// FILE: src/features/profile/ProfilePage.jsx (UPDATED)
// PURPOSE: Displays and allows editing of the user's profile with theme support.
// =======================================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getProfile, updateProfile, updatePassword } from '../../api/userApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

// Icons
const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { theme, color } = useTheme();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the Edit Profile form
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  
  // State for the Change Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
        setName(response.data.name || '');
        setBio(response.data.bio || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Could not load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateProfileForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (bio && bio.length > 500) {
      errors.bio = 'Bio must be less than 500 characters';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await updateProfile({ name: name.trim(), bio: bio.trim() });
      setProfile(response.data);
      
      // Update the user in the global context
      setUser(prevUser => ({ ...prevUser, name: response.data.name }));
      
      toast.success('Profile updated successfully!');
      setProfileErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await updatePassword({ currentPassword, newPassword });
      toast.success(response.message || 'Password updated successfully!');
      
      // Clear password fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
      
      // Hide password visibility
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`${theme} theme-${color} min-h-screen bg-background flex items-center justify-center`}>
        <Spinner message="Loading your profile..." />
      </div>
    );
  }

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <UserIcon className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account settings and security preferences
              </p>
            </div>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-card-foreground">{profile?.name}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <ShieldIcon className="text-primary" />
                <span className="text-sm text-primary font-medium capitalize">
                  {profile?.role} Account
                </span>
              </div>
            </div>
          </div>
          {profile?.bio && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-card-foreground">{profile.bio}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Edit Profile Form */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <EditIcon className="text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground">Edit Profile</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Update your personal information
              </p>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6">
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (profileErrors.name) {
                        setProfileErrors(prev => ({ ...prev, name: null }));
                      }
                    }}
                    className={`
                      w-full px-4 py-3 border rounded-lg bg-background text-foreground 
                      placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                      ${profileErrors.name ? 'border-red-500' : 'border-input'}
                      transition-all duration-200
                    `}
                    placeholder="Enter your full name"
                    disabled={isSavingProfile}
                  />
                  {profileErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{profileErrors.name}</p>
                  )}
                </div>

                {/* Bio Field */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-card-foreground mb-2">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => {
                      setBio(e.target.value);
                      if (profileErrors.bio) {
                        setProfileErrors(prev => ({ ...prev, bio: null }));
                      }
                    }}
                    rows={4}
                    className={`
                      w-full px-4 py-3 border rounded-lg bg-background text-foreground 
                      placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                      ${profileErrors.bio ? 'border-red-500' : 'border-input'}
                      transition-all duration-200 resize-none
                    `}
                    placeholder="Tell us about yourself..."
                    disabled={isSavingProfile}
                  />
                  <div className="flex justify-between mt-1">
                    {profileErrors.bio && (
                      <p className="text-sm text-red-500">{profileErrors.bio}</p>
                    )}
                    <p className="text-xs text-muted-foreground ml-auto">
                      {bio.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <LockIcon className="text-primary" />
                <h3 className="text-lg font-semibold text-card-foreground">Change Password</h3>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Update your account password for better security
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6">
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-card-foreground mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passwordErrors.currentPassword) {
                          setPasswordErrors(prev => ({ ...prev, currentPassword: null }));
                        }
                      }}
                      className={`
                        w-full px-4 py-3 pr-12 border rounded-lg bg-background text-foreground 
                        placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                        ${passwordErrors.currentPassword ? 'border-red-500' : 'border-input'}
                        transition-all duration-200
                      `}
                      placeholder="Enter current password"
                      disabled={isSavingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isSavingPassword}
                    >
                      {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-card-foreground mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordErrors.newPassword) {
                          setPasswordErrors(prev => ({ ...prev, newPassword: null }));
                        }
                      }}
                      className={`
                        w-full px-4 py-3 pr-12 border rounded-lg bg-background text-foreground 
                        placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                        ${passwordErrors.newPassword ? 'border-red-500' : 'border-input'}
                        transition-all duration-200
                      `}
                      placeholder="Enter new password"
                      disabled={isSavingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isSavingPassword}
                    >
                      {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-card-foreground mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordErrors.confirmPassword) {
                          setPasswordErrors(prev => ({ ...prev, confirmPassword: null }));
                        }
                      }}
                      className={`
                        w-full px-4 py-3 pr-12 border rounded-lg bg-background text-foreground 
                        placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                        ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-input'}
                        transition-all duration-200
                      `}
                      placeholder="Confirm new password"
                      disabled={isSavingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      disabled={isSavingPassword}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="w-full bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-semibold hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSavingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <LockIcon />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
          <div className="flex items-start gap-3">
            <ShieldIcon className="text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-card-foreground mb-1">Security Notice</h4>
              <p className="text-sm text-muted-foreground">
                Keep your account secure by using a strong password and updating your profile information regularly. 
                Never share your credentials with others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
