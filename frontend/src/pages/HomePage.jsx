import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import useQuestionStore from '../store/questionStore.jsx';
import QuestionCard from '../components/questions/QuestionCard.jsx';
import './HomePage.css';

export default function HomePage() {
  const { questions, tags, isLoading, fetchQuestions, fetchTags } = useQuestionStore();

  const [search,       setSearch]       = useState('');
  const [activeTag,    setActiveTag]    = useState('');
  const [solvedFilter, setSolvedFilter] = useState('all'); // 'all' | 'solved' | 'unsolved'

  const debounceRef = useRef(null);

  // Load tags once
  useEffect(() => { fetchTags(); }, []);

  // Run filters whenever any of them change
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters = {};
      if (search.trim())        filters.search = search.trim();
      if (activeTag)            filters.tag    = activeTag;
      if (solvedFilter === 'solved')   filters.solved = 'true';
      if (solvedFilter === 'unsolved') filters.solved = 'false';
      fetchQuestions(filters);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search, activeTag, solvedFilter]);

  const handleTagClick = (tag) => {
    setActiveTag(prev => prev === tag ? '' : tag);
  };

  const clearFilters = () => {
    setSearch('');
    setActiveTag('');
    setSolvedFilter('all');
  };

  const hasFilters = search || activeTag || solvedFilter !== 'all';

  return (
    <div className="home-page">
      <div className="container">

        {/* Header */}
        <div className="home-header">
          <div>
            <h1 className="home-title">Doubts & Solutions</h1>
            <p className="home-sub">Browse questions from your peers or share your own doubt</p>
          </div>
          <Link to="/ask" className="btn btn-primary">+ Post a Doubt</Link>
        </div>

        {/* Search + Solved Filter */}
        <div className="search-row">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${solvedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSolvedFilter('all')}
            >All</button>
            <button
              className={`filter-tab ${solvedFilter === 'unsolved' ? 'active' : ''}`}
              onClick={() => setSolvedFilter('unsolved')}
            >Unsolved</button>
            <button
              className={`filter-tab ${solvedFilter === 'solved' ? 'active' : ''}`}
              onClick={() => setSolvedFilter('solved')}
            >✓ Solved</button>
          </div>
        </div>

        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="tags-row">
            <span className="tags-label">Topics:</span>
            {tags.map(({ tag, count }) => (
              <button
                key={tag}
                className={`tag-btn ${activeTag === tag ? 'active' : ''}`}
                onClick={() => handleTagClick(tag)}
                title={`${count} question${count !== 1 ? 's' : ''}`}
              >
                {tag}
                <span className="tag-count">{count}</span>
              </button>
            ))}
            {hasFilters && (
              <button className="clear-filters-btn" onClick={clearFilters}>✕ Clear all</button>
            )}
          </div>
        )}

        {/* Results bar */}
        <div className="results-row">
          <span className="result-count">
            {isLoading ? 'Loading…' : `${questions.length} ${questions.length === 1 ? 'question' : 'questions'}`}
          </span>
          {hasFilters && !isLoading && (
            <span className="filters-active-label">
              {[
                activeTag    && `#${activeTag}`,
                solvedFilter !== 'all' && solvedFilter,
                search       && `"${search}"`,
              ].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" /><span>Loading questions…</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{hasFilters ? '🔍' : '🤔'}</div>
            <p className="empty-msg">
              {hasFilters
                ? 'No questions match your filters.'
                : 'No questions yet — post the first doubt!'}
            </p>
            {hasFilters
              ? <button className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
              : <Link to="/ask" className="btn btn-primary">Post a Doubt</Link>
            }
          </div>
        ) : (
          <div className="questions-list">
            {questions.map(q => <QuestionCard key={q._id} question={q} />)}
          </div>
        )}
      </div>
    </div>
  );
}
