import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'MR'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // If user is already logged in via context, redirect them
  useEffect(() => {
    if (user) {
      // Check if it's first login for MR
      if (user.role?.toLowerCase() === 'mr' && user.firstLogin) {
        navigate('/set-new-password');
      } else if (user.role?.toLowerCase() === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/mr-dashboard');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { email, password, role } = formData;
      await login(email, password, role);
      // Redirection will be handled by useEffect when user state changes
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">🏥</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            MR Reporting System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="form-input" placeholder="Enter your email" />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="form-input" placeholder="Enter your password" />
            </div>

            <div>
              <label htmlFor="role" className="form-label">Login as</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="form-input">
                <option value="MR">MR</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Want to join as MR?{' '}
              <Link to="/request-mr-access" className="font-medium text-primary-600 hover:text-primary-500">
                Apply Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;