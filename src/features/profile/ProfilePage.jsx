

// =======================================================================
// FILE: src/features/profile/ProfilePage.jsx (FIXED)
// PURPOSE: Displays and allows editing of the user's profile.
// =======================================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile, updatePassword } from '../../api/userApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const ProfilePage = () => {
  const { user, setUser } = useAuth(); // Assuming setUser is exposed from AuthContext to update global state
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for the Edit Profile form
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // State for the Change Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        setProfile(response.data);
        setName(response.data.name);
        setBio(response.data.bio || '');
      } catch (error) {
        toast.error('Could not load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const response = await updateProfile({ name, bio });
      setProfile(response.data);
      // Also update the user in the global context
      setUser(prevUser => ({...prevUser, name: response.data.name}));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
    }
    setIsSavingPassword(true);
    try {
      const response = await updatePassword({ currentPassword, newPassword });
      toast.success(response.message);
      // Clear password fields after successful update
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-pink-500 text-white flex items-center justify-center text-3xl font-bold">
          {profile?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hi, {profile?.name}</h1>
          <p className="text-gray-500 capitalize">{profile?.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Profile Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleProfileUpdate} className="bg-white shadow rounded-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-700">Edit Profile</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" id="email" value={profile?.email || ''} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea id="bio" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"></textarea>
              </div>
            </div>
            <div className="p-6 bg-gray-50 text-right rounded-b-lg">
              <button type="submit" disabled={isSavingProfile} className="px-6 py-2 text-white font-semibold rounded-lg shadow-md disabled:opacity-60 transition" style={{ background: 'linear-gradient(to right, #EC008C, #FC6767)' }}>
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div>
          <form onSubmit={handlePasswordChange} className="bg-white shadow rounded-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
              </div>
            </div>
            <div className="p-6 bg-gray-50 text-right rounded-b-lg">
                <button type="submit" disabled={isSavingPassword} className="px-6 py-2 text-white font-semibold rounded-lg shadow-md disabled:opacity-60 transition" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;