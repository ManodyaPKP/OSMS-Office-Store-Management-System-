import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { Button, Input, Alert } from '../components/UI';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'rejected', 'pending', 'approved_not_active', or empty
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setRejectionReason('');
    setLoading(true);

    try {
      console.log(`🔐 Login attempt: username="${username}"`);
      const response = await authAPI.login(username, password);
      console.log('✅ Login successful:', response.data);
      
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Login error:');
      console.error('  Status:', err.response?.status);
      console.error('  Data:', err.response?.data);
      console.error('  Full error:', err);

      // Check if the error response contains registration status info
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        console.log('📋 Error data status field:', errorData.status);
        
        if (errorData.status === 'rejected') {
          console.log('  ➜ Setting errorType to "rejected"');
          setErrorType('rejected');
          setError(errorData.message);
          setRejectionReason(errorData.reason || 'No reason provided');
        } else if (errorData.status === 'pending') {
          console.log('  ➜ Setting errorType to "pending"');
          setErrorType('pending');
          setError(errorData.message);
        } else if (errorData.status === 'approved_not_active') {
          console.log('  ➜ Setting errorType to "approved_not_active"');
          setErrorType('approved_not_active');
          setError(errorData.message);
        } else {
          console.log('  ➜ No registration status, using generic error message');
          setErrorType('');
          setError(getErrorMessage(err));
        }
      } else {
        setErrorType('');
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-primary px-8 py-12 text-center">
            <div className="text-5xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold text-black">Store Management</h1>
            <p className="text-primary-100 text-sm text-black mt-2">System Administration Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Registration Rejected - Red Alert */}
            {errorType === 'rejected' && (
              <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded">
                <div className="flex gap-3">
                  <div className="text-2xl">❌</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-red-900 mb-1">{error}</h4>
                    <p className="text-sm text-red-800 mb-2"><strong>Reason:</strong></p>
                    <p className="text-sm text-red-700 bg-red-100 p-2 rounded italic">{rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Pending - Yellow Alert */}
            {errorType === 'pending' && (
              <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded">
                <div className="flex gap-3">
                  <div className="text-2xl">⏳</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-amber-900 mb-1">{error}</h4>
                    <p className="text-sm text-amber-800">Your registration is awaiting administrator review. You'll be able to log in once approved.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Account Not Active - Orange Alert */}
            {errorType === 'approved_not_active' && (
              <div className="p-4 bg-orange-50 border-l-4 border-orange-600 rounded">
                <div className="flex gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-orange-900 mb-1">{error}</h4>
                    <p className="text-sm text-orange-800">Please contact your system administrator for assistance.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Default Error - Red Alert */}
            {error && !errorType && (
              <Alert variant="danger" icon="⚠️">
                {error}
              </Alert>
            )}

            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                '🔐 Sign In'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-3">
              Department Of Government Information 
            </p>
            <p className="text-sm mb-3">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-700">
                Register here
              </Link>
            </p>
            {errorType === 'rejected' && (
              <p className="text-xs text-red-600 border-t pt-3 mt-3">
                If you believe this rejection is in error, you may{' '}
                <Link to="/register" className="font-semibold hover:text-red-700 underline">
                  submit a new registration
                </Link>
                {' '}or contact your administrator.
              </p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white bg-opacity-20 backdrop-blur rounded-xl p-4 text-white text-sm">
          <p className="flex items-start gap-2">
            <span className="text-lg">ℹ️</span>
            <span>Use your administrative credentials to access the store management system.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
