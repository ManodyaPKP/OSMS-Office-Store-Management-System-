import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import DeleteAccountModal from '../components/DeleteAccountModal';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('Loading profile...');
      const response = await api.get('/users/profile/me');
      console.log('Profile response:', response.data);
      
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          username: response.data.data.username || '',
          full_name: response.data.data.full_name || '',
          bio: response.data.data.bio || '',
          phone: response.data.data.phone || ''
        });
        
        if (response.data.data.hasProfilePicture) {
          loadProfilePicture(response.data.data.id);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePicture = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/users/profile/picture/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setProfilePictureUrl(url);
      }
    } catch (err) {
      console.error('Error loading profile picture:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePictureUrl(event.target.result);
      };
      reader.readAsDataURL(file);
      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await api.post('/users/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage('Profile picture updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload picture');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      const response = await api.delete('/users/profile/picture');
      if (response.data.success) {
        setProfilePictureUrl(null);
        setMessage('Profile picture deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete picture');
      setTimeout(() => setError(''), 3000);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const response = await api.put('/users/profile/update', formData);
      
      if (response.data.success) {
        setMessage('Profile updated successfully!');
        setEditMode(false);
        
        if (updateUser && response.data.data) {
          updateUser({
            username: response.data.data.username,
            full_name: response.data.data.full_name
          });
        }
        
        loadProfile();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setSaving(true);
      const response = await api.post('/users/profile/change-password', passwordData);
      
      if (response.data.success) {
        setMessage('Password changed successfully!');
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40 dark:bg-slate-800 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              ← Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          </div>
          <button 
            onClick={logout} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 rounded-lg dark:bg-green-900/20 dark:border-green-500">
            <div className="flex items-center justify-between">
              <span className="text-green-800 dark:text-green-300">✅ {message}</span>
              <button onClick={() => setMessage('')} className="text-green-800 dark:text-green-300 text-xl">&times;</button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg dark:bg-red-900/20 dark:border-red-500">
            <div className="flex items-center justify-between">
              <span className="text-red-800 dark:text-red-300">❌ {error}</span>
              <button onClick={() => setError('')} className="text-red-800 dark:text-red-300 text-xl">&times;</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Card - Left Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex flex-col items-center">
                {/* User Name - Displayed prominently above picture */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile?.full_name || profile?.username}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">@{profile?.username}</p>
                </div>

                {/* Profile Picture */}
                <div className="relative mb-4">
                  {profilePictureUrl ? (
                    <img
                      src={profilePictureUrl}
                      alt={profile?.full_name || 'Profile'}
                      className="w-32 h-32 rounded-full object-cover border-4 border-cyan-600 shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center border-4 border-white shadow-lg">
                      <span className="text-5xl text-white">
                        {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || '👤'}
                      </span>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Role Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold capitalize dark:bg-cyan-900 dark:text-cyan-200">
                    {profile?.role || 'User'}
                  </span>
                </div>

                {/* Upload Buttons */}
                <div className="space-y-2 w-full">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50"
                  >
                    📸 Upload Picture
                  </button>
                  
                  {profilePictureUrl && (
                    <button
                      onClick={deleteProfilePicture}
                      disabled={uploading}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      🗑️ Remove Picture
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                  Formats: JPG, PNG, GIF, WebP<br />
                  Max size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information Card - Right Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Username</label>
                      <p className="text-slate-900 dark:text-white font-mono">{profile?.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                      <p className="text-slate-900 dark:text-white">{profile?.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                      <p className="text-slate-900 dark:text-white">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Department</label>
                      <p className="text-slate-900 dark:text-white">{profile?.department_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Designation</label>
                      <p className="text-slate-900 dark:text-white">{profile?.designation || 'Not specified'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Bio</label>
                    <p className="text-slate-900 dark:text-white">{profile?.bio || 'No bio added yet'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                    <p className="text-slate-900 dark:text-white">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username *</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Tell us about yourself..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 8900"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : '✓ Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          username: profile?.username || '',
                          full_name: profile?.full_name || '',
                          bio: profile?.bio || '',
                          phone: profile?.phone || ''
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Theme Preference Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900 dark:text-white font-medium">Theme Preference</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Choose between light and dark mode</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
                >
                  {theme === 'light' ? (
                    <>
                      <span className="text-lg">🌙</span>
                      Switch to Dark Mode
                    </>
                  ) : (
                    <>
                      <span className="text-lg">☀️</span>
                      Switch to Light Mode
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Password Change Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Security</h2>
              
              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  🔑 Change Password
                </button>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); changePassword(); }} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Minimum 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-600 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {saving ? 'Changing...' : '✓ Change Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="flex-1 px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Delete Account Card - Danger Zone */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6 dark:bg-slate-800 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Danger Zone</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-900 dark:text-white font-medium text-red-600 dark:text-red-400">Delete Account</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
      />
    </div>
  );
};

export default ProfilePage;