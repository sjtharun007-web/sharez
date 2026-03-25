import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useQuestionStore from '../store/questionStore.jsx';
import useAnswerStore   from '../store/answerStore.jsx';
import useAuthStore     from '../store/authStore.jsx';
import AnswerItem       from '../components/answers/AnswerItem.jsx';
import './QuestionDetailPage.css';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentQuestion, fetchQuestion, isLoading: qLoading } = useQuestionStore();
  const { answers, fetchAnswers, addAnswer, isLoading: aLoading } = useAnswerStore();
  const { user } = useAuthStore();

  const [content, setContent]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    fetchQuestion(id);
    fetchAnswers(id);
  }, [id]);

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setError('Answer cannot be empty'); return; }
    if (content.trim().length < 5) { setError('Answer too short'); return; }
    setSubmitting(true);
    setError('');
    const result = await addAnswer(id, content.trim());
    if (result.success) { setContent(''); }
    else { setError(result.message); }
    setSubmitting(false);
  };

  if (qLoading) {
    return <div className="detail-loading"><div className="spinner" /><span>Loading…</span></div>;
  }

  if (!currentQuestion) {
    return (
      <div className="detail-error">
        <p>Question not found.</p>
        <button className="btn btn-ghost" onClick={() => navigate('/questions')}>← Back</button>
      </div>
    );
  }

  const q = currentQuestion;

  // Sort: solved answer first, then by vote score
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a._id === q.solvedAnswerId?.toString()) return -1;
    if (b._id === q.solvedAnswerId?.toString()) return 1;
    return b.voteScore - a.voteScore;
  });

  return (
    <div className="detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate('/questions')}>← All Questions</button>

        {/* Question */}
        <div className="question-block card animate-fadeUp">
          <div className="q-top">
            <div className="q-tags">
              {q.isSolved && <span className="tag-solved">✓ Solved</span>}
              {q.tags?.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          <h1 className="q-title">{q.title}</h1>
          <p className="q-desc">{q.description}</p>
          <div className="q-meta">
            <div className="meta-avatar">{q.userId?.name?.[0]?.toUpperCase() || '?'}</div>
            <span>{q.userId?.name || 'Unknown'}</span>
            <span className="meta-sep">·</span>
            <span>{new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Answers */}
        <div className="answers-section">
          <h2 className="section-title">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
          </h2>

          {aLoading ? (
            <div className="loading-state"><div className="spinner" /><span>Loading answers…</span></div>
          ) : sortedAnswers.length === 0 ? (
            <div className="no-answers">No answers yet. Be the first to help!</div>
          ) : (
            <div className="answers-list">
              {sortedAnswers.map(a => (
                <AnswerItem
                  key={a._id}
                  answer={a}
                  questionId={q._id}
                  questionAuthorId={q.userId?._id || q.userId}
                  isSolvedAnswer={q.solvedAnswerId?.toString() === a._id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Post answer */}
        <div className="add-answer-section">
          <h2 className="section-title">Your Answer</h2>
          <form onSubmit={handleSubmitAnswer} className="answer-form card">
            <textarea
              className="input answer-textarea"
              placeholder="Write a clear, helpful answer…"
              value={content}
              onChange={e => { setContent(e.target.value); setError(''); }}
              rows={5}
            />
            {error && <p className="error-text">⚠ {error}</p>}
            <div className="form-actions">
              <span className="char-count">{content.length} chars</span>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <><div className="spinner" /> Posting…</> : 'Post Answer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
