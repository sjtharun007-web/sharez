import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore.jsx';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };
  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner container">

        {/* Brand */}
        <Link to={user ? '/questions' : '/'} className="navbar-brand">
          <div className="brand-logo">
            <img src="/logo.png" alt="Sharez" className="brand-logo-img" onError={e => e.target.style.display='none'} />
            <span className="brand-icon-fallback">◈</span>
          </div>
          <span className="brand-text">Sharez</span>
        </Link>

        {/* Nav links */}
        {user && (
          <div className="navbar-links">
            <Link to="/questions"    className={`nav-link ${isActive('/questions')    ? 'active' : ''}`}>Questions</Link>
            <Link to="/my-questions" className={`nav-link ${isActive('/my-questions') ? 'active' : ''}`}>My Doubts</Link>
            <Link to="/ask"          className={`nav-link ask-link ${isActive('/ask') ? 'active' : ''}`}>+ Ask</Link>
          </div>
        )}

        {/* Right side */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu" ref={dropRef}>
              <button className="user-chip" onClick={() => setDropOpen(o => !o)}>
                <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
                <span className="user-caret">{dropOpen ? '▲' : '▼'}</span>
              </button>
              {dropOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user.name[0].toUpperCase()}</div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/my-questions" className="dropdown-item" onClick={() => setDropOpen(false)}>
                    📋 My Questions
                  </Link>
                  <Link to="/ask" className="dropdown-item" onClick={() => setDropOpen(false)}>
                    ✏️ Post a Doubt
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
