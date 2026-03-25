import React, { useState } from 'react';
import useAnswerStore    from '../../store/answerStore.jsx';
import useAuthStore      from '../../store/authStore.jsx';
import useQuestionStore  from '../../store/questionStore.jsx';
import CommentSection    from './CommentSection.jsx';
import './AnswerItem.css';

function timeAgo(date) {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AnswerItem({ answer, questionAuthorId, questionId, isSolvedAnswer }) {
  const { castVote }   = useAnswerStore();
  const { markSolved } = useQuestionStore();
  const { user }       = useAuthStore();

  const [voting, setVoting]             = useState(false);
  const [showComments, setShowComments] = useState(false);

  // userVote is 'helpful', 'not_helpful', or null
  const userVote     = answer.userVote;
  const helpfulCount    = answer.helpfulCount    ?? 0;
  const notHelpfulCount = answer.notHelpfulCount ?? 0;

  const isQAuthor = user && (user.id === questionAuthorId || user._id === questionAuthorId);

  const handleVote = async (voteType) => {
    if (!user || voting) return;
    setVoting(true);
    await castVote(answer._id, voteType);
    setVoting(false);
  };

  return (
    <div className={`answer-item animate-fadeUp ${isSolvedAnswer ? 'answer-solved' : ''}`}>
      {isSolvedAnswer && <div className="solved-badge">✓ Accepted Solution</div>}

      <div className="answer-inner">
        <div className="answer-content">
          {/* Answer text */}
          <p className="answer-text">{answer.content}</p>

          {/* Footer */}
          <div className="answer-footer">
            {/* Author info */}
            <div className="answer-meta">
              <div className="meta-avatar">{answer.userId?.name?.[0]?.toUpperCase() || '?'}</div>
              <span className="meta-name">{answer.userId?.name || 'Anonymous'}</span>
              <span className="meta-sep">·</span>
              <span className="meta-time">{timeAgo(answer.createdAt)}</span>
            </div>

            {/* Action buttons */}
            <div className="answer-actions">

              {/* Helpful button */}
              <button
                className={`vote-btn helpful-btn ${userVote === 'helpful' ? 'voted' : ''}`}
                onClick={() => handleVote('helpful')}
                disabled={voting || !user}
                title={!user ? 'Login to vote' : userVote === 'helpful' ? 'Remove helpful vote' : 'Mark as helpful'}
              >
                👍
                <span className="vote-label">Helpful</span>
                {helpfulCount > 0 && (
                  <span className="vote-count helpful-count">{helpfulCount}</span>
                )}
              </button>

              {/* Not helpful button */}
              <button
                className={`vote-btn not-helpful-btn ${userVote === 'not_helpful' ? 'voted' : ''}`}
                onClick={() => handleVote('not_helpful')}
                disabled={voting || !user}
                title={!user ? 'Login to vote' : userVote === 'not_helpful' ? 'Remove not helpful vote' : 'Mark as not helpful'}
              >
                👎
                <span className="vote-label">Not Helpful</span>
                {notHelpfulCount > 0 && (
                  <span className="vote-count not-helpful-count">{notHelpfulCount}</span>
                )}
              </button>

              {/* Mark solution — question author only */}
              {isQAuthor && (
                <button
                  className={`vote-btn solve-btn ${isSolvedAnswer ? 'voted' : ''}`}
                  onClick={() => markSolved(questionId, answer._id)}
                  title={isSolvedAnswer ? 'Unmark as solution' : 'Mark as solution'}
                >
                  ✓
                  <span className="vote-label">{isSolvedAnswer ? 'Solution' : 'Mark Solution'}</span>
                </button>
              )}

              {/* Discuss */}
              <button
                className="discuss-btn"
                onClick={() => setShowComments(s => !s)}
              >
                💬 {showComments ? 'Hide' : 'Discuss'}
              </button>
            </div>
          </div>

          {/* Comments */}
          {showComments && <CommentSection answerId={answer._id} />}
        </div>
      </div>
    </div>
  );
}
