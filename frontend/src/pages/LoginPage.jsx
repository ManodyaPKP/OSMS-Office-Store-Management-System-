import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
//import logoImage from '../assets/logo1.png';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
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
        login(response.data.user);
        
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }
        
        navigate('/');
      }
    } catch (err) {
      console.error('❌ Login error:', err);

      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        if (errorData.status === 'rejected') {
          setErrorType('rejected');
          setError(errorData.message);
          setRejectionReason(errorData.reason || 'No reason provided');
        } else if (errorData.status === 'pending') {
          setErrorType('pending');
          setError(errorData.message);
        } else if (errorData.status === 'approved_not_active') {
          setErrorType('approved_not_active');
          setError(errorData.message);
        } else {
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

  // Load remembered username on component mount
  React.useEffect(() => {
    const remembered = localStorage.getItem('rememberedUsername');
    if (remembered) {
      setUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-[#ffffff] dark:bg-slate-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Welcome back 
            </h2>
            <h3>Asset & Repair Hub</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Please enter your details to sign in
            </p>
          </div>

          {/* Error Messages */}
          {errorType === 'rejected' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
              <div className="flex gap-3">
                <div className="text-xl">❌</div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-800 dark:text-red-300 mb-1">{error}</h4>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                    <strong>Reason:</strong>
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-2 rounded italic">
                    {rejectionReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorType === 'pending' && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-lg">
              <div className="flex gap-3">
                <div className="text-xl">⏳</div>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">{error}</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Your registration is awaiting administrator review. You&apos;ll be able to log in once approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {errorType === 'approved_not_active' && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-lg">
              <div className="flex gap-3">
                <div className="text-xl">⚠️</div>
                <div className="flex-1">
                  <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-1">{error}</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    Please contact your system administrator for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && !errorType && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
              <div className="flex gap-3">
                <div className="text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-cyan-500"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Remember me for 30 days
                </span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset functionality coming soon!')}
                className="text-sm font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Log in'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-700">
        <div className="absolute inset-0 bg-white/20 z-10"></div>
         {/* Background Image */}
        <img 
          src="/src/assets/login01.gif"
          alt="Office Management"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
       
  </div>
    </div>
 );
};

export default LoginPage;