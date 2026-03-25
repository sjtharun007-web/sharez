import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.jsx';
import './AuthPage.css';

const validatePassword = (password) => {
  if (password.length < 8)              return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password))          return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password))          return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password))          return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=\[\]{};':",.<>?]/.test(password))
                                         return 'Password must contain at least one special character';
  return null;
};

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const checks = [
    { label: '8+ characters',       pass: password.length >= 8 },
    { label: 'Uppercase letter',     pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter',     pass: /[a-z]/.test(password) },
    { label: 'Number',               pass: /[0-9]/.test(password) },
    { label: 'Special character',    pass: /[!@#$%^&*()_+\-=\[\]{};':",.<>?]/.test(password) },
  ];

  const passed = checks.filter(c => c.pass).length;
  const strength = passed <= 2 ? 'weak' : passed <= 4 ? 'medium' : 'strong';

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div className={`strength-fill strength-${strength}`}
          style={{ width: `${(passed / 5) * 100}%` }} />
      </div>
      <div className="strength-checks">
        {checks.map(c => (
          <span key={c.label} className={`check-item ${c.pass ? 'pass' : 'fail'}`}>
            {c.pass ? '✓' : '✗'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function RegisterPage() {
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('All fields are required'); return;
    }
    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters'); return;
    }
    const pwdError = validatePassword(form.password);
    if (pwdError) { setError(pwdError); return; }
    if (form.password !== form.confirm) {
      setError('Passwords do not match'); return;
    }

    const result = await register(form.name.trim(), form.email, form.password);
    if (result.success) navigate('/questions');
    else setError(result.message);
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fadeUp">
        <div className="auth-header">
          <div className="auth-logo">◈</div>
          <h1 className="auth-title">Join Sharez</h1>
          <p className="auth-sub">Create your student account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
          <div className="field">
            <label className="field-label">Full Name</label>
            <input className="input" type="text" name="name"
              placeholder="Your name" value={form.name}
              onChange={handleChange} autoComplete="off" />
          </div>

          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" type="email" name="email"
              placeholder="you@college.edu" value={form.email}
              onChange={handleChange} autoComplete="off" />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input className="input" type="password" name="password"
              placeholder="Min 8 chars with A-Z, 0-9, symbol"
              value={form.password} onChange={handleChange}
              autoComplete="new-password" />
            <PasswordStrength password={form.password} />
          </div>

          <div className="field">
            <label className="field-label">Confirm Password</label>
            <input className="input" type="password" name="confirm"
              placeholder="Repeat password" value={form.confirm}
              onChange={handleChange} autoComplete="new-password" />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button type="submit" className="btn btn-primary auth-btn" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Login</Link>
        </p>
      </div>
    </div>
  );
}
