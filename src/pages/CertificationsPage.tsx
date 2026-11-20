import React, { useEffect, useState } from 'react';
import { CertificationProgram, CertificationTrack } from '../types/curriculum';
import { useLang } from '../context/LangContext';
import { LessonMarkdown } from '../components/LessonMarkdown';

interface CertPayload {
  overviewMarkdown: string;
  programs: CertificationProgram[];
}

export const CertificationsPage: React.FC = () => {
  const { lang } = useLang();
  const [data, setData] = useState<CertPayload | null>(null);
  const [progId, setProgId] = useState('claude');
  const [selectedTrackSlug, setSelectedTrackSlug] = useState<string>('');
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    fetch('/data/certifications.json')
      .then((r) => r.json() as Promise<CertPayload>)
      .then((d) => {
        setData(d);
        const firstTrack = d.programs[0]?.tracks[0];
        if (firstTrack) setSelectedTrackSlug(firstTrack.slug || firstTrack.id);
      });
  }, []);

  if (!data) {
    return (
      <div className="page-shell container">
        <p style={{ fontFamily: 'var(--font-mono)' }}>Loading certification curricula...</p>
      </div>
    );
  }

  const program = data.programs.find((p) => p.id === progId) ?? data.programs[0];
  const track: CertificationTrack | undefined =
    program?.tracks.find((t) => (t.slug || t.id) === selectedTrackSlug) ?? program?.tracks[0];

  const diagnosticObj = track?.assessmentsData
    ? track.assessmentsData.diagnostic || Object.values(track.assessmentsData)[0]
    : undefined;

  return (
    <div className="page-shell container">
      <div className="bp-section-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)' }}>
            {lang === 'th' ? 'หลักสูตรเตรียมสอบใบรับรอง AI' : 'Certification Preparation'}
          </h1>
          <p className="bp-section-desc">
            {lang === 'th'
              ? 'รวมเส้นทางเตรียมสอบอ้างอิงตาม Blueprint จริงทั้งสาย Claude Certification (4 สาย) และ Model Context Protocol Associate (MCPA)'
              : 'Independent, open-source preparation curricula mapped to official Claude and MCPA exam domains.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {data.programs.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setProgId(p.id);
              const ft = p.tracks[0];
              if (ft) setSelectedTrackSlug(ft.slug || ft.id);
              setAnswers({});
            }}
            className={`bp-btn ${program.id === p.id ? 'bp-btn--primary' : ''}`}
          >
            {p.program.name}
          </button>
        ))}
      </div>

      {program && (
        <>
          <div
            style={{
              padding: 18,
              border: '1px solid var(--rule-soft)',
              background: 'var(--bg-surface)',
              marginBottom: 24,
            }}
          >
            <p style={{ marginBottom: 8 }}>
              <strong>{program.program.promise}</strong> — {program.program.summary}
            </p>
            {program.program.accessNotice && (
              <p style={{ fontSize: '0.86rem', color: 'var(--ink-soft)' }}>
                {program.program.accessNotice}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {program.tracks.map((tr) => {
              const key = tr.slug || tr.id;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedTrackSlug(key);
                    setAnswers({});
                  }}
                  className={`bp-btn bp-btn--sm ${
                    (track?.slug || track?.id) === key ? 'bp-btn--active' : ''
                  }`}
                >
                  {tr.examCode} · {tr.shortName}
                </button>
              );
            })}
          </div>

          {track && (
            <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)', padding: 24, marginBottom: 28 }}>
              <h2 style={{ fontSize: '2.1rem', color: 'var(--ink)', marginBottom: 10 }}>{track.credential}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                <span className="bp-chip bp-chip--blue">{track.examCode}</span>
                <span className="bp-chip">{track.level}</span>
                <span className="bp-chip">{track.lessons.length} Lessons</span>
                <span className="bp-chip">{track.domains.length} Domains</span>
              </div>
              <p style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>{track.summary}</p>

              <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 10 }}>Exam Blueprint Domains</h3>
              <div className="table-wrap" style={{ marginBottom: 24 }}>
                <table className="bp-table">
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Weight</th>
                      <th>Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {track.domains.map((d) => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 600 }}>{d.name}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>{d.weight ? `${d.weight}%` : '—'}</td>
                        <td style={{ color: 'var(--ink-soft)' }}>{d.summary || d.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {diagnosticObj && diagnosticObj.questions.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div className="fig-label" style={{ marginBottom: 12 }}>
                    SAMPLE PRACTICE DIAGNOSTIC ({diagnosticObj.title} · {diagnosticObj.questions.length} ITEMS)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {diagnosticObj.questions.slice(0, 5).map((q, qi) => {
                      const opts = (q.options as string[]) || [];
                      const correct = Number(q.correct ?? 0);
                      const chosen = answers[qi];
                      return (
                        <div key={qi} style={{ border: '1px solid var(--rule-soft)', padding: 14, background: 'var(--bg-surface)' }}>
                          <p style={{ fontWeight: 600, marginBottom: 10 }}>
                            {qi + 1}. {String(q.question || q.stem || '')}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {opts.map((o, oi) => (
                              <button
                                key={oi}
                                type="button"
                                disabled={chosen !== undefined}
                                onClick={() => setAnswers((p) => ({ ...p, [qi]: oi }))}
                                style={{
                                  textAlign: 'left',
                                  padding: '8px 12px',
                                  border: `1px solid ${
                                    chosen !== undefined && oi === correct
                                      ? 'var(--success)'
                                      : chosen === oi
                                      ? 'var(--danger)'
                                      : 'var(--rule-soft)'
                                  }`,
                                  background: 'var(--bg)',
                                  color: 'var(--ink)',
                                  cursor: chosen !== undefined ? 'default' : 'pointer',
                                }}
                              >
                                {String.fromCharCode(65 + oi)}. {o}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {program.readmeMarkdown && (
            <div style={{ border: '1px solid var(--rule-soft)', padding: 24, background: 'var(--bg)' }}>
              <LessonMarkdown markdown={program.readmeMarkdown} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
