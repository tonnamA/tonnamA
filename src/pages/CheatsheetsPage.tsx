import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { CheatsheetEntry } from '../types/curriculum';
import { useLang } from '../context/LangContext';
import { LessonMarkdown } from '../components/LessonMarkdown';

export const CheatsheetsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const [sheets, setSheets] = useState<CheatsheetEntry[] | null>(null);
  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string>(searchParams.get('sheet') || '');

  useEffect(() => {
    fetch('/data/cheatsheets.json')
      .then((r) => r.json() as Promise<CheatsheetEntry[]>)
      .then((d) => {
        setSheets(d);
        if (!selectedSlug && d.length > 0) setSelectedSlug(d[0].slug);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!sheets) return [];
    const q = query.trim().toLowerCase();
    if (!q) return sheets;
    return sheets.filter((s) => `${s.title} ${s.subtitle} ${s.code}`.toLowerCase().includes(q));
  }, [sheets, query]);

  const current = filtered.find((s) => s.slug === selectedSlug) ?? filtered[0] ?? null;

  if (!sheets) {
    return (
      <div className="page-shell container">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading 156 cheatsheets...</p>
      </div>
    );
  }

  return (
    <div className="page-shell container">
      <div className="bp-section-head no-print">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? `ชีตสรุปอ้างอิง (${sheets.length} แผ่น)` : `Engineering Cheatsheets (${sheets.length})`}
          </h1>
          <p className="bp-section-desc">
            Concise reference sheets derived directly from the curriculum phases — print-ready on paper or clean dark/light blueprint screen.
          </p>
        </div>
        <button type="button" onClick={() => window.print()} className="bp-btn bp-btn--sm">
          <Printer size={14} aria-hidden="true" />
          <span>Print Sheet</span>
        </button>
      </div>

      <div className="split-pane">
        <div className="no-print">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter 156 cheatsheets..."
            style={{
              width: '100%',
              padding: '10px 12px',
              marginBottom: 10,
              border: '1px solid var(--rule-soft)',
              background: 'var(--bg-surface)',
              color: 'var(--ink)',
            }}
          />
          <div style={{ maxHeight: '70vh', overflowY: 'auto', border: '1px solid var(--rule-soft)' }}>
            {filtered.map((s) => {
              const active = current?.slug === s.slug;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setSelectedSlug(s.slug)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    border: 0,
                    borderBottom: '1px solid var(--rule-soft)',
                    background: active ? 'var(--blueprint-tint)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--blueprint)' }}>
                    {s.code || 'SHEET'}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.94rem' }}>{s.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {current && (
          <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 28 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {current.code && <span className="bp-chip bp-chip--blue">{current.code}</span>}
              <span className="bp-chip">{current.slug}.md</span>
            </div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--ink)', marginBottom: 6 }}>{current.title}</h2>
            {current.subtitle && <p style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>{current.subtitle}</p>}
            <div style={{ borderTop: '1px solid var(--rule-soft)', paddingTop: 18 }}>
              <LessonMarkdown markdown={current.markdown} stripTitle />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
