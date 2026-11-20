import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LearningPathEntry } from '../types/curriculum';
import { useProgress } from '../context/ProgressContext';
import { useLang } from '../context/LangContext';
import { LessonMarkdown } from '../components/LessonMarkdown';

interface LearningPathsPayload {
  paths: LearningPathEntry[];
  careerPracticeMarkdown: string;
}

export const LearningPathsPage: React.FC = () => {
  const { lang } = useLang();
  const { isCompleted } = useProgress();
  const [data, setData] = useState<LearningPathsPayload | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCareerGuide, setShowCareerGuide] = useState(false);

  useEffect(() => {
    fetch('/data/learning-paths.json')
      .then((r) => r.json() as Promise<LearningPathsPayload>)
      .then((d) => {
        setData(d);
        if (d.paths.length > 0) setSelectedId(d.paths[0].id);
      });
  }, []);

  const selected = data?.paths.find((p) => p.id === selectedId) ?? data?.paths[0];

  const lessonPathToRoute = (rawPath: string) => {
    const clean = rawPath.replace(/^phases\//, '').replace(/\/$/, '');
    return `/learn/${clean}${selected ? `?path=${selected.id}` : ''}`;
  };

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? 'เส้นทางการเรียนรู้ตามสายงาน' : 'Learning Paths'}
          </h1>
          <p className="bp-section-desc">
            {lang === 'th'
              ? '13 เส้นทางเรียงลำดับบทเรียนพร้อมระยะเวลาและชิ้นงานยืนยันความสามารถ ทั้งสาย Agent, MCP, Applied AI และ Reverse Engineering'
              : 'Curated, manifest-backed study sequences from the repository learning-paths/ directory — pick a focused protocol route or a role track.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCareerGuide((v) => !v)}
          className={`bp-btn bp-btn--sm ${showCareerGuide ? 'bp-btn--primary' : ''}`}
        >
          {showCareerGuide ? 'Back to Path Manifests' : 'Read CAREER-PRACTICE.md'}
        </button>
      </div>

      {!data ? (
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading learning paths...</p>
      ) : showCareerGuide ? (
        <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 28 }}>
          <LessonMarkdown markdown={data.careerPracticeMarkdown} />
        </div>
      ) : (
        <div className="split-pane">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.paths.map((p) => {
              const active = p.id === selected?.id;
              const mins = p.estimatedMinutes || p.lessons.reduce((a, l) => a + (l.minutes || 45), 0);
              const done = p.lessons.filter((l) => {
                const key = l.path.replace(/^phases\//, '').replace(/\/$/, '');
                return isCompleted(key);
              }).length;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    border: active ? '1px solid var(--ink)' : '1px solid var(--rule-soft)',
                    background: active ? 'var(--blueprint-tint)' : 'var(--bg-surface)',
                    boxShadow: active ? 'var(--shadow-hard)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--ink)', marginBottom: 6 }}>
                    {p.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span className="fig-label">{p.kind === 'career-route' ? 'CAREER ROUTE' : 'FOCUSED PATH'}</span>
                    <span className="bp-chip">
                      {done}/{p.lessons.length} · ~{Math.round(mins / 60)}h
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 24 }}>
              <h2 style={{ fontSize: '2.1rem', color: 'var(--ink)', marginBottom: 10 }}>{selected.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <span className="bp-chip bp-chip--blue">{selected.id}</span>
                {selected.workFamily && <span className="bp-chip">{selected.workFamily}</span>}
                <span className="bp-chip">{selected.lessons.length} lessons</span>
              </div>
              <p style={{ color: 'var(--ink-soft)', marginBottom: 16 }}>{selected.summary}</p>

              {selected.mission && (
                <div
                  style={{
                    padding: '12px 16px',
                    border: '1px solid var(--blueprint)',
                    background: 'var(--bg-surface)',
                    marginBottom: 18,
                    fontSize: '0.94rem',
                  }}
                >
                  <strong>Mission:</strong> {selected.mission}
                </div>
              )}

              {selected.lessons[0] && (
                <div style={{ marginBottom: 22 }}>
                  <Link to={lessonPathToRoute(selected.lessons[0].path)} className="bp-btn bp-btn--primary">
                    Start This Learning Path →
                  </Link>
                </div>
              )}

              <div className="fig-label" style={{ marginBottom: 10 }}>
                ORDERED CURRICULUM SEQUENCE
              </div>
              <div style={{ border: '1px solid var(--rule-soft)' }}>
                {selected.lessons.map((l, idx) => {
                  const key = l.path.replace(/^phases\//, '').replace(/\/$/, '');
                  const done = isCompleted(key);
                  return (
                    <Link
                      key={l.path}
                      to={lessonPathToRoute(l.path)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderBottom: idx === selected.lessons.length - 1 ? 0 : '1px solid var(--rule-soft)',
                        color: 'var(--ink)',
                        background: done ? 'rgba(53,83,255,0.04)' : 'transparent',
                      }}
                    >
                      <span>
                        <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--blueprint)', marginRight: 10 }}>
                          {String(l.order ?? idx + 1).padStart(2, '0')}
                        </strong>
                        {l.title || l.path.replace(/^phases\//, '')}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-mute)' }}>
                        {done ? 'DONE · ' : ''}{l.minutes ? `${l.minutes}m` : 'Open →'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
