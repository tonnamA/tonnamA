import React, { useMemo, useState } from 'react';
import hljs from 'highlight.js';
import { Download } from 'lucide-react';
import { CodeFileEntry } from '../types/curriculum';
import { CopyButton } from './CopyButton';

interface CodeWorkbenchProps {
  files: CodeFileEntry[];
}

export const CodeWorkbench: React.FC<CodeWorkbenchProps> = ({ files }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = files[selectedIdx] ?? files[0];

  const highlightedLines = useMemo(() => {
    if (!current) return [];
    let html = current.content;
    try {
      if (current.language && hljs.getLanguage(current.language)) {
        html = hljs.highlight(current.content, { language: current.language }).value;
      } else {
        html = hljs.highlightAuto(current.content).value;
      }
    } catch {
      // plain fallback
    }
    return html.split('\n');
  }, [current]);

  if (!files.length) {
    return (
      <div
        style={{
          padding: 24,
          border: '1px solid var(--rule-soft)',
          background: 'var(--bg-surface)',
          color: 'var(--ink-soft)',
        }}
      >
        This conceptual lesson has no code files under <code>code/</code>.
      </div>
    );
  }

  const handleDownload = () => {
    if (!current) return;
    const blob = new Blob([current.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.name.split('/').pop() || 'lesson-code.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ border: '1px solid var(--ink)', background: 'var(--bg)' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          padding: '8px 10px',
          borderBottom: '1px solid var(--rule-soft)',
          background: 'var(--bg-surface)',
        }}
      >
        {files.map((f, idx) => (
          <button
            key={f.name}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`bp-btn bp-btn--sm ${idx === selectedIdx ? 'bp-btn--active' : ''}`}
            style={{ textTransform: 'none' }}
          >
            <span>{f.name}</span>
            <span style={{ opacity: 0.65 }}>({f.lines}L)</span>
          </button>
        ))}
      </div>

      {current && (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 8,
              padding: '8px 14px',
              borderBottom: '1px solid var(--rule-soft)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: 'var(--ink-soft)',
            }}
          >
            <span>
              {current.name} · <strong>{current.language.toUpperCase()}</strong> · {current.lines} lines
              {current.truncated ? ' (truncated to 120 KB)' : ''}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={handleDownload} className="copy-chip">
                <Download size={12} aria-hidden="true" />
                <span>download</span>
              </button>
              <CopyButton text={current.content} />
            </div>
          </div>

          <div
            style={{
              background: 'var(--code-bg)',
              overflowX: 'auto',
              maxHeight: '68vh',
              padding: '12px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              lineHeight: 1.55,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {highlightedLines.map((lineHtml, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        width: '3.2rem',
                        textAlign: 'right',
                        padding: '0 12px',
                        color: 'var(--ink-mute)',
                        userSelect: 'none',
                        borderRight: '1px solid var(--rule-soft)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {i + 1}
                    </td>
                    <td style={{ padding: '0 16px', whiteSpace: 'pre' }}>
                      <span dangerouslySetInnerHTML={{ __html: lineHtml || ' ' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
