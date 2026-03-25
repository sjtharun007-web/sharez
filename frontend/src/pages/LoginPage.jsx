import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.jsx';
import './AuthPage.css';

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Client-side validation
    if (!email.trim())    { setError('Please enter your email');    return; }
    if (!password.trim()) { setError('Please enter your password'); return; }

    setLoading(true);
    setError('');

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        navigate('/questions');
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeUp">
        <div className="auth-header">
          <div className="auth-logo">◈</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Login to your Sharez account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className={`input ${error && !email ? 'input-error' : ''}`}
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              className={`input ${error && !password ? 'input-error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoComplete="new-password"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading
              ? <><div className="spinner btn-spinner" /> Logging in…</>
              : 'Login'
            }
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
