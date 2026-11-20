import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ListTree,
} from 'lucide-react';
import { useManifest } from '../context/ManifestContext';
import { useLang } from '../context/LangContext';
import { useProgress } from '../context/ProgressContext';
import { LessonDetail } from '../types/curriculum';
import { LessonMarkdown } from '../components/LessonMarkdown';
import { CodeWorkbench } from '../components/CodeWorkbench';
import { QuizEngine } from '../components/QuizEngine';
import { CopyButton } from '../components/CopyButton';

const lessonCache = new Map<string, LessonDetail>();

type LessonTab = 'lesson' | 'code' | 'quiz' | 'ship';

export const LessonPage: React.FC = () => {
  const { phaseSlug = '00-setup-and-tooling', lessonSlug = '01-dev-environment' } = useParams();
  const [searchParams] = useSearchParams();
  const activePathId = searchParams.get('path');
  const navigate = useNavigate();

  const { manifest } = useManifest();
  const { lang, t } = useLang();
  const { isCompleted, toggleComplete, isBookmarked, toggleBookmark, setLastVisited } = useProgress();

  const [detail, setDetail] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<LessonTab>('lesson');
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [treeFilter, setTreeFilter] = useState('');
  const [expandedPhaseNum, setExpandedPhaseNum] = useState<number | null>(null);

  // Resolve clean slugs OR numbered directory names against manifest
  const resolved = useMemo(() => {
    if (!manifest) return null;
    const phase = manifest.phases.find(
      (p) => p.dirName === phaseSlug || p.slug === phaseSlug,
    );
    if (!phase) return null;
    const lesson = phase.lessons.find(
      (l) => l.dirName === lessonSlug || l.slug === lessonSlug,
    );
    if (!lesson) return null;
    return { phase, lesson };
  }, [manifest, phaseSlug, lessonSlug]);

  const lessonKey = resolved ? `${resolved.phase.dirName}/${resolved.lesson.dirName}` : null;

  useEffect(() => {
    if (!resolved || !lessonKey) return;
    setExpandedPhaseNum(resolved.phase.num);
    setTab('lesson');
    setMobileTreeOpen(false);
    setLastVisited(lessonKey);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    const cached = lessonCache.get(lessonKey);
    if (cached) {
      setDetail(cached);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    fetch(`/data/lessons/${resolved.phase.dirName}/${resolved.lesson.dirName}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<LessonDetail>;
      })
      .then((data) => {
        lessonCache.set(lessonKey, data);
        setDetail(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
        setLoading(false);
      });
  }, [resolved, lessonKey, setLastVisited]);

  const filteredPhases = useMemo(() => {
    if (!manifest) return [];
    const q = treeFilter.trim().toLowerCase();
    if (!q) return manifest.phases;
    return manifest.phases
      .map((p) => ({
        ...p,
        lessons: p.lessons.filter(
          (l) => l.title.toLowerCase().includes(q) || p.title.toLowerCase().includes(q),
        ),
      }))
      .filter((p) => p.lessons.length > 0);
  }, [manifest, treeFilter]);

  if (!manifest) {
    return (
      <div className="page-shell container">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading curriculum...</p>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="page-shell container">
        <div className="figure-card" style={{ padding: 28 }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 12 }}>Lesson Not Found</h1>
          <p style={{ marginBottom: 16 }}>
            Could not match <code>{phaseSlug}/{lessonSlug}</code> in the 542-lesson curriculum.
          </p>
          <Link to="/catalog" className="bp-btn bp-btn--primary">
            Browse Full Catalog →
          </Link>
        </div>
      </div>
    );
  }

  const done = lessonKey ? isCompleted(lessonKey) : false;
  const bookmarked = lessonKey ? isBookmarked(lessonKey) : false;

  return (
    <div className="lesson-layout">
      {/* LEFT SIDEBAR: 20-PHASE CURRICULUM TREE */}
      <aside className={`lesson-sidebar ${mobileTreeOpen ? 'mobile-open' : ''}`} aria-label="Curriculum navigation">
        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
          }}
        >
          <div className="fig-label" style={{ marginBottom: 8 }}>
            {t('curriculumTree')}
          </div>
          <input
            type="search"
            value={treeFilter}
            onChange={(e) => setTreeFilter(e.target.value)}
            placeholder="Filter 542 lessons..."
            style={{
              width: '100%',
              padding: '6px 10px',
              border: '1px solid var(--rule-soft)',
              background: 'var(--bg)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
            }}
          />
        </div>

        <div>
          {filteredPhases.map((p) => {
            const open = expandedPhaseNum === p.num || Boolean(treeFilter.trim());
            return (
              <div key={p.num} style={{ borderBottom: '1px solid var(--rule-soft)' }}>
                <button
                  type="button"
                  onClick={() => setExpandedPhaseNum(open ? null : p.num)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: 0,
                    background: p.num === resolved.phase.num ? 'var(--blueprint-tint)' : 'transparent',
                    color: 'var(--ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                  }}
                >
                  <span>
                    <strong style={{ color: 'var(--blueprint)' }}>
                      {String(p.num).padStart(2, '0')}
                    </strong>{' '}
                    {lang === 'th' ? p.titleTh : p.title}
                  </span>
                  {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                {open && (
                  <div style={{ background: 'var(--bg-surface)' }}>
                    {p.lessons.map((l) => {
                      const k = `${p.dirName}/${l.dirName}`;
                      const active = k === lessonKey;
                      const lDone = isCompleted(k);
                      return (
                        <Link
                          key={k}
                          to={`/learn/${p.dirName}/${l.dirName}${activePathId ? `?path=${activePathId}` : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            padding: '6px 12px 6px 20px',
                            borderTop: '1px solid var(--rule-soft)',
                            background: active ? 'var(--blueprint-tint-strong)' : 'transparent',
                            color: active ? 'var(--blueprint)' : 'var(--ink-soft)',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.84rem',
                            lineHeight: 1.35,
                          }}
                        >
                          <span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', marginRight: 6 }}>
                              {String(l.num).padStart(2, '0')}
                            </span>
                            {l.title}
                          </span>
                          {lDone && <Check size={12} style={{ color: 'var(--blueprint)', flexShrink: 0 }} />}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* CENTER READING COLUMN */}
      <article className="lesson-main">
        {/* Mobile tree toggle & breadcrumbs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--ink-mute)' }}>
            <Link to="/">Home</Link> / <Link to={`/roadmap?phase=${resolved.phase.num}`}>Phase {String(resolved.phase.num).padStart(2, '0')}</Link> / Lesson {String(resolved.lesson.num).padStart(2, '0')}
          </div>
          <button
            type="button"
            className="bp-btn bp-btn--sm"
            onClick={() => setMobileTreeOpen((v) => !v)}
          >
            <ListTree size={13} aria-hidden="true" />
            <span>{mobileTreeOpen ? 'Hide Tree' : 'All 20 Phases'}</span>
          </button>
        </div>

        {activePathId && (
          <div
            style={{
              padding: '8px 14px',
              marginBottom: 16,
              border: '1px solid var(--blueprint)',
              background: 'var(--blueprint-tint)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>ACTIVE PATH: {activePathId.toUpperCase()}</span>
            <Link to="/learning-paths">View Path →</Link>
          </div>
        )}

        {/* Lesson Header */}
        <header
          style={{
            paddingBottom: 22,
            borderBottom: '1px solid var(--rule-soft)',
            marginBottom: 20,
          }}
        >
          <h1 style={{ fontSize: 'clamp(2.1rem, 4.4vw, 3.2rem)', marginBottom: 10 }}>
            {detail?.title ?? resolved.lesson.title}
          </h1>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span className="bp-chip bp-chip--blue">
              PHASE {String(resolved.phase.num).padStart(2, '0')} · {resolved.phase.title}
            </span>
            <span className="bp-chip">{resolved.lesson.type}</span>
            {resolved.lesson.languages.map((lg) => (
              <span key={lg} className="bp-chip">
                {lg}
              </span>
            ))}
            <span className="bp-chip">~{resolved.lesson.timeMinutes} min</span>
          </div>

          {(detail?.motto || resolved.lesson.motto) && (
            <p style={{ fontSize: '1.12rem', fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 16 }}>
              “{detail?.motto || resolved.lesson.motto}”
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              onClick={() => lessonKey && toggleComplete(lessonKey)}
              className={`bp-btn bp-btn--sm ${done ? 'bp-btn--primary' : ''}`}
            >
              <Check size={14} aria-hidden="true" />
              <span>{done ? t('completed') : t('markComplete')}</span>
            </button>

            <button
              type="button"
              onClick={() => lessonKey && toggleBookmark(lessonKey)}
              className={`bp-btn bp-btn--sm ${bookmarked ? 'bp-btn--active' : ''}`}
            >
              <Bookmark size={14} aria-hidden="true" />
              <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            {detail && (
              <a
                href={detail.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-btn bp-btn--sm"
              >
                <ExternalLink size={13} aria-hidden="true" />
                <span>{t('viewOnGithub')}</span>
              </a>
            )}
          </div>
        </header>

        {/* Sticky Sub-tab Bar */}
        <div
          role="tablist"
          aria-label="Lesson workbench tabs"
          style={{
            position: 'sticky',
            top: 64,
            zIndex: 20,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            padding: '10px 0',
            background: 'var(--bg)',
            borderBottom: '1px solid var(--rule-soft)',
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'lesson'}
            onClick={() => setTab('lesson')}
            className={`bp-btn bp-btn--sm ${tab === 'lesson' ? 'bp-btn--primary' : ''}`}
          >
            {t('tabLesson')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'code'}
            onClick={() => setTab('code')}
            className={`bp-btn bp-btn--sm ${tab === 'code' ? 'bp-btn--primary' : ''}`}
          >
            {t('tabCode')} ({detail?.codeFiles.length ?? resolved.lesson.codeFileCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'quiz'}
            onClick={() => setTab('quiz')}
            className={`bp-btn bp-btn--sm ${tab === 'quiz' ? 'bp-btn--primary' : ''}`}
          >
            {t('tabQuiz')} ({detail?.quiz.length ?? resolved.lesson.quizCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'ship'}
            onClick={() => setTab('ship')}
            className={`bp-btn bp-btn--sm ${tab === 'ship' ? 'bp-btn--primary' : ''}`}
          >
            {t('tabShipIt')} ({detail?.outputs.length ?? resolved.lesson.outputCount})
          </button>
        </div>

        {/* Main Tab Content */}
        {loading ? (
          <div style={{ padding: 36, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}>
            Loading lesson content, code, quiz, and artifacts...
          </div>
        ) : error || !detail ? (
          <div style={{ padding: 24, border: '1px solid var(--danger)', color: 'var(--danger)' }}>
            Failed to load lesson JSON ({error}). Try reloading or viewing on GitHub.
          </div>
        ) : (
          <>
            {tab === 'lesson' && (
              <div>
                {detail.missionMarkdown && (
                  <div
                    className="figure-card"
                    style={{ borderColor: 'var(--blueprint)', marginBottom: 24 }}
                  >
                    <div className="figure-head">
                      <span className="left">WORKBENCH MISSION BRIEF</span>
                      <span className="right">mission.md</span>
                    </div>
                    <div className="figure-body">
                      <LessonMarkdown markdown={detail.missionMarkdown} currentPhaseDir={detail.phaseDir} />
                    </div>
                  </div>
                )}
                <LessonMarkdown
                  markdown={detail.docsMarkdown}
                  currentPhaseDir={detail.phaseDir}
                  stripTitle
                />
              </div>
            )}

            {tab === 'code' && <CodeWorkbench files={detail.codeFiles} />}

            {tab === 'quiz' && lessonKey && (
              <QuizEngine lessonKey={lessonKey} questions={detail.quiz} />
            )}

            {tab === 'ship' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {detail.outputs.length === 0 ? (
                  <div
                    style={{
                      padding: 24,
                      border: '1px solid var(--rule-soft)',
                      background: 'var(--bg-surface)',
                      color: 'var(--ink-soft)',
                    }}
                  >
                    This lesson does not define standalone files in <code>outputs/</code>.
                  </div>
                ) : (
                  detail.outputs.map((art) => (
                    <div
                      key={art.id}
                      style={{ border: '1px solid var(--ink)', background: 'var(--bg)' }}
                    >
                      <div
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--rule-soft)',
                          background: 'var(--bg-surface)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div>
                          <span className="bp-chip bp-chip--blue" style={{ marginRight: 8 }}>
                            {art.type.toUpperCase()}
                          </span>
                          <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem' }}>
                            {art.name}
                          </strong>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.72rem',
                              color: 'var(--ink-mute)',
                              marginLeft: 8,
                            }}
                          >
                            outputs/{art.filename}
                          </span>
                        </div>
                        <CopyButton text={art.raw} label="copy raw" />
                      </div>
                      <div style={{ padding: '16px 20px' }}>
                        {art.description && (
                          <p style={{ color: 'var(--ink-soft)', marginBottom: 12 }}>{art.description}</p>
                        )}
                        <LessonMarkdown markdown={art.body} currentPhaseDir={detail.phaseDir} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Bottom Prev / Next Lesson Cards */}
            <nav
              aria-label="Lesson sequence"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 14,
                marginTop: 48,
                paddingTop: 24,
                borderTop: '1px solid var(--rule-soft)',
              }}
            >
              {detail.prev ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/learn/${detail.prev!.phaseDir}/${detail.prev!.dirName}`)
                  }
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    border: '1px solid var(--rule-soft)',
                    background: 'var(--bg-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="fig-label"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}
                  >
                    <ArrowLeft size={12} aria-hidden="true" />
                    <span>{t('prevLesson')}</span>
                  </div>
                  <div style={{ color: 'var(--ink)', fontWeight: 600 }}>
                    {String(detail.prev.phaseNum).padStart(2, '0')}.{String(detail.prev.num).padStart(2, '0')} ·{' '}
                    {detail.prev.title}
                  </div>
                </button>
              ) : (
                <div />
              )}

              {detail.next && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/learn/${detail.next!.phaseDir}/${detail.next!.dirName}`)
                  }
                  style={{
                    textAlign: 'right',
                    padding: '14px 16px',
                    border: '1px solid var(--ink)',
                    background: 'var(--bg-surface)',
                    boxShadow: 'var(--shadow-hard)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    className="fig-label"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 6,
                      marginBottom: 4,
                    }}
                  >
                    <span>{t('nextLesson')}</span>
                    <ArrowRight size={12} aria-hidden="true" />
                  </div>
                  <div style={{ color: 'var(--ink)', fontWeight: 600 }}>
                    {String(detail.next.phaseNum).padStart(2, '0')}.{String(detail.next.num).padStart(2, '0')} ·{' '}
                    {detail.next.title}
                  </div>
                </button>
              )}
            </nav>
          </>
        )}
      </article>

      {/* RIGHT RAIL: ON THIS PAGE HEADINGS */}
      <aside className="lesson-toc-rail" aria-label="On this page">
        <div className="fig-label" style={{ marginBottom: 12 }}>
          {t('onThisPage')}
        </div>
        {detail?.headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              setTab('lesson');
              window.setTimeout(() => {
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              }, 30);
            }}
            style={{
              display: 'block',
              padding: '4px 0',
              paddingLeft: h.level === 3 ? 12 : 0,
              fontFamily: 'var(--font-body)',
              fontSize: h.level === 3 ? '0.82rem' : '0.88rem',
              color: 'var(--ink-soft)',
              lineHeight: 1.35,
            }}
          >
            {h.text}
          </a>
        ))}
      </aside>
    </div>
  );
};
