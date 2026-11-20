import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArtifactEntry } from '../types/curriculum';
import { useLang } from '../context/LangContext';
import { CopyButton } from '../components/CopyButton';
import { LessonMarkdown } from '../components/LessonMarkdown';

export const ToolkitPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { lang } = useLang();
  const [items, setItems] = useState<ArtifactEntry[] | null>(null);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetDir, setTargetDir] = useState('~/.claude/skills/');

  useEffect(() => {
    fetch('/data/skills.json')
      .then((r) => r.json() as Promise<ArtifactEntry[]>)
      .then((d) => {
        setItems(d);
        if (d.length > 0) setSelectedId(d[0].id);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (phaseFilter !== 'all' && String(a.phaseNum) !== phaseFilter) return false;
      if (q && !`${a.name} ${a.description} ${a.tags.join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, query, typeFilter, phaseFilter]);

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  const installCmd = `python3 scripts/install_skills.py ${targetDir} --type ${
    typeFilter === 'all' ? 'all' : `${typeFilter}s`
  }${phaseFilter !== 'all' ? ` --phase ${phaseFilter}` : ''}`;

  if (!items) {
    return (
      <div className="page-shell container">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading 580 shipped artifacts...</p>
      </div>
    );
  }

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? `คลังชิ้นงานใช้งานจริง (${items.length})` : `Lesson Artifacts & Toolkit (${items.length})`}
          </h1>
          <p className="bp-section-desc">
            Every skill, prompt template, agent contract, and MCP spec shipped across all 20 phases.
          </p>
        </div>
      </div>

      <div className="masthead-install" style={{ marginBottom: 20 }}>
        <div className="masthead-install-bar">
          <span>BATCH INSTALLER CLI BUILDER</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text"
              value={targetDir}
              onChange={(e) => setTargetDir(e.target.value)}
              aria-label="Target skills directory"
              style={{
                padding: '3px 8px',
                border: '1px solid var(--rule-soft)',
                background: 'var(--bg)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
              }}
            />
            <CopyButton text={installCmd} />
          </div>
        </div>
        <pre>{installCmd}</pre>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, prompts, tags..."
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
            color: 'var(--ink)',
          }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <option value="all">All Types ({items.length})</option>
          <option value="skill">Skills</option>
          <option value="prompt">Prompts</option>
          <option value="agent">Agents</option>
          <option value="mcp">MCP</option>
        </select>
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <option value="all">All Phases</option>
          {Array.from({ length: 20 }).map((_, idx) => (
            <option key={idx} value={String(idx)}>
              Phase {String(idx).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      <div className="split-pane">
        <div
          style={{
            maxHeight: '72vh',
            overflowY: 'auto',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg)',
          }}
        >
          {filtered.slice(0, 120).map((art) => {
            const active = selected?.id === art.id;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => setSelectedId(art.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 14px',
                  border: 0,
                  borderBottom: '1px solid var(--rule-soft)',
                  background: active ? 'var(--blueprint-tint)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <span className="bp-chip bp-chip--blue">{art.type}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-mute)' }}>
                    P{String(art.phaseNum).padStart(2, '0')}.{String(art.lessonNum).padStart(2, '0')}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.96rem' }}>{art.name}</div>
                {art.description && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)', marginTop: 2 }}>
                    {art.description.slice(0, 110)}
                  </div>
                )}
              </button>
            );
          })}
          {filtered.length > 120 && (
            <div style={{ padding: 12, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-mute)' }}>
              Showing first 120 of {filtered.length} artifacts — narrow search to inspect more.
            </div>
          )}
        </div>

        {selected && (
          <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div>
                <span className="bp-chip bp-chip--blue" style={{ marginRight: 8 }}>
                  {selected.type.toUpperCase()}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--ink-mute)' }}>
                  outputs/{selected.filename}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  to={`/learn/${selected.phaseDir}/${selected.lessonDir}`}
                  className="bp-btn bp-btn--sm"
                >
                  Open Source Lesson →
                </Link>
                <CopyButton text={selected.raw} label="copy file" />
              </div>
            </div>

            <h2 style={{ fontSize: '1.9rem', color: 'var(--ink)', marginBottom: 8 }}>{selected.name}</h2>
            {selected.description && (
              <p style={{ color: 'var(--ink-soft)', marginBottom: 14 }}>{selected.description}</p>
            )}
            {selected.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                {selected.tags.map((tg) => (
                  <span key={tg} className="bp-chip">{tg}</span>
                ))}
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--rule-soft)', paddingTop: 16 }}>
              <LessonMarkdown markdown={selected.body} currentPhaseDir={selected.phaseDir} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
