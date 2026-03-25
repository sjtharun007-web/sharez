import React from 'react';
import { Link } from 'react-router-dom';
import './QuestionCard.css';

function timeAgo(date) {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function QuestionCard({ question }) {
  const { _id, title, description, author, answerCount, createdAt, tags, isSolved } = question;

  return (
    <Link to={`/questions/${_id}`} className="question-card animate-fadeUp">
      <div className="qcard-body">
        <div className="qcard-top">
          {isSolved && <span className="qcard-solved">✓ Solved</span>}
          {tags?.length > 0 && (
            <div className="qcard-tags">
              {tags.slice(0, 4).map(tag => (
                <span key={tag} className="qcard-tag">{tag}</span>
              ))}
              {tags.length > 4 && <span className="qcard-tag">+{tags.length - 4}</span>}
            </div>
          )}
        </div>
        <h3 className="qcard-title">{title}</h3>
        <p className="qcard-desc">
          {description.substring(0, 130)}{description.length > 130 ? '…' : ''}
        </p>
      </div>

      <div className="qcard-footer">
        <div className="qcard-meta">
          <div className="meta-avatar">{author?.name?.[0]?.toUpperCase() || '?'}</div>
          <span className="meta-name">{author?.name || 'Unknown'}</span>
          <span className="meta-sep">·</span>
          <span className="meta-time">{timeAgo(createdAt)}</span>
        </div>
        <div className="qcard-stat">
          <span>💬</span>
          <span>{answerCount || 0} {answerCount === 1 ? 'answer' : 'answers'}</span>
        </div>
      </div>
    </Link>
  );
}
