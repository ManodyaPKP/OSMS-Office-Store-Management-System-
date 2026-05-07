import React, { useState } from 'react';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirmPassword) {
      setError('Please enter your password to confirm');
      return;
    }

    if (!window.confirm('⚠️ WARNING: This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await profileAPI.deleteAccount(confirmPassword);
      
      if (response.data.success) {
        alert(response.data.message);
        logout();
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            Delete Account
          </h2>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-slate-700 text-2xl dark:text-slate-400 dark:hover:text-slate-200"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-600 rounded-lg dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-300 font-semibold mb-2">Warning!</p>
          <p className="text-sm text-red-700 dark:text-red-400">
            This action is <strong>permanent</strong> and cannot be undone. 
            All your profile data, messages, and activity will be permanently deleted.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm dark:bg-red-900/30 dark:text-red-300">
            ❌ {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Enter your password to confirm
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Your password"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleDelete()}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;