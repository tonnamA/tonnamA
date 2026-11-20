import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlossaryEntry } from '../types/curriculum';
import { useLang } from '../context/LangContext';
import { LessonMarkdown } from '../components/LessonMarkdown';

interface GlossaryPayload {
  entries: GlossaryEntry[];
  mythsMarkdown: string;
}

export const GlossaryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const [data, setData] = useState<GlossaryPayload | null>(null);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [letterFilter, setLetterFilter] = useState<string>('ALL');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [tab, setTab] = useState<'terms' | 'myths'>('terms');

  useEffect(() => {
    fetch('/data/glossary.json')
      .then((r) => r.json() as Promise<GlossaryPayload>)
      .then((d) => setData(d));
  }, []);

  const categories = useMemo(() => {
    const s = new Set<string>();
    data?.entries.forEach((e) => s.add(e.category));
    return Array.from(s).sort();
  }, [data]);

  const letters = useMemo(() => {
    const s = new Set<string>();
    data?.entries.forEach((e) => s.add(e.letter));
    return ['ALL', ...Array.from(s).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.entries.filter((e) => {
      if (letterFilter !== 'ALL' && e.letter !== letterFilter) return false;
      if (catFilter !== 'all' && e.category !== catFilter) return false;
      if (q && !`${e.term} ${e.meaning} ${e.confusion} ${e.category}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [data, query, letterFilter, catFilter]);

  if (!data) {
    return (
      <div className="page-shell container">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading glossary...</p>
      </div>
    );
  }

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? `อภิธานศัพท์ AI (${data.entries.length} คำ)` : `AI Engineering Glossary (${data.entries.length})`}
          </h1>
          <p className="bp-section-desc">
            Direct engineering definitions paired with common confusions, practical usage notes, and direct links back to source lessons.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setTab('terms')}
            className={`bp-btn bp-btn--sm ${tab === 'terms' ? 'bp-btn--primary' : ''}`}
          >
            Terms ({data.entries.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('myths')}
            className={`bp-btn bp-btn--sm ${tab === 'myths' ? 'bp-btn--primary' : ''}`}
          >
            Common Myths
          </button>
        </div>
      </div>

      {tab === 'myths' ? (
        <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 28 }}>
          <LessonMarkdown markdown={data.mythsMarkdown} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
            {letters.map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => setLetterFilter(lt)}
                className={`bp-btn bp-btn--sm ${letterFilter === lt ? 'bp-btn--primary' : ''}`}
                style={{ minWidth: 32, padding: '4px 8px' }}
              >
                {lt}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search term or misconception..."
              style={{
                flex: '1 1 260px',
                padding: '10px 14px',
                border: '1px solid var(--rule-soft)',
                background: 'var(--bg-surface)',
                color: 'var(--ink)',
              }}
            />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--rule-soft)',
                background: 'var(--bg-surface)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {filtered.map((g) => (
              <div
                key={g.slug}
                style={{
                  border: '1px solid var(--rule-soft)',
                  background: 'var(--bg-surface)',
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <h2 style={{ fontSize: '1.5rem', color: 'var(--ink)' }}>{g.term}</h2>
                {g.meaning && <p style={{ fontSize: '0.94rem' }}>{g.meaning}</p>}
                {g.confusion && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--ink-soft)', border: '1px solid var(--warn)', background: 'var(--bg-surface)', padding: '6px 10px' }}>
                    <strong>Common confusion:</strong> {g.confusion}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingTop: 6, borderTop: '1px solid var(--rule-soft)' }}>
                  <span className="bp-chip bp-chip--blue">{g.category}</span>
                  {g.learnLink && (
                    <Link
                      to={`/learn/${g.learnLink}`}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase' }}
                    >
                      Learn It →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
