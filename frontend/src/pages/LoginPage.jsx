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
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(getErrorMessage(err));
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
            {error && (
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
            <p className="text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-cyan-600 hover:text-cyan-700">
                Register here
              </Link>
            </p>
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
