import React, { useEffect, useId, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface MermaidBlockProps {
  chart: string;
}

export const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const { theme } = useTheme();
  const uid = useId().replace(/:/g, '_');
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    import('mermaid')
      .then(async (mod) => {
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'base',
          themeVariables:
            theme === 'dark'
              ? {
                  background: '#0a0d1a',
                  primaryColor: '#131830',
                  primaryTextColor: '#e8e6dc',
                  primaryBorderColor: '#6b8eff',
                  lineColor: '#6b8eff',
                  secondaryColor: '#1b2244',
                  tertiaryColor: '#131830',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                }
              : {
                  background: '#fafaf5',
                  primaryColor: '#fafaf5',
                  primaryTextColor: '#1a1a1a',
                  primaryBorderColor: '#3553ff',
                  lineColor: '#3553ff',
                  secondaryColor: '#f3f1e8',
                  tertiaryColor: '#efece0',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                },
        });
        const cleanChart = chart.replace(/^%%\{init:[\s\S]*?\}%%\s*\n?/, '').trim();
        const { svg: rendered } = await mermaid.render(`mmd_${uid}_${theme}`, cleanChart);
        if (active) setSvg(rendered);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [chart, theme, uid]);

  if (failed || !svg) {
    return (
      <div className="figure-card">
        <div className="figure-head">
          <span className="left">SCHEMATIC · MERMAID</span>
          <span className="right">{failed ? 'SOURCE VIEW' : 'RENDERING...'}</span>
        </div>
        <pre style={{ margin: 0, border: 0 }}>{chart}</pre>
      </div>
    );
  }

  return (
    <div className="figure-card">
      <div className="figure-head">
        <span className="left">DIAGRAM · ARCHITECTURE</span>
        <span className="right">MERMAID</span>
      </div>
      <div
        className="figure-body"
        style={{ display: 'flex', justifyContent: 'center' }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
};
