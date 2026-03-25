import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const features = [
  {
    icon: '🤝',
    title: 'Post Your Doubts',
    desc: 'Stuck on a concept? Post your doubt clearly and get help from peers who have solved it before.'
  },
  {
    icon: '💡',
    title: 'Share Solutions',
    desc: 'Know the answer? Help a fellow student. Every solution you share makes the whole campus smarter.'
  },
  {
    icon: '👍',
    title: 'Mark What Helped',
    desc: 'Found an answer helpful? Mark it. The community\'s best answers always rise to the top.'
  },
  {
    icon: '🏷️',
    title: 'Find by Topic',
    desc: 'Browse questions by subject — DSA, DBMS, Networks, Math and more. Filter by solved or unsolved.'
  },
  {
    icon: '💬',
    title: 'Discuss Answers',
    desc: 'Still unclear? Reply directly under any answer to continue the discussion and dig deeper.'
  },
  {
    icon: '✓',
    title: 'Mark as Solved',
    desc: 'Once you\'ve found your answer, mark the question as solved so others know help is available.'
  },
];

const steps = [
  { step: '01', title: 'Post your doubt',   desc: 'Describe your problem clearly. Add subject tags so others can find it.' },
  { step: '02', title: 'Get answers',        desc: 'Peers who know the answer respond with clear explanations.' },
  { step: '03', title: 'Discuss & resolve',  desc: 'Comment on answers, ask follow-ups, and mark the best solution.' },
];

export default function LandingPage() {
  return (
    <div className="landing">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-badge">Built for Campus Life</div>
          <h1 className="hero-title">
            Post your doubt.<br />
            <span className="hero-accent">Get answers from peers.</span>
          </h1>
          <p className="hero-desc">
            Sharez is a student-to-student platform where you post academic
            doubts and get solutions from peers who have already solved them.
            No tutors. No waiting. Just students helping students.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">Start for Free</Link>
            <Link to="/login"    className="btn btn-outline  btn-lg">Login</Link>
          </div>
        </div>

        {/* Mock preview card */}
        <div className="container">
          <div className="mock-card">
            <div className="mock-q-row">
              <div className="mock-avatar">R</div>
              <div className="mock-q-info">
                <div className="mock-name">Riya S. <span className="mock-tag">DSA</span></div>
                <div className="mock-time">asked 3 minutes ago</div>
              </div>
              <span className="mock-unsolved">Unsolved</span>
            </div>
            <div className="mock-question">
              What is the time complexity difference between BFS and DFS when applied to a dense graph?
            </div>
            <div className="mock-divider" />
            <div className="mock-answer-row">
              <div className="mock-helpful">👍 Helpful <span className="mock-count">7</span></div>
              <div className="mock-answer-text">
                Both are O(V+E) for adjacency list, but on a dense graph with E ≈ V², BFS tends to use more memory due to the queue holding many nodes simultaneously…
              </div>
            </div>
            <div className="mock-discuss">💬 Discuss · ✓ Mark Solution</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="container">
          <div className="section-eyebrow">What you get</div>
          <h2 className="section-heading">Everything a student needs to clear doubts fast</h2>
          <div className="features-grid">
            {features.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section">
        <div className="container">
          <div className="section-eyebrow">How it works</div>
          <h2 className="section-heading">From doubt to solution in 3 simple steps</h2>
          <div className="steps-row">
            {steps.map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="step-card">
                  <div className="step-num">{s.step}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
                {i < steps.length - 1 && <div className="step-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Sharez ── */}
      <section className="why-section">
        <div className="container why-inner">
          <div className="why-text">
            <div className="section-eyebrow">Why Sharez</div>
            <h2 className="section-heading">Built different from generic Q&A sites</h2>
            <ul className="why-list">
              <li><span className="why-check">✓</span> Focused on academic doubts — not random questions</li>
              <li><span className="why-check">✓</span> Peer-to-peer — answers from students who faced the same problems</li>
              <li><span className="why-check">✓</span> Tag-based discovery — find questions by your exact subject</li>
              <li><span className="why-check">✓</span> Discussion threads — go deeper with follow-up comments</li>
              <li><span className="why-check">✓</span> Helpful voting — best answers always surface to the top</li>
              <li><span className="why-check">✓</span> Solved markers — know at a glance if a doubt is resolved</li>
            </ul>
          </div>
          <div className="why-visual">
            <div className="why-card">
              <div className="why-card-title">Popular Topics</div>
              <div className="why-tags">
                {['DSA','DBMS','Operating Systems','Computer Networks',
                  'Mathematics','Python','Java','C++','Web Dev','Machine Learning'
                ].map(t => <span key={t} className="why-tag">{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2 className="cta-title">Stuck on something right now?</h2>
          <p className="cta-desc">
            Join your campus community. Post your doubt and get a solution
            from someone who has already been there. Free, always.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">Join Sharez →</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand"><span className="brand-icon-f">◈</span> Sharez</div>
          <p className="footer-copy">Students helping students. Learning is better together.</p>
        </div>
      </footer>

    </div>
  );
}
