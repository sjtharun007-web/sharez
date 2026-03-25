import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useQuestionStore from '../store/questionStore.jsx';
import './AskQuestionPage.css';

const SUGGESTED_TAGS = ['dsa', 'dbms', 'os', 'networks', 'math', 'python', 'java', 'c++', 'web', 'ml'];

export default function AskQuestionPage() {
  const { createQuestion, isLoading } = useQuestionStore();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ title: '', description: '' });
  const [tags, setTags]     = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError]   = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const addTag = (tag) => {
    const clean = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (!clean || tags.includes(clean) || tags.length >= 5) return;
    setTags([...tags, clean]);
    setTagInput('');
  };

  const removeTag = (tag) => setTags(tags.filter(t => t !== tag));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError('Title and description are required'); return; }
    if (form.title.trim().length < 5)        { setError('Title must be at least 5 characters'); return; }
    if (form.description.trim().length < 10) { setError('Description must be at least 10 characters'); return; }

    const result = await createQuestion(form.title.trim(), form.description.trim(), tags);
    if (result.success) {
      navigate(`/questions/${result.id}`);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="ask-page">
      <div className="container">
        <div className="ask-wrapper animate-fadeUp">
          <div className="ask-header">
            <h1 className="ask-title">Post a Doubt</h1>
            <p className="ask-sub">Be specific and clear. Good questions get good answers.</p>
          </div>

          <form onSubmit={handleSubmit} className="ask-form card">
            {/* Title */}
            <div className="field">
              <label className="field-label">Title <span className="field-hint">— summarise your doubt in one line</span></label>
              <input
                className="input"
                type="text"
                name="title"
                placeholder="e.g. What is the difference between stack and heap memory?"
                value={form.title}
                onChange={handleChange}
                maxLength={200}
              />
              <span className="char-hint">{form.title.length}/200</span>
            </div>

            {/* Description */}
            <div className="field">
              <label className="field-label">Description <span className="field-hint">— add context, what you've tried, etc.</span></label>
              <textarea
                className="input ask-textarea"
                name="description"
                placeholder="Describe your problem in detail…"
                value={form.description}
                onChange={handleChange}
                rows={6}
                maxLength={2000}
              />
              <span className="char-hint">{form.description.length}/2000</span>
            </div>

            {/* Tags */}
            <div className="field">
              <label className="field-label">Tags <span className="field-hint">— up to 5 tags (press Enter or comma to add)</span></label>
              <div className="tags-input-wrap">
                {tags.map(tag => (
                  <span key={tag} className="tag-chip">
                    {tag}
                    <button type="button" className="tag-remove" onClick={() => removeTag(tag)}>✕</button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <input
                    className="tag-input"
                    placeholder={tags.length === 0 ? 'e.g. dsa, python, math' : 'Add tag…'}
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput && addTag(tagInput)}
                  />
                )}
              </div>
              <div className="suggested-tags">
                {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(t => (
                  <button key={t} type="button" className="suggested-tag" onClick={() => addTag(t)}>+ {t}</button>
                ))}
              </div>
            </div>

            {error && <div className="auth-error">⚠ {error}</div>}

            <div className="ask-actions">
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/questions')}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <><div className="spinner" /> Posting…</> : 'Post Doubt'}
              </button>
            </div>
          </form>

          <div className="ask-tips card">
            <h3 className="tips-title">✨ Tips for a great question</h3>
            <ul className="tips-list">
              <li>Summarise the problem clearly in the title</li>
              <li>Include what you've already tried</li>
              <li>Add relevant error messages or code snippets</li>
              <li>Use tags so others can find your question</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
