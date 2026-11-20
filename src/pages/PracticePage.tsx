import React, { useEffect, useMemo, useState } from 'react';
import { PracticeData } from '../types/curriculum';
import { useLang } from '../context/LangContext';
import { LessonMarkdown } from '../components/LessonMarkdown';
import { CodeWorkbench } from '../components/CodeWorkbench';

export const PracticePage: React.FC = () => {
  const { lang } = useLang();
  const [data, setData] = useState<PracticeData | null>(null);
  const [tab, setTab] = useState<'problems' | 'interviews' | 'manuals'>('problems');
  const [query, setQuery] = useState('');
  const [selectedProbId, setSelectedProbId] = useState<string>('');
  const [selectedIvId, setSelectedIvId] = useState<string>('');
  const [selectedManId, setSelectedManId] = useState<string>('');
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    fetch('/data/practice.json')
      .then((r) => r.json() as Promise<PracticeData>)
      .then((d) => {
        setData(d);
        if (d.problems[0]) setSelectedProbId(d.problems[0].id);
        if (d.interviews[0]) setSelectedIvId(d.interviews[0].id);
        if (d.manuals[0]) setSelectedManId(d.manuals[0].id);
      });
  }, []);

  const q = query.trim().toLowerCase();

  const problems = useMemo(() => {
    if (!data) return [];
    return q
      ? data.problems.filter((p) => `${p.title} ${p.collection} ${p.summary}`.toLowerCase().includes(q))
      : data.problems;
  }, [data, q]);

  const interviews = useMemo(() => {
    if (!data) return [];
    return q
      ? data.interviews.filter((iv) => `${iv.title} ${iv.category} ${iv.tags.join(' ')}`.toLowerCase().includes(q))
      : data.interviews;
  }, [data, q]);

  if (!data) {
    return (
      <div className="page-shell container">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading practice, interviews, and 101 manuals...</p>
      </div>
    );
  }

  const activeProblem = problems.find((p) => p.id === selectedProbId) ?? problems[0];
  const activeInterview = interviews.find((iv) => iv.id === selectedIvId) ?? interviews[0];
  const activeManual = data.manuals.find((m) => m.id === selectedManId) ?? data.manuals[0];

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? 'ฝึกเขียนโค้ด & เตรียมสัมภาษณ์ AI' : 'Practice, Interviews & Manuals'}
          </h1>
          <p className="bp-section-desc">
            {data.problems.length} coding drills from raw NumPy/Python, {data.interviews.length} real engineering interview scenarios, and {data.manuals.length} deep 101 system manuals.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            type="button"
            onClick={() => setTab('problems')}
            className={`bp-btn bp-btn--sm ${tab === 'problems' ? 'bp-btn--primary' : ''}`}
          >
            Coding Practice ({data.problems.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('interviews')}
            className={`bp-btn bp-btn--sm ${tab === 'interviews' ? 'bp-btn--primary' : ''}`}
          >
            Interview Bank ({data.interviews.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('manuals')}
            className={`bp-btn bp-btn--sm ${tab === 'manuals' ? 'bp-btn--primary' : ''}`}
          >
            101 Deep Manuals ({data.manuals.length})
          </button>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter items..."
          style={{
            padding: '8px 12px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
            color: 'var(--ink)',
            minWidth: 240,
          }}
        />
      </div>

      {tab === 'problems' && (
        <div className="split-pane">
          <div style={{ maxHeight: '72vh', overflowY: 'auto', border: '1px solid var(--rule-soft)' }}>
            {problems.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProbId(p.id);
                  setShowSolution(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 0,
                  borderBottom: '1px solid var(--rule-soft)',
                  background: activeProblem?.id === p.id ? 'var(--blueprint-tint)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{p.title}</div>
                <div className="fig-label">{p.collection} · {p.difficulty}</div>
              </button>
            ))}
          </div>

          {activeProblem && (
            <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--ink)' }}>{activeProblem.title}</h2>
                <button
                  type="button"
                  onClick={() => setShowSolution((s) => !s)}
                  className="bp-btn bp-btn--sm"
                >
                  {showSolution ? 'Show Starter Template' : 'Reveal Reference Solution'}
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <span className="bp-chip bp-chip--blue">{activeProblem.collection} · ~{activeProblem.minutes}m</span>
              </div>
              <LessonMarkdown markdown={activeProblem.problemMarkdown} />

              <div style={{ marginTop: 20 }}>
                <CodeWorkbench
                  files={[
                    {
                      name: showSolution ? 'solution.py' : 'starter.py',
                      language: 'python',
                      content: showSolution ? activeProblem.solutionCode : activeProblem.starterCode,
                      truncated: false,
                      lines: (showSolution ? activeProblem.solutionCode : activeProblem.starterCode).split('\n').length,
                    },
                  ]}
                />
              </div>

              {activeProblem.hintsMarkdown && (
                <details style={{ marginTop: 18, border: '1px solid var(--rule-soft)', padding: 14 }}>
                  <summary style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', cursor: 'pointer', color: 'var(--blueprint)' }}>
                    HINTS &amp; NOTES
                  </summary>
                  <div style={{ marginTop: 12 }}>
                    <LessonMarkdown markdown={activeProblem.hintsMarkdown} />
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'interviews' && (
        <div className="split-pane">
          <div style={{ maxHeight: '72vh', overflowY: 'auto', border: '1px solid var(--rule-soft)' }}>
            {interviews.slice(0, 120).map((iv) => (
              <button
                key={iv.id}
                type="button"
                onClick={() => setSelectedIvId(iv.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 0,
                  borderBottom: '1px solid var(--rule-soft)',
                  background: activeInterview?.id === iv.id ? 'var(--blueprint-tint)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.92rem', marginBottom: 4 }}>{iv.title}</div>
                <div className="fig-label">{iv.category} · L{iv.level}</div>
              </button>
            ))}
          </div>

          {activeInterview && (
            <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 24 }}>
              <h2 style={{ fontSize: '1.9rem', color: 'var(--ink)', marginBottom: 10 }}>{activeInterview.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                <span className="bp-chip bp-chip--blue">{activeInterview.category}</span>
                <span className="bp-chip">{activeInterview.kind}</span>
                <span className="bp-chip">{activeInterview.minutes} min</span>
              </div>
              <LessonMarkdown markdown={activeInterview.markdown} />
            </div>
          )}
        </div>
      )}

      {tab === 'manuals' && (
        <div className="split-pane">
          <div style={{ border: '1px solid var(--rule-soft)' }}>
            {data.manuals.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedManId(m.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: 0,
                  borderBottom: '1px solid var(--rule-soft)',
                  background: activeManual?.id === m.id ? 'var(--blueprint-tint)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{m.title}</div>
                <div className="fig-label">{m.id}</div>
              </button>
            ))}
          </div>

          {activeManual && (
            <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--ink)' }}>{activeManual.title}</h2>
                <a href={activeManual.githubUrl} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn--sm">
                  GitHub Capture Files →
                </a>
              </div>
              <LessonMarkdown markdown={activeManual.markdown} stripTitle />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
