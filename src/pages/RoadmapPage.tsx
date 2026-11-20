import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Download, RotateCcw, Upload } from 'lucide-react';
import { useManifest } from '../context/ManifestContext';
import { useLang } from '../context/LangContext';
import { useProgress } from '../context/ProgressContext';

interface DagCoord {
  num: number;
  x: number;
  y: number;
  short: string;
}

const DAG_NODES: DagCoord[] = [
  { num: 0, x: 90, y: 50, short: 'P00 Setup' },
  { num: 1, x: 240, y: 50, short: 'P01 Math' },
  { num: 2, x: 390, y: 50, short: 'P02 ML' },
  { num: 3, x: 540, y: 50, short: 'P03 DL Core' },

  { num: 4, x: 360, y: 145, short: 'P04 Vision' },
  { num: 5, x: 540, y: 145, short: 'P05 NLP' },
  { num: 6, x: 720, y: 145, short: 'P06 Speech' },
  { num: 9, x: 890, y: 145, short: 'P09 RL' },

  { num: 7, x: 540, y: 240, short: 'P07 Transformers' },
  { num: 8, x: 360, y: 330, short: 'P08 GenAI' },
  { num: 10, x: 540, y: 330, short: 'P10 LLMs' },

  { num: 11, x: 540, y: 420, short: 'P11 LLM Eng' },
  { num: 12, x: 740, y: 420, short: 'P12 Multimodal' },

  { num: 13, x: 540, y: 510, short: 'P13 Tools/MCP' },
  { num: 14, x: 540, y: 600, short: 'P14 Agents' },

  { num: 15, x: 360, y: 690, short: 'P15 Autonomous' },
  { num: 17, x: 740, y: 690, short: 'P17 Infra' },

  { num: 16, x: 220, y: 780, short: 'P16 Swarms' },
  { num: 18, x: 500, y: 780, short: 'P18 Safety' },
  { num: 19, x: 540, y: 870, short: 'P19 Capstones' },
];

