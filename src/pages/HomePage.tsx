import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronRight, Download, ExternalLink, Terminal } from 'lucide-react';
import { useManifest } from '../context/ManifestContext';
import { useLang } from '../context/LangContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { CurriculumStackSvg } from '../components/CurriculumStackSvg';
import { CopyButton } from '../components/CopyButton';
import { GradientDescentLab } from '../components/GradientDescentLab';

export const HomePage: React.FC = () => {
  const { manifest, loading } = useManifest();
  const { lang, t } = useLang();
  const { theme } = useTheme();
  const { state, isCompleted, toggleComplete } = useProgress();

  const [openPhases, setOpenPhases] = useState<Record<number, boolean>>({ 0: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [volFilter, setVolFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Build' | 'Learn'>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [showHostTable, setShowHostTable] = useState(false);

  const togglePhase = (num: number) => {
    setOpenPhases((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  const expandAll = (expand: boolean) => {
    if (!manifest) return;
    const next: Record<number, boolean> = {};
    manifest.phases.forEach((p) => {
      next[p.num] = expand;
    });
    setOpenPhases(next);
  };

  const availableLanguages = useMemo(() => {
    if (!manifest) return [];
    const set = new Set<string>();
    manifest.phases.forEach((p) =>
      p.lessons.forEach((l) => l.languages.forEach((lg) => set.add(lg))),
    );
    return Array.from(set).sort();
  }, [manifest]);

  const filteredPhases = useMemo(() => {
    if (!manifest) return [];
    const q = searchTerm.trim().toLowerCase();
    return manifest.phases
      .filter((p) => volFilter === 'all' || p.volume === volFilter)
      .map((p) => {
        const lessons = p.lessons.filter((l) => {
          if (typeFilter !== 'all' && l.type !== typeFilter) return false;
          if (langFilter !== 'all' && !l.languages.includes(langFilter)) return false;
          if (q) {
            const hay = `${l.title} ${l.motto} ${l.languages.join(' ')} ${p.title} ${p.titleTh}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        });
        return { ...p, lessons };
      })
      .filter((p) => p.lessons.length > 0);
  }, [manifest, searchTerm, volFilter, typeFilter, langFilter]);

  const totalLessons = manifest?.totals.lessons ?? 542;
  const completedCount = state.completedLessons.length;
  const completedPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const resumeRoute = state.lastVisited
    ? `/learn/${state.lastVisited}`
    : '/learn/00-setup-and-tooling/01-dev-environment';

  const handleSelectVolumeFromStack = (volNum: number) => {
    setVolFilter(volNum);
    const el = document.getElementById('contents');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (manifest) {
      const next: Record<number, boolean> = {};
      manifest.phases.forEach((p) => {
        if (p.volume === volNum) next[p.num] = true;
      });
      setOpenPhases(next);
    }
  };

  const startRows = [
    {
      who: lang === 'th' ? 'เริ่มต้นใหม่กับ AI' : 'New to AI',
      phase: 'Phase 0',
      lesson: lang === 'th' ? 'ตั้งค่าสภาพแวดล้อมพัฒนา (Dev Environment)' : 'Set up your dev environment',
      time: '45 min',
      to: '/learn/00-setup-and-tooling/01-dev-environment',
    },
    {
      who: lang === 'th' ? 'เขียน Python เป็นแล้ว' : 'I know Python',
      phase: 'Phase 1',
      lesson: lang === 'th' ? 'พีชคณิตเชิงเส้นผ่านโค้ด (Linear Algebra)' : 'Linear algebra intuition',
      time: '60 min',
      to: '/learn/01-math-foundations/01-linear-algebra-intuition',
    },
    {
      who: lang === 'th' ? 'อยากสร้าง LLM จากศูนย์' : 'Build an LLM from scratch',
      phase: 'Phase 10',
      lesson: lang === 'th' ? 'สร้าง Tokenizer — ก้าวแรกสู่ GPT' : 'Tokenizers, the first step to a GPT',
      time: '90 min',
      to: '/learn/10-llms-from-scratch/01-tokenizers',
    },
    {
      who: lang === 'th' ? 'สร้าง Agent Harness เอง' : 'Build your own agent harness',
      phase: 'Phase 14',
      lesson: lang === 'th' ? 'ทำไมโมเดลเก่งๆ ยังพลาดได้' : 'Why capable models still fail',
      time: '45 min',
      to: '/learn/14-agent-engineering/31-agent-workbench-why-models-fail',
    },
  ];

  const featuredProjects = [
    {
      id: 'retrieval-evaluation-lab',
      num: '01',
      lang: 'Python',
      title: 'Retrieval Evaluation Lab',
      desc:
        lang === 'th'
          ? 'เปรียบเทียบคุณภาพอันดับผลการค้นหาด้วย Precision, Recall, MRR และ NDCG พร้อมตรวจจับจุดถดถอยรายคำถาม'
          : 'Measure ranking quality with precision, recall, reciprocal rank, and discounted gain while catching per-query regressions.',
    },
    {
      id: 'agent-trace-debugger',
      num: '02',
      lang: 'TypeScript',
      title: 'Agent Trace Debugger',
      desc:
        lang === 'th'
          ? 'แยกวิเคราะห์ JSONL trace ของ Agent แยกเวลาทำงานของ Child Span ออกจาก Parent และรายงานการใช้ Token ที่เพิ่มขึ้น'
          : 'Parse JSONL agent execution traces, isolate overlapping child work from parent latency, and surface token spikes.',
    },
    {
      id: 'tool-call-firewall',
      num: '03',
      lang: 'Rust',
      title: 'Tool Call Firewall',
      desc:
        lang === 'th'
          ? 'ตรวจสอบ envelope การเรียก Tool สิทธิ์ของผู้เรียก และการใช้ single-use approval receipt แบบผูกกับเนื้อหาคำสั่งจริง'
          : 'Validate tool call envelopes, enforce caller role & path checks, and consume request-bound single-use approval receipts.',
    },
  ];

  const loopImgSuffix = theme === 'dark' ? 'dark' : 'light';

  return (
    <div>
      {/* MASTHEAD */}
      <section className="manual-masthead container">
        <div className="masthead-grid">
          <div>
            <h1 className="manual-title">
              {t('heroTitleLine1')}
              <br />
              {t('heroTitleLine2')}
            </h1>

            <p className="manual-tagline">
              <strong>
                {manifest ? `${manifest.totals.lessons} lessons` : '542 lessons'}.{' '}
                {manifest ? `${manifest.totals.phases} phases` : '20 phases'}.
              </strong>{' '}
              {t('heroTaglineSuffix')}
            </p>
            <p className="manual-attribution">{t('heroAttribution')}</p>

            <div className="masthead-cta">
              <Link to={resumeRoute} className="bp-btn bp-btn--primary">
                <span>{state.lastVisited ? t('ctaResume') : t('ctaStart')}</span>
                <span aria-hidden="true">→</span>
              </Link>
              <Link to="/learning-paths" className="bp-btn">
                <span>{t('ctaPaths')}</span>
              </Link>
              <Link to="/assessment" className="bp-btn">
                <span>{t('ctaQuiz')}</span>
              </Link>
              <Link to="/guide-th" className="bp-btn">
                <span>{t('ctaThaiGuide')}</span>
              </Link>
            </div>

            <div className="masthead-install">
              <div className="masthead-install-bar">
                <span>AGENT TUTOR · TERMINAL SKILL INSTALL</span>
                <CopyButton text="npx skills add rohitg00/ai-engineering-from-scratch" />
              </div>
              <pre>
                <span style={{ color: 'var(--ink-mute)', userSelect: 'none' }}>$ </span>
                npx skills add <span style={{ color: 'var(--blueprint)' }}>rohitg00/ai-engineering-from-scratch</span>
              </pre>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            {manifest && (
              <CurriculumStackSvg
                volumes={manifest.volumes}
                phases={manifest.phases}
                onSelectVolume={handleSelectVolumeFromStack}
              />
            )}

            <nav className="masthead-start" aria-labelledby="mastheadStartTitle">
              <p className="masthead-start-title" id="mastheadStartTitle">
                {t('startCardTitle')}
              </p>
              <ul className="masthead-start-list">
                {startRows.map((row) => (
                  <li key={row.to}>
                    <Link className="masthead-start-row" to={row.to}>
                      <span className="masthead-start-who">{row.who}</span>
                      <span className="masthead-start-lesson">
                        <span className="masthead-start-phase">{row.phase}</span>
                        {row.lesson}
                      </span>
                      <span className="masthead-start-time">{row.time} →</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <a className="masthead-start-more" href="#contents">
                <span>{t('browseAllPhases')}</span>
                <span aria-hidden="true">↓</span>
              </a>
            </nav>
          </div>
        </div>

        <div className="manual-meta-row">
          <span>{t('heroKickerLeft')}</span>
          <span className="right">
            {manifest
              ? `${manifest.totals.lessons} LESSONS · ${manifest.totals.phases} PHASES · ${manifest.totals.outputs} ARTIFACTS`
              : '542 LESSONS · 20 PHASES · 5 LANGUAGES'}
          </span>
          <span>{t('heroKickerRight')}</span>
        </div>
      </section>

      <hr className="container ascii-rule" aria-hidden="true" />

      {/* AGENT TUTOR SECTION */}
      <section className="bp-section container" id="agent-tutor">
        <div className="bp-section-head">
          <div>
            <h2 className="bp-section-title">{t('tutorTitle')}</h2>
            <p className="bp-section-desc">{t('tutorDesc')}</p>
          </div>
          <button
            type="button"
            className="bp-btn bp-btn--sm"
            onClick={() => setShowHostTable((v) => !v)}
          >
            <Terminal size={13} aria-hidden="true" />
            <span>{showHostTable ? 'Hide Host Commands' : 'Host Invocation Commands'}</span>
          </button>
        </div>

        <div className="table-wrap">
          <table className="bp-table">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Stage</th>
                <th style={{ width: '28%' }}>Workflow</th>
                <th>Operational Protocol</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  step: '01 · INSTALL',
                  title: lang === 'th' ? 'ติดตั้งทักษะติวเตอร์' : 'Install the skills',
                  body:
                    lang === 'th'
                      ? 'รันคำสั่ง npx skills add เพื่อติดตั้งชุดทักษะลงใน Claude Code, Cursor หรือ Codex'
                      : 'Install the portable SKILL.md pack into Claude Code, Cursor, or Codex without cloning.',
                },
                {
                  step: '02 · CALIBRATE',
                  title: lang === 'th' ? 'วัดระดับพื้นฐานของคุณ' : 'Find your level',
                  body:
                    lang === 'th'
                      ? 'ทำแบบทดสอบ 10 ข้อเพื่อประเมินความรู้ตั้งต้นและกำหนด Phase ที่ควรเริ่ม'
                      : 'Run the 10-question diagnostic on the web or via /find-your-level to skip what you know.',
                },
                {
                  step: '03 · PLAN',
                  title: lang === 'th' ? 'รับแผนการเรียนเฉพาะตัว' : 'Get your plan',
                  body:
                    lang === 'th'
                      ? 'บันทึกเส้นทางและชั่วโมงเรียนลง LEARNING.md หรือติดตามผ่าน Roadmap บนเว็บนี้'
                      : 'Persist your tailored study path, prerequisites, and review queue across sessions.',
                },
                {
                  step: '04 · SHIP',
                  title: lang === 'th' ? 'เรียนและสร้างชิ้นงานจริง' : 'Learn & ship every session',
                  body:
                    lang === 'th'
                      ? 'ทวนคำศัพท์ เขียนอัลกอริทึมจากศูนย์ รันเทสต์ ทำควิซ และเก็บสกิลใช้งานจริง'
                      : 'One concept, raw math implementation, framework mapping, quiz check, and shippable artifact.',
                },
              ].map((c) => (
                <tr key={c.step}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--blueprint)', whiteSpace: 'nowrap' }}>
                    {c.step}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{c.title}</td>
                  <td style={{ color: 'var(--ink-soft)' }}>{c.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showHostTable && (
          <div className="table-wrap" style={{ marginTop: 20 }}>
            <table className="bp-table">
              <thead>
                <tr>
                  <th>Host</th>
                  <th>Start Course</th>
                  <th>Start MCP Path</th>
                  <th>Start Agent Skills</th>
                  <th>Phase Quiz</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Codex</td>
                  <td>
                    <code>start-learning</code>
                  </td>
                  <td>
                    <code>learn-mcp</code>
                  </td>
                  <td>
                    <code>learn-agent-skills</code>
                  </td>
                  <td>
                    <code>check-understanding 13</code>
                  </td>
                </tr>
                <tr>
                  <td>Claude Code</td>
                  <td>
                    <code>/start-learning</code>
                  </td>
                  <td>
                    <code>/learn-mcp</code>
                  </td>
                  <td>
                    <code>/learn-agent-skills</code>
                  </td>
                  <td>
                    <code>/check-understanding 13</code>
                  </td>
                </tr>
                <tr>
                  <td>Cursor / Other</td>
                  <td>
                    <code>Use start-learning</code>
                  </td>
                  <td>
                    <code>Use learn-mcp</code>
                  </td>
                  <td>
                    <code>Use learn-agent-skills</code>
                  </td>
                  <td>
                    <code>Use check-understanding</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* COMPLETE 20-PHASE CURRICULUM CONTENTS */}
      <section className="bp-section container" id="contents">
        <div className="bp-section-head">
          <div>
            <h2 className="bp-section-title">{t('tocTitle')}</h2>
            <p className="bp-section-desc">{t('tocSubtitle')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => expandAll(true)} className="bp-btn bp-btn--sm">
              Expand All
            </button>
            <button type="button" onClick={() => expandAll(false)} className="bp-btn bp-btn--sm">
              Collapse All
            </button>
            <Link to="/catalog" className="bp-btn bp-btn--sm bp-btn--primary">
              Full Catalog View →
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            border: '1px solid var(--ink)',
            background: 'var(--bg-surface)',
            padding: '14px 18px',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.76rem',
              marginBottom: 8,
            }}
          >
            <span style={{ color: 'var(--blueprint)', fontWeight: 700 }}>
              {completedCount} / {totalLessons} {t('lessonsCompleted')} ({completedPct}%)
            </span>
            <Link to="/roadmap" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
              Open Visual Dependency Roadmap →
            </Link>
          </div>
          <div style={{ height: 6, background: 'var(--rule-soft)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${completedPct}%`,
                height: '100%',
                background: 'var(--blueprint)',
                transition: 'width 220ms var(--ease-out)',
              }}
            />
          </div>
        </div>

        {/* Volume pills + Filter toolbar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 14,
          }}
        >
          <button
            type="button"
            onClick={() => setVolFilter('all')}
            className={`bp-btn bp-btn--sm ${volFilter === 'all' ? 'bp-btn--active' : ''}`}
          >
            {t('allVolumes')}
          </button>
          {manifest?.volumes.map((v) => (
            <button
              key={v.num}
              type="button"
              onClick={() => setVolFilter(v.num)}
              className={`bp-btn bp-btn--sm ${volFilter === v.num ? 'bp-btn--active' : ''}`}
            >
              VOL {v.num}: {v.title}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('filterSearchLessons')}
            aria-label={t('filterSearchLessons')}
            style={{
              padding: '10px 14px',
              border: '1px solid var(--rule-soft)',
              background: 'var(--bg-surface)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.96rem',
            }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Build' | 'Learn')}
            aria-label="Filter by lesson type"
            style={{
              padding: '10px 12px',
              border: '1px solid var(--rule-soft)',
              background: 'var(--bg-surface)',
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
            aria-label="Filter by programming language"
            style={{
              padding: '10px 12px',
              border: '1px solid var(--rule-soft)',
              background: 'var(--bg-surface)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
            }}
          >
            <option value="all">{t('allLangs')}</option>
            {availableLanguages.map((lg) => (
              <option key={lg} value={lg}>
                {lg}
              </option>
            ))}
          </select>
        </div>

        {/* Phase Accordions */}
        {loading ? (
          <div style={{ padding: 32, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}>
            Loading 20 phases and 542 lessons...
          </div>
        ) : filteredPhases.length === 0 ? (
          <div style={{ padding: 28, border: '1px solid var(--rule-soft)', background: 'var(--bg-surface)' }}>
            <p>{t('noItemsMatch')}</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setVolFilter('all');
                setTypeFilter('all');
                setLangFilter('all');
              }}
              className="bp-btn bp-btn--sm"
              style={{ marginTop: 12 }}
            >
              {t('resetFilters')}
            </button>
          </div>
        ) : (
          <div>
            {filteredPhases.map((phase) => {
              const isOpen = Boolean(openPhases[phase.num]) || Boolean(searchTerm.trim());
              const phaseDone = phase.lessons.filter((l) =>
                isCompleted(`${phase.dirName}/${l.dirName}`),
              ).length;

              return (
                <div key={phase.num} className={`phase-block ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="phase-trigger"
                    aria-expanded={isOpen}
                    onClick={() => togglePhase(phase.num)}
                  >
                    <span className="phase-num">PHASE {String(phase.num).padStart(2, '0')}</span>
                    <div>
                      <div className="phase-name">
                        {lang === 'th' ? phase.titleTh : phase.title}
                      </div>
                      <div className="phase-sub">
                        {lang === 'th' ? phase.taglineTh : phase.tagline}
                      </div>
                    </div>
                    <div className="phase-meta-right">
                      <span className="bp-chip">VOL {phase.volume}</span>
                      <span className="bp-chip bp-chip--blue">
                        {phaseDone}/{phase.lessonCount} lessons
                      </span>
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div>
                      {phase.lessons.map((lesson) => {
                        const key = `${phase.dirName}/${lesson.dirName}`;
                        const done = isCompleted(key);
                        return (
                          <div
                            key={key}
                            className={`lesson-list-row ${done ? 'is-done' : ''}`}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.76rem',
                                color: 'var(--blueprint)',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {String(lesson.num).padStart(2, '0')}
                            </span>

                            <div style={{ minWidth: 0 }}>
                              <Link
                                to={`/learn/${phase.dirName}/${lesson.dirName}`}
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  fontWeight: 600,
                                  fontSize: '1.02rem',
                                  color: 'var(--ink)',
                                }}
                              >
                                {lesson.title}
                              </Link>
                              {lesson.motto && (
                                <div
                                  style={{
                                    fontSize: '0.84rem',
                                    color: 'var(--ink-soft)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {lesson.motto}
                                </div>
                              )}
                            </div>

                            <div
                              className="lesson-list-langs"
                              style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}
                            >
                              {lesson.track && <span className="bp-chip bp-chip--blue">{lesson.track}</span>}
                              <span className="bp-chip">{lesson.type}</span>
                              {lesson.languages.slice(0, 3).map((lg) => (
                                <span key={lg} className="bp-chip">
                                  {lg}
                                </span>
                              ))}
                              {lesson.hasQuiz && (
                                <span className="bp-chip bp-chip--ok">Quiz ({lesson.quizCount})</span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleComplete(key)}
                              aria-label={done ? `Unmark ${lesson.title}` : `Mark ${lesson.title} complete`}
                              className={`bp-btn bp-btn--sm ${done ? 'bp-btn--active' : ''}`}
                              style={{ minWidth: 34, padding: '4px 8px' }}
                            >
                              <Check size={13} aria-hidden="true" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW EVERY LESSON WORKS (6-BEAT SPINE + 4 REAL ARTIFACT SVGS) */}
      <section className="bp-section container">
        <div className="bp-section-head">
          <div>
            <h2 className="bp-section-title">{t('loopTitle')}</h2>
            <p className="bp-section-desc">{t('loopDesc')}</p>
          </div>
          <Link to="/skills" className="bp-btn bp-btn--sm">
            Browse All {manifest?.totals.outputs ?? 580} Shipped Artifacts →
          </Link>
        </div>

        <div className="figure-card">
          <div className="figure-head">
            <span className="left">FIG_001 · LESSON LOOP</span>
            <span className="right">MOTTO → PROBLEM → CONCEPT → BUILD IT → USE IT → SHIP IT</span>
          </div>
          <div className="figure-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={`/upstream-assets/readme/lesson-loop-${loopImgSuffix}.svg`}
              alt="Lesson loop diagram showing problem, build from scratch, production library comparison, and shippable artifact"
              style={{ width: '100%', maxWidth: 880, height: 'auto' }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: 1,
            background: 'var(--rule-soft)',
            border: '1px solid var(--ink)',
            marginTop: 20,
          }}
        >
          {[
            {
              fig: 'FIG_001.A',
              name: 'PROMPTS',
              img: '/upstream-assets/figures/001-a-prompts.svg',
              desc:
                lang === 'th'
                  ? 'เทมเพลตพรอมต์เฉพาะทาง ก๊อปปี้ไปใช้ในงานจริงได้ทันที'
                  : 'Structured prompt specs ready to paste into your engineering workflow.',
            },
            {
              fig: 'FIG_001.B',
              name: 'SKILLS',
              img: '/upstream-assets/figures/001-b-skills.svg',
              desc:
                lang === 'th'
                  ? 'ไฟล์ SKILL.md สำหรับติดตั้งให้ Claude Code, Cursor และ Codex'
                  : 'Portable SKILL.md modules ready for Claude, Cursor, Codex, and compatible hosts.',
            },
            {
              fig: 'FIG_001.C',
              name: 'AGENTS',
              img: '/upstream-assets/figures/001-c-agents.svg',
              desc:
                lang === 'th'
                  ? 'สเปกเอเจนต์อัตโนมัติพร้อมลูปตรวจรับและขอบเขตงานชัดเจน'
                  : 'Autonomous loop specs and harness definitions built from first principles.',
            },
            {
              fig: 'FIG_001.D',
              name: 'MCP SERVERS',
              img: '/upstream-assets/figures/001-d-mcp-servers.svg',
              desc:
                lang === 'th'
                  ? 'เซิร์ฟเวอร์และสัญญาข้อมูล MCP ที่ต่อเข้ากับไคลเอนต์จริงได้ทันที'
                  : 'Stateless MCP tool contracts and server templates from Phase 13.',
            },
          ].map((art) => (
            <Link
              key={art.fig}
              to="/skills"
              style={{
                background: 'var(--bg)',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                color: 'var(--ink)',
              }}
            >
              <img
                src={art.img}
                alt={art.name}
                width={68}
                height={68}
                style={{
                  flexShrink: 0,
                  filter: theme === 'dark' ? 'invert(0.92) hue-rotate(180deg)' : 'none',
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--ink)', marginBottom: 4 }}>{art.name}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-soft)', marginBottom: 8 }}>{art.desc}</p>
                <span className="fig-label">{art.fig} · SPEC MODULE →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* INTERACTIVE LAB PREVIEW */}
      <section className="bp-section container">
        <div className="bp-section-head">
          <div>
            <h2 className="bp-section-title">{t('labPreviewTitle')}</h2>
            <p className="bp-section-desc">{t('labPreviewDesc')}</p>
          </div>
          <Link to="/labs" className="bp-btn bp-btn--primary bp-btn--sm">
            {t('openFullLabs')} →
          </Link>
        </div>

        <GradientDescentLab compact />
      </section>

      {/* FEATURED STAGED PROJECTS */}
      <section className="bp-section container">
        <div className="bp-section-head">
          <div>
            <h2 className="bp-section-title">{t('projectsTitle')}</h2>
          </div>
          <Link to="/projects" className="bp-btn bp-btn--sm">
            {t('browseAllProjects')} →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {featuredProjects.map((pr) => (
            <Link
              key={pr.id}
              to={`/projects/${pr.id}`}
              style={{
                border: '1px solid var(--ink)',
                background: 'var(--bg)',
                boxShadow: 'var(--shadow-hard)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                color: 'var(--ink)',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', color: 'var(--ink)' }}>{pr.title}</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', flex: 1 }}>{pr.desc}</p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  paddingTop: 8,
                  borderTop: '1px solid var(--rule-soft)',
                }}
              >
                <span className="fig-label">PROJECT {pr.num} · STARTER + SOLUTION</span>
                <span className="bp-chip bp-chip--blue">{pr.lang}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* INSIDE THE MACHINES */}
      <section className="bp-section container">
        <div className="bp-section-head">
          <div>
            <h2 className="bp-section-title">{t('machinesTitle')}</h2>
          </div>
          <Link to="/labs" className="bp-btn bp-btn--sm">
            Launch Lab Studio →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 14,
          }}
        >
          {[
            {
              fig: 'FIG_LAB.02',
              tab: 'agent',
              title: 'Inside an AI Agent',
              desc:
                lang === 'th'
                  ? 'ส่องทุกสเต็ปของ ReAct loop, Tool Schema Firewall, Budget และ Observation Gate'
                  : 'Step through a ReAct agent cycle: system contract, tool call JSON, firewall check, and verification.',
            },
            {
              fig: 'FIG_LAB.03',
              tab: 'decompiler',
              title: 'Inside a Decompiler',
              desc:
                lang === 'th'
                  ? 'เชื่อมโยง ELF Hex bytes, Disassembly, Control Flow Graph และ SSA Pseudocode ในมุมมองเดียว'
                  : 'Linked 4-pane lifting workbench: ELF bytes, disassembly, control flow graph SVG, and SSA pseudocode.',
            },
            {
              fig: 'FIG_LAB.04',
              tab: 'gpu',
              title: 'Inside an LLM Serving GPU',
              desc:
                lang === 'th'
                  ? 'จำลอง PagedAttention KV-Cache, Continuous Batching และวัดค่า TTFT / TPOT แบบเรียลไทม์'
                  : 'Simulate PagedAttention physical KV blocks, continuous batching, prefix reuse, and live TTFT/TPOT.',
            },
          ].map((m) => (
            <Link
              key={m.fig}
              to={`/labs?tab=${m.tab}`}
              style={{
                border: '1px solid var(--rule-soft)',
                background: 'var(--bg-surface)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                color: 'var(--ink)',
              }}
            >
              <h3 style={{ fontSize: '1.5rem', color: 'var(--ink)' }}>{m.title}</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', flex: 1 }}>{m.desc}</p>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--blueprint)' }}>
                {m.fig} · OPEN INTERACTIVE MACHINE →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* SIX-VOLUME BOOK SERIES */}
      <section className="bp-section container" id="books">
        <div className="bp-section-head">
          <div>
            <h2 className="bp-section-title">{t('booksTitle')}</h2>
          </div>
        </div>

        <div className="table-wrap">
          <table className="bp-table">
            <thead>
              <tr>
                <th style={{ width: 92 }}>Volume</th>
                <th style={{ width: '24%' }}>Book Title</th>
                <th style={{ width: 130 }}>Phases</th>
                <th>Curriculum Scope</th>
                <th style={{ width: 170 }}>Formats</th>
              </tr>
            </thead>
            <tbody>
              {manifest?.volumes.map((vol) => (
                <tr key={vol.num}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--blueprint)', whiteSpace: 'nowrap' }}>
                    VOL 0{vol.num}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--ink)' }}>
                    {lang === 'th' ? vol.titleTh : vol.title}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', whiteSpace: 'nowrap' }}>
                    {vol.phases.map((n) => `P${String(n).padStart(2, '0')}`).join(', ')}
                  </td>
                  <td style={{ color: 'var(--ink-soft)' }}>
                    {lang === 'th' ? vol.subtitleTh : vol.subtitle}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={vol.epub} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn--sm">
                        <Download size={12} aria-hidden="true" />
                        <span>EPUB</span>
                      </a>
                      <a href={vol.pdf} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn--sm">
                        <ExternalLink size={12} aria-hidden="true" />
                        <span>PDF</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CERTIFICATION SPOTLIGHT */}
      <section className="bp-section container" id="certifications" style={{ borderBottom: 0 }}>
        <div className="cert-spotlight-grid">
          <div>
            <h2 className="bp-section-title" style={{ marginBottom: 10 }}>
              {t('certsTitle')}
            </h2>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '64ch' }}>
              {lang === 'th'
                ? 'โปรแกรมเตรียมสอบแบบโอเพนซอร์สสำหรับสาย Claude Certification (CCAO-F, CCDV-F, CCAR-F, CCAR-P) และ Model Context Protocol Associate (MCPA — 34 บทเรียน 5 โดเมน) พร้อมข้อสอบจำลองและแบบทดสอบวินิจฉัย'
                : 'Open-source preparation tracks mapped to all four Claude certification blueprints (CCAO-F, CCDV-F, CCAR-F, CCAR-P) and the 34-lesson Model Context Protocol Associate (MCPA) specification, complete with diagnostic exams and mock banks.'}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/certifications" className="bp-btn bp-btn--primary">
              Explore Claude &amp; MCPA Tracks →
            </Link>
            <Link to="/practice" className="bp-btn">
              Practice Coding &amp; Interviews (500+)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
