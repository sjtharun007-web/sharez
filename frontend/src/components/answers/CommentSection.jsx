import React, { useEffect, useState } from 'react';
import useCommentStore from '../../store/commentStore.jsx';
import useAuthStore from '../../store/authStore.jsx';
import './CommentSection.css';

function timeAgo(date) {
  const s = Math.floor((new Date() - new Date(date)) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function CommentSection({ answerId }) {
  const { comments, loading, fetchComments, addComment, deleteComment } = useCommentStore();
  const { user } = useAuthStore();

  const [showForm, setShowForm]   = useState(false);
  const [content, setContent]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const answerComments = comments[answerId] || [];
  const isLoading      = loading[answerId];

  useEffect(() => {
    fetchComments(answerId);
  }, [answerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    const result = await addComment(answerId, content.trim());
    if (result.success) {
      setContent('');
      setShowForm(false);
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="comment-section">
      {/* Existing comments */}
      {isLoading ? (
        <div className="comment-loading">Loading discussion…</div>
      ) : answerComments.length > 0 ? (
        <div className="comment-list">
          {answerComments.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="comment-avatar">{c.userId?.name?.[0]?.toUpperCase() || '?'}</div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{c.userId?.name || 'Anonymous'}</span>
                  <span className="comment-time">{timeAgo(c.createdAt)}</span>
                  {user && user.id === c.userId?._id && (
                    <button
                      className="comment-delete"
                      onClick={() => deleteComment(c._id, answerId)}
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="comment-content">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Add comment */}
      {user && (
        <div className="comment-add">
          {!showForm ? (
            <button className="reply-btn" onClick={() => setShowForm(true)}>
              💬 Add a comment
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="comment-form">
              <input
                className="comment-input"
                placeholder="Write a comment… (max 500 chars)"
                value={content}
                onChange={(e) => { setContent(e.target.value); setError(''); }}
                maxLength={500}
                autoFocus
              />
              {error && <p className="comment-error">⚠ {error}</p>}
              <div className="comment-form-actions">
                <button
                  type="button"
                  className="btn-cancel-comment"
                  onClick={() => { setShowForm(false); setContent(''); setError(''); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-post-comment"
                  disabled={submitting || !content.trim()}
                >
                  {submitting ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
