import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || '';

const AdminLogin = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // receive the httpOnly cookie
        body: JSON.stringify({ username, password }),
      });

      const body = await res.json().catch(() => ({}));

      if (res.ok) {
        if (onLoginSuccess) onLoginSuccess();
        navigate('/admin', { replace: true });
      } else {
        setError(body.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <img src="/Gold Logo.png?v=5" alt="Egypt Advisor Tours" className="admin-login-logo" />
          <h1>Admin Login</h1>
          <p>Sign in to manage your website content.</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-login-field">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading || !password}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="admin-login-back">
          <a href="/">← Back to website</a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
