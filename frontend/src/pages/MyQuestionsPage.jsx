import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api.jsx';
import './MyQuestionsPage.css';

function timeAgo(date) {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('all'); // all | solved | unsolved
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/questions/my')
      .then(({ data }) => setQuestions(data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = questions.filter(q => {
    if (filter === 'solved')   return q.isSolved;
    if (filter === 'unsolved') return !q.isSolved;
    return true;
  });

  const solvedCount   = questions.filter(q => q.isSolved).length;
  const unsolvedCount = questions.filter(q => !q.isSolved).length;

  return (
    <div className="myq-page">
      <div className="container">

        {/* Header */}
        <div className="myq-header">
          <div>
            <h1 className="myq-title">My Questions</h1>
            <p className="myq-sub">All the doubts you've posted</p>
          </div>
          <Link to="/ask" className="btn btn-primary">+ Post a Doubt</Link>
        </div>

        {/* Stats */}
        {!loading && questions.length > 0 && (
          <div className="myq-stats">
            <div className="stat-pill total">
              <span className="stat-num">{questions.length}</span>
              <span className="stat-lbl">Total</span>
            </div>
            <div className="stat-pill solved">
              <span className="stat-num">{solvedCount}</span>
              <span className="stat-lbl">Solved</span>
            </div>
            <div className="stat-pill unsolved">
              <span className="stat-num">{unsolvedCount}</span>
              <span className="stat-lbl">Unsolved</span>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="myq-filters">
          {['all', 'unsolved', 'solved'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'solved' ? '✓ Solved' : 'Unsolved'}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="myq-loading"><div className="spinner" /> Loading your questions…</div>
        ) : filtered.length === 0 ? (
          <div className="myq-empty">
            <div className="empty-icon">📭</div>
            <p>{filter !== 'all' ? `No ${filter} questions.` : "You haven't posted any doubts yet."}</p>
            {filter === 'all' && (
              <Link to="/ask" className="btn btn-primary">Post Your First Doubt</Link>
            )}
          </div>
        ) : (
          <div className="myq-list">
            {filtered.map(q => (
              <div key={q._id} className={`myq-card ${q.isSolved ? 'is-solved' : ''}`}>
                <div className="myq-card-left">
                  <div className="myq-card-top">
                    {q.isSolved
                      ? <span className="status-badge solved-badge">✓ Solved</span>
                      : <span className="status-badge unsolved-badge">Unsolved</span>
                    }
                    {q.tags?.map(tag => (
                      <span key={tag} className="myq-tag">{tag}</span>
                    ))}
                  </div>
                  <h3
                    className="myq-card-title"
                    onClick={() => navigate(`/questions/${q._id}`)}
                  >
                    {q.title}
                  </h3>
                  <p className="myq-card-desc">
                    {q.description.substring(0, 100)}{q.description.length > 100 ? '…' : ''}
                  </p>
                </div>
                <div className="myq-card-right">
                  <div className="myq-card-meta">
                    <span className="myq-answers">💬 {q.answerCount} {q.answerCount === 1 ? 'answer' : 'answers'}</span>
                    <span className="myq-time">{timeAgo(q.createdAt)}</span>
                  </div>
                  <Link to={`/questions/${q._id}`} className="btn btn-ghost btn-sm">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
