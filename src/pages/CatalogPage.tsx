import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useManifest } from '../context/ManifestContext';
import { useLang } from '../context/LangContext';
import { useProgress } from '../context/ProgressContext';

export const CatalogPage: React.FC = () => {
  const { manifest } = useManifest();
  const { lang, t } = useLang();
  const { isCompleted, toggleComplete } = useProgress();

  const [query, setQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyQuiz, setOnlyQuiz] = useState(false);

  const allLessons = useMemo(() => {
    if (!manifest) return [];
    return manifest.phases.flatMap((p) => p.lessons);
  }, [manifest]);

  const languages = useMemo(() => {
    const s = new Set<string>();
    allLessons.forEach((l) => l.languages.forEach((lg) => s.add(lg)));
    return Array.from(s).sort();
  }, [allLessons]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allLessons.filter((l) => {
      const key = `${l.phaseDir}/${l.dirName}`;
      const done = isCompleted(key);
      if (phaseFilter !== 'all' && String(l.phaseNum) !== phaseFilter) return false;
      if (typeFilter !== 'all' && l.type !== typeFilter) return false;
      if (langFilter !== 'all' && !l.languages.includes(langFilter)) return false;
      if (statusFilter === 'done' && !done) return false;
      if (statusFilter === 'todo' && done) return false;
      if (onlyQuiz && !l.hasQuiz) return false;
      if (q) {
        const hay = `${l.title} ${l.motto} ${l.phaseTitle} ${l.languages.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allLessons, query, phaseFilter, typeFilter, langFilter, statusFilter, onlyQuiz, isCompleted]);

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? 'คลังบทเรียนทั้งหมด 542 บท' : 'Curriculum Catalog'}
          </h1>
          <p className="bp-section-desc">
            {manifest
              ? `${filtered.length} of ${manifest.totals.lessons} lessons matching across ${manifest.totals.phases} phases.`
              : 'Loading catalog...'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: 10,
          padding: 16,
          border: '1px solid var(--ink)',
          background: 'var(--bg-surface)',
          marginBottom: 24,
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or topic..."
          style={{
            padding: '8px 12px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-body)',
          }}
        />
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <option value="all">All Phases (00–19)</option>
          {manifest?.phases.map((p) => (
            <option key={p.num} value={String(p.num)}>
              {String(p.num).padStart(2, '0')} · {p.title}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <option value="all">{t('allTypes')}</option>
          <option value="Build">Build</option>
          <option value="Learn">Learn</option>
        </select>
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <option value="all">{t('allLangs')}</option>
          {languages.map((lg) => (
            <option key={lg} value={lg}>
              {lg}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 10px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <option value="all">Status: All</option>
          <option value="todo">Status: Incomplete</option>
          <option value="done">Status: Completed</option>
        </select>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.76rem',
            color: 'var(--ink)',
          }}
        >
          <input
            type="checkbox"
            checked={onlyQuiz}
            onChange={(e) => setOnlyQuiz(e.target.checked)}
            style={{ accentColor: 'var(--blueprint)' }}
          />
          <span>Has Quiz Only</span>
        </label>
      </div>

      {/* Results Table */}
      <div className="table-wrap">
        <table className="bp-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Lesson</th>
              <th>Phase</th>
              <th>Type</th>
              <th>Languages</th>
              <th>Code / Quiz</th>
              <th>Done</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const key = `${l.phaseDir}/${l.dirName}`;
              const done = isCompleted(key);
              return (
                <tr key={key}>
                  <td style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', color: 'var(--blueprint)' }}>
                    P{String(l.phaseNum).padStart(2, '0')}.{String(l.num).padStart(2, '0')}
                  </td>
                  <td>
                    <Link to={`/learn/${l.phaseDir}/${l.dirName}`} style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {l.title}
                    </Link>
                    {l.motto && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>{l.motto}</div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.84rem', color: 'var(--ink-soft)' }}>
                    {lang === 'th' ? l.phaseTitleTh : l.phaseTitle}
                  </td>
                  <td>
                    <span className="bp-chip">{l.type}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {l.languages.map((lg) => (
                        <span key={lg} className="bp-chip">
                          {lg}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                    {l.codeFileCount} files{l.hasQuiz ? ` · ${l.quizCount}Q` : ''}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleComplete(key)}
                      className={`bp-btn bp-btn--sm ${done ? 'bp-btn--primary' : ''}`}
                      aria-label={done ? `Completed ${l.title}` : `Mark ${l.title} complete`}
                    >
                      <Check size={13} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
