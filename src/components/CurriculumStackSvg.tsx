import React, { useState } from 'react';
import { VolumeMeta, PhaseMeta } from '../types/curriculum';
import { useLang } from '../context/LangContext';

interface CurriculumStackSvgProps {
  volumes: VolumeMeta[];
  phases: PhaseMeta[];
  onSelectVolume?: (volNum: number) => void;
}

export const CurriculumStackSvg: React.FC<CurriculumStackSvgProps> = ({
  volumes,
  phases,
  onSelectVolume,
}) => {
  const { lang } = useLang();
  const [hoveredVol, setHoveredVol] = useState<number | null>(null);

  const ordered = [...volumes].sort((a, b) => b.num - a.num); // Vol 6 top -> Vol 1 bottom
  const activeVol = volumes.find((v) => v.num === hoveredVol) ?? volumes[0];
  const activePhases = phases.filter((p) => p.volume === activeVol?.num);
  const activeLessonCount = activePhases.reduce((acc, p) => acc + p.lessonCount, 0);

  return (
    <div className="figure-card" style={{ margin: 0 }}>
      <div className="figure-head">
        <span className="left">FIG_000.A · CURRICULUM STACK</span>
        <span className="right">VOL 1 → VOL 6</span>
      </div>
      <div className="figure-body" style={{ padding: '12px 16px' }}>
        <svg
          viewBox="0 0 460 226"
          role="img"
          aria-label="Six-volume curriculum isometric stack from Foundations to Production"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {ordered.map((vol, idx) => {
            const yBase = 34 + idx * 30;
            const isHover = hoveredVol === vol.num;
            const fillTop = isHover ? 'var(--blueprint-tint-strong)' : 'var(--blueprint-tint)';
            return (
              <g
                key={vol.num}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredVol(vol.num)}
                onMouseLeave={() => setHoveredVol(null)}
                onClick={() => onSelectVolume?.(vol.num)}
              >
                <polygon
                  points={`20,${yBase + 14} 115,${yBase - 4} 210,${yBase + 14} 115,${yBase + 32}`}
                  fill={fillTop}
                  stroke="var(--blueprint)"
                  strokeWidth={isHover ? 1.8 : 1.1}
                />
                <polygon
                  points={`20,${yBase + 14} 115,${yBase + 32} 115,${yBase + 40} 20,${yBase + 22}`}
                  fill="var(--blueprint-tint)"
                  stroke="var(--blueprint)"
                  strokeWidth={isHover ? 1.6 : 1.0}
                />
                <polygon
                  points={`115,${yBase + 32} 210,${yBase + 14} 210,${yBase + 22} 115,${yBase + 40}`}
                  fill="var(--blueprint-tint-strong)"
                  stroke="var(--blueprint)"
                  strokeWidth={isHover ? 1.6 : 1.0}
                />
                <line
                  x1="214"
                  y1={yBase + 15}
                  x2="232"
                  y2={yBase + 15}
                  stroke={isHover ? 'var(--blueprint)' : 'var(--rule-soft)'}
                  strokeDasharray="2 2"
                />
                <text
                  x="240"
                  y={yBase + 18}
                  fontFamily="var(--font-mono)"
                  fontSize="10.5"
                  fontWeight={isHover ? '700' : '500'}
                  fill={isHover ? 'var(--blueprint)' : 'var(--ink)'}
                >
                  {`VOL ${vol.num} · ${vol.title.toUpperCase()}`}
                </text>
              </g>
            );
          })}
        </svg>
        {activeVol && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid var(--rule-soft)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--ink-soft)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span>
              <strong style={{ color: 'var(--blueprint)' }}>
                {lang === 'th' ? activeVol.titleTh : `VOL ${activeVol.num}: ${activeVol.title}`}
              </strong>{' '}
              — {lang === 'th' ? activeVol.subtitleTh : activeVol.subtitle}
            </span>
            <span>
              {activePhases.length} phases · {activeLessonCount} lessons
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
