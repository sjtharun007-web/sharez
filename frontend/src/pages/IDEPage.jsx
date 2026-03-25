import React, { useState, useRef } from 'react';
import API from '../services/api.jsx';
import './IDEPage.css';

const LANGUAGES = [
  { key: 'python',     name: 'Python',     starter: 'print("Hello, World!")' },
  { key: 'cpp',        name: 'C++',        starter: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}' },
  { key: 'c',          name: 'C',          starter: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}' },
  { key: 'java',       name: 'Java',       starter: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}' },
  { key: 'javascript', name: 'JavaScript', starter: 'console.log("Hello, World!");' },
  { key: 'typescript', name: 'TypeScript', starter: 'const greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("World"));' },
  { key: 'go',         name: 'Go',         starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}' },
  { key: 'rust',       name: 'Rust',       starter: 'fn main() {\n    println!("Hello, World!");\n}' },
  { key: 'csharp',     name: 'C#',         starter: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}' },
  { key: 'ruby',       name: 'Ruby',       starter: 'puts "Hello, World!"' },
  { key: 'php',        name: 'PHP',        starter: '<?php\necho "Hello, World!\\n";\n?>' },
  { key: 'bash',       name: 'Bash',       starter: '#!/bin/bash\necho "Hello, World!"' },
  { key: 'kotlin',     name: 'Kotlin',     starter: 'fun main() {\n    println("Hello, World!")\n}' },
  { key: 'swift',      name: 'Swift',      starter: 'print("Hello, World!")' },
];

export default function IDEPage() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode]       = useState(LANGUAGES[0].starter);
  const [stdin, setStdin]     = useState('');
  const [output, setOutput]   = useState('');
  const [running, setRunning] = useState(false);
  const [runStatus, setRunStatus] = useState(null);
  const [showStdin, setShowStdin] = useState(false);
  const textareaRef = useRef(null);

  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    setCode(lang.starter);
    setOutput('');
    setRunStatus(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const s = ta.selectionStart;
      const en = ta.selectionEnd;
      const next = code.substring(0, s) + '  ' + code.substring(en);
      setCode(next);
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2; }, 0);
    }
  };

  const handleRun = async () => {
    if (!code.trim() || running) return;
    setRunning(true);
    setOutput('');
    setRunStatus({ label: 'Running…', type: 'running' });

    try {
      const { data } = await API.post('/ide/run', {
        language: selectedLang.key,
        source_code: code,
        stdin,
      });

      const { status, output: out, stderr, error, isError } = data.data;
      setRunStatus({ label: status, type: isError ? 'err' : 'ok' });

      let display = out || '';
      if (stderr && stderr.trim()) display += (display ? '\n\n--- stderr ---\n' : '') + stderr;
      if (error  && error.trim())  display += (display ? '\n\n--- error ---\n'  : '') + error;
      setOutput(display || '(no output)');

    } catch (err) {
      setRunStatus({ label: 'Error', type: 'err' });
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setOutput(msg);
    } finally {
      setRunning(false);
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="ide-page">
      <div className="ide-topbar">
        <div className="ide-brand">
          <span className="ide-brand-icon">{'</>'}</span>
          <span className="ide-brand-name">Code IDE</span>
          <span className="ide-brand-sub">Powered by Glot.io · Free · 14 languages</span>
        </div>
        <button className="run-btn" onClick={handleRun} disabled={running}>
          {running ? <><span className="spinner-white" /> Running…</> : '▶  Run Code'}
        </button>
      </div>

      <div className="ide-body">
        <div className="editor-col">
          <div className="lang-tabs-wrap">
            <div className="lang-tabs">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.key}
                  className={`lang-tab ${selectedLang.key === lang.key ? 'active' : ''}`}
                  onClick={() => handleLangChange(lang)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div className="code-area">
            <div className="line-nums">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="line-num">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="code-editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
            />
          </div>

          <div className="editor-footer">
            <div className="footer-left">
              <button className="toggle-stdin-btn" onClick={() => setShowStdin(s => !s)}>
                {showStdin ? '▲ Hide stdin' : '▼ stdin input'}
              </button>
              <span className="lang-indicator">{selectedLang.name}</span>
              <span className="line-indicator">{lineCount} lines</span>
            </div>
            <button className="reset-btn" onClick={() => { setCode(selectedLang.starter); setOutput(''); setRunStatus(null); }}>
              Reset
            </button>
          </div>

          {showStdin && (
            <div className="stdin-area">
              <label className="stdin-label">Standard Input (stdin)</label>
              <textarea
                className="stdin-editor"
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder="Your program will read from here…"
                rows={3}
              />
            </div>
          )}
        </div>

        <div className="output-col">
          <div className="output-topbar">
            <span className="output-label">Output</span>
            {runStatus && (
              <span className={`run-badge run-badge-${runStatus.type}`}>{runStatus.label}</span>
            )}
            {output && (
              <button className="clear-btn" onClick={() => { setOutput(''); setRunStatus(null); }}>Clear</button>
            )}
          </div>
          <pre className="output-body">
            {running
              ? <span className="output-dim">⏳ Executing on Glot.io servers…</span>
              : output
                ? output
                : <span className="output-dim">Press ▶ Run Code to execute</span>
            }
          </pre>
        </div>
      </div>
    </div>
  );
}