export const RoadmapPage: React.FC = () => {
  const { manifest } = useManifest();
  const { lang, t } = useLang();
  const { state, isCompleted, toggleComplete, resetProgress, exportProgressJson, importProgressJson } = useProgress();
  const [searchParams] = useSearchParams();
  const initialPhase = Number(searchParams.get('phase') ?? '0');
  const [selectedPhase, setSelectedPhase] = useState<number>(
    Number.isNaN(initialPhase) ? 0 : initialPhase,
  );
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const nodeMap = useMemo(() => {
    const m = new Map<number, DagCoord>();
    DAG_NODES.forEach((n) => m.set(n.num, n));
    return m;
  }, []);

  const currentPhase = manifest?.phases.find((p) => p.num === selectedPhase) ?? manifest?.phases[0];
  const totalHours = manifest?.phases.reduce((a, p) => a + p.estimatedHours, 0) ?? 342;
  const totalLessons = manifest?.totals.lessons ?? 542;
  const doneCount = state.completedLessons.length;

  const handleExport = () => {
    const blob = new Blob([exportProgressJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aiefs-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((txt) => {
      const ok = importProgressJson(txt);
      setImportFeedback(ok ? 'Progress imported successfully.' : 'Invalid progress JSON file.');
    });
  };

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? 'แผนผังการเรียน 20 ระยะ' : 'Curriculum Roadmap'}
          </h1>
          <p className="bp-section-desc">
            {lang === 'th'
              ? 'คลิกที่โหนด Phase ใดก็ได้เพื่อดูบทเรียนย่อยและตรวจสอบลำดับความรู้พื้นฐานที่ต้องใช้'
              : 'Twenty phases stacked from math foundations up to autonomous swarms and production serving. Click any node to inspect its lessons.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={handleExport} className="bp-btn bp-btn--sm">
            <Download size={13} aria-hidden="true" />
            <span>{t('exportProgress')}</span>
          </button>
          <label className="bp-btn bp-btn--sm" style={{ cursor: 'pointer' }}>
            <Upload size={13} aria-hidden="true" />
            <span>{t('importProgress')}</span>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all local completion and quiz records?')) resetProgress();
            }}
            className="bp-btn bp-btn--sm"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>{t('resetProgress')}</span>
          </button>
        </div>
      </div>

      {importFeedback && (
        <div className="bp-chip bp-chip--blue" style={{ marginBottom: 16 }}>
          {importFeedback}
        </div>
      )}

      {/* Volume Progress Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        <div style={{ border: '1px solid var(--ink)', background: 'var(--bg-surface)', padding: 14 }}>
          <div className="fig-label">OVERALL PROGRESS</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--ink)' }}>
            {doneCount} / {totalLessons}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>
            {Math.round((doneCount / totalLessons) * 100)}% complete · ~{Math.round(totalHours)}h full manual
          </div>
        </div>
        {manifest?.volumes.map((v) => {
          const volLessons = manifest.phases
            .filter((p) => p.volume === v.num)
            .flatMap((p) => p.lessons);
          const volDone = volLessons.filter((l) => isCompleted(`${l.phaseDir}/${l.dirName}`)).length;
          return (
            <div
              key={v.num}
              style={{ border: '1px solid var(--rule-soft)', background: 'var(--bg-surface)', padding: 14 }}
            >
              <div className="fig-label">VOL {v.num}</div>
              <div style={{ fontWeight: 700, fontSize: '0.94rem', margin: '4px 0' }}>{v.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--blueprint)' }}>
                {volDone}/{volLessons.length} done
              </div>
            </div>
          );
        })}
      </div>

      {/* DAG + Phase Drawer Split */}
      <div className="roadmap-split">
        <div className="figure-card" style={{ margin: 0 }}>
          <div className="figure-head">
            <span className="left">FIG_DAG · PHASE DEPENDENCY GRAPH</span>
            <span className="right">CLICK ANY NODE</span>
          </div>
          <div className="figure-body" style={{ padding: 12 }}>
            <svg viewBox="0 0 980 920" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--blueprint)" />
                </marker>
              </defs>
              {manifest?.phases.map((p) =>
                p.dependencies.map((depNum) => {
                  const from = nodeMap.get(depNum);
                  const to = nodeMap.get(p.num);
                  if (!from || !to) return null;
                  const activeEdge = selectedPhase === p.num || selectedPhase === depNum;
                  const sameRow = Math.abs(from.y - to.y) < 10;
                  const x1 = sameRow ? from.x + 68 : from.x;
                  const y1 = sameRow ? from.y : from.y + 22;
                  const x2 = sameRow ? to.x - 68 : to.x;
                  const y2 = sameRow ? to.y : to.y - 22;
                  return (
                    <line
                      key={`${depNum}-${p.num}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={activeEdge ? 'var(--blueprint)' : 'var(--rule-soft)'}
                      strokeWidth={activeEdge ? 2.2 : 1.2}
                      markerEnd="url(#arrow)"
                    />
                  );
                }),
              )}

              {DAG_NODES.map((node) => {
                const ph = manifest?.phases.find((p) => p.num === node.num);
                const isSelected = selectedPhase === node.num;
                const isDep = currentPhase?.dependencies.includes(node.num);
                const isUnlock = ph?.dependencies.includes(selectedPhase);
                const done = ph
                  ? ph.lessons.filter((l) => isCompleted(`${ph.dirName}/${l.dirName}`)).length
                  : 0;

                return (
                  <g
                    key={node.num}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedPhase(node.num)}
                  >
                    <rect
                      x={node.x - 68}
                      y={node.y - 22}
                      width={136}
                      height={44}
                      fill={
                        isSelected
                          ? 'var(--blueprint)'
                          : isDep || isUnlock
                          ? 'var(--blueprint-tint-strong)'
                          : 'var(--bg-surface)'
                      }
                      stroke={isSelected ? 'var(--ink)' : 'var(--blueprint)'}
                      strokeWidth={isSelected ? 2 : 1.1}
                    />
                    <text
                      x={node.x}
                      y={node.y - 2}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize="11"
                      fontWeight="700"
                      fill={isSelected ? '#ffffff' : 'var(--ink)'}
                    >
                      {node.short}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 14}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                      fontSize="9.5"
                      fill={isSelected ? '#ffffff' : 'var(--ink-soft)'}
                    >
                      {done}/{ph?.lessonCount ?? 0} lessons
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Phase Lesson List */}
        {currentPhase && (
          <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', boxShadow: 'var(--shadow-hard)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--rule-soft)', background: 'var(--bg-surface)' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--ink)' }}>
                {String(currentPhase.num).padStart(2, '0')} · {lang === 'th' ? currentPhase.titleTh : currentPhase.title}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', marginTop: 4 }}>
                {lang === 'th' ? currentPhase.taglineTh : currentPhase.tagline}
              </p>
              <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--blueprint)' }}>
                VOL {currentPhase.volume} · ~{currentPhase.estimatedHours}H · {currentPhase.lessonCount} LESSONS
              </div>
              {currentPhase.dependencies.length > 0 && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--ink-mute)' }}>
                    PREREQUISITES:
                  </span>
                  {currentPhase.dependencies.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedPhase(d)}
                      className="bp-chip bp-chip--blue"
                      style={{ cursor: 'pointer' }}
                    >
                      Phase {String(d).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ maxHeight: '620px', overflowY: 'auto' }}>
              {currentPhase.lessons.map((l) => {
                const k = `${currentPhase.dirName}/${l.dirName}`;
                const done = isCompleted(k);
                return (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--rule-soft)',
                    }}
                  >
                    <Link
                      to={`/learn/${currentPhase.dirName}/${l.dirName}`}
                      style={{ color: 'var(--ink)', fontSize: '0.94rem', flex: 1 }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--blueprint)', marginRight: 8 }}>
                        {String(l.num).padStart(2, '0')}
                      </span>
                      {l.title}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleComplete(k)}
                      className={`bp-btn bp-btn--sm ${done ? 'bp-btn--primary' : ''}`}
                    >
                      <Check size={12} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
