import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ProjectEntry } from '../types/curriculum';
import { useLang } from '../context/LangContext';
import { LessonMarkdown } from '../components/LessonMarkdown';
import { CodeWorkbench } from '../components/CodeWorkbench';
import { CopyButton } from '../components/CopyButton';

export const ProjectsPage: React.FC = () => {
  const { projectId } = useParams();
  const { lang } = useLang();
  const [projects, setProjects] = useState<ProjectEntry[] | null>(null);
  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [codeTab, setCodeTab] = useState<'starter' | 'solution'>('solution');

  useEffect(() => {
    fetch('/data/projects.json')
      .then((r) => r.json() as Promise<ProjectEntry[]>)
      .then((d) => setProjects(d));
  }, []);

  const allLangs = useMemo(() => {
    const s = new Set<string>();
    projects?.forEach((p) => p.languages.forEach((l) => s.add(l)));
    return Array.from(s).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    if (!projects) return [];
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (langFilter !== 'all' && !p.languages.includes(langFilter)) return false;
      if (q && !`${p.title} ${p.tagline} ${p.summary}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projects, query, langFilter]);

  if (!projects) {
    return (
      <div className="page-shell container">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading 80 repository projects...</p>
      </div>
    );
  }

  if (projectId) {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) {
      return (
        <div className="page-shell container">
          <h1>Project Not Found</h1>
          <Link to="/projects" className="bp-btn" style={{ marginTop: 12 }}>
            ← All Projects
          </Link>
        </div>
      );
    }

    const activeFiles = (codeTab === 'starter' && proj.starterFiles.length > 0
      ? proj.starterFiles
      : proj.solutionFiles
    ).map((f) => ({ ...f, lines: f.content.split('\n').length }));

    const testCmd = `python3 scripts/project_test.py ${proj.id} --init learning-artifacts/${proj.id}\npython3 scripts/project_test.py ${proj.id} --all --path learning-artifacts/${proj.id} --strict`;

    return (
      <div className="page-shell container">
        <Link to="/projects" className="bp-btn bp-btn--sm" style={{ marginBottom: 18 }}>
          <ArrowLeft size={13} aria-hidden="true" />
          <span>All {projects.length} Projects</span>
        </Link>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <span className="bp-chip bp-chip--blue">LEVEL {proj.level} · {proj.levelName}</span>
          {proj.languages.map((lg) => (
            <span key={lg} className="bp-chip">{lg}</span>
          ))}
          <span className="bp-chip">~{proj.hours}h</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.3rem)', marginBottom: 10 }}>{proj.title}</h1>
        <p style={{ fontSize: '1.08rem', color: 'var(--ink-soft)', maxWidth: '72ch', marginBottom: 20 }}>
          {proj.tagline || proj.summary}
        </p>

        <div className="masthead-install" style={{ marginBottom: 24 }}>
          <div className="masthead-install-bar">
            <span>LOCAL GRADER COMMANDS</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn--sm">
                <ExternalLink size={12} aria-hidden="true" />
                <span>GitHub</span>
              </a>
              <CopyButton text={testCmd} />
            </div>
          </div>
          <pre>{testCmd}</pre>
        </div>

        {proj.stages.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--ink)', marginBottom: 10 }}>
              Project Stages ({proj.stages.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {proj.stages.map((st, idx) => (
                <div
                  key={st.id || idx}
                  style={{ border: '1px solid var(--rule-soft)', background: 'var(--bg-surface)', padding: 14 }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--blueprint)', marginRight: 6 }}>
                      0{idx + 1}
                    </span>
                    {st.title}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)' }}>{st.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(proj.starterFiles.length > 0 || proj.solutionFiles.length > 0) && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div className="fig-label">IMPLEMENTATION FILES</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {proj.starterFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCodeTab('starter')}
                    className={`bp-btn bp-btn--sm ${codeTab === 'starter' ? 'bp-btn--primary' : ''}`}
                  >
                    Starter ({proj.starterFiles.length})
                  </button>
                )}
                {proj.solutionFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCodeTab('solution')}
                    className={`bp-btn bp-btn--sm ${codeTab === 'solution' ? 'bp-btn--primary' : ''}`}
                  >
                    Reference Solution ({proj.solutionFiles.length})
                  </button>
                )}
              </div>
            </div>
            <CodeWorkbench files={activeFiles} />
          </div>
        )}

        {proj.readmeMarkdown && (
          <div style={{ border: '1px solid var(--rule-soft)', background: 'var(--bg)', padding: 24 }}>
            <LessonMarkdown markdown={proj.readmeMarkdown} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? `โปรเจกต์ลงมือสร้าง (${projects.length} ระบบ)` : `Engineering Projects (${projects.length})`}
          </h1>
          <p className="bp-section-desc">
            {lang === 'th'
              ? 'ทุกโปรเจกต์มาพร้อมโครงสร้าง Starter โค้ดเฉลย Reference และสคริปต์ตรวจรับคำตอบในเครื่อง'
              : 'Every project ships staged requirements, starter templates, reference implementations, and local graders.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
          style={{
            flex: '1 1 260px',
            padding: '10px 14px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
            color: 'var(--ink)',
          }}
        />
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
            color: 'var(--ink)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
          }}
        >
          <option value="all">All Languages</option>
          {allLangs.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
        {filtered.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            style={{
              border: '1px solid var(--rule-soft)',
              background: 'var(--bg-surface)',
              padding: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              color: 'var(--ink)',
            }}
          >
            <h2 style={{ fontSize: '1.45rem', color: 'var(--ink)' }}>{p.title}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', flex: 1 }}>
              {p.tagline || p.summary}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 6, borderTop: '1px solid var(--rule-soft)' }}>
              <span className="bp-chip">
                L{p.level} · {p.levelName} · {p.languages.join(', ') || 'Code'} · {p.hours}h
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--blueprint)' }}>
                {p.stages.length} STAGES →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
