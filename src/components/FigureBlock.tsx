import React, { useEffect, useRef, useState } from 'react';

interface FigureProvidersData {
  providers: Record<string, string[]>;
  order: string[];
}

declare global {
  interface Window {
    AIFS_FIGURE_PROVIDERS?: Record<string, string[]>;
    AIFS_FIGURE_PROVIDER_ORDER?: string[];
    AIFS_loadFigureProviders?: (root?: HTMLElement | Document) => Promise<string[]>;
    mountLessonFigures?: (root?: HTMLElement | Document) => void;
    AIFSFigureRuntime?: {
      disposeRoot?: (root: HTMLElement) => void;
    };
  }
}

let runtimePromise: Promise<FigureProvidersData | null> | null = null;

function ensureFigureRuntime(): Promise<FigureProvidersData | null> {
  if (runtimePromise) return runtimePromise;
  runtimePromise = (async () => {
    try {
      const dataRes = await fetch('/data/figure-providers.json');
      if (!dataRes.ok) return null;
      const figData = (await dataRes.json()) as FigureProvidersData;
      window.AIFS_FIGURE_PROVIDERS = figData.providers;
      window.AIFS_FIGURE_PROVIDER_ORDER = figData.order;

      await new Promise<void>((resolve, reject) => {
        if (window.mountLessonFigures && window.AIFS_loadFigureProviders) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = '/upstream-figures/lesson-figures.js';
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load lesson-figures.js'));
        document.head.appendChild(script);
      });

      return figData;
    } catch {
      return null;
    }
  })();
  return runtimePromise;
}

interface FigureBlockProps {
  spec: string;
}

export const FigureBlock: React.FC<FigureBlockProps> = ({ spec }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const figureId = spec.trim().split(/\s+/)[0] || 'figure';
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let mounted = true;
    const container = hostRef.current;
    if (!container) return;

    ensureFigureRuntime().then(async (figData) => {
      if (!mounted || !container) return;
      if (!figData || !window.AIFS_loadFigureProviders || !window.mountLessonFigures) {
        setStatus('missing');
        return;
      }
      try {
        await window.AIFS_loadFigureProviders(container);
        if (!mounted) return;
        window.mountLessonFigures(container);
        const target = container.querySelector('.lesson-figure');
        if (target && target.getAttribute('data-figure-missing') === 'true') {
          setStatus('missing');
        } else {
          setStatus('ready');
        }
      } catch {
        if (mounted) setStatus('missing');
      }
    });

    return () => {
      mounted = false;
      if (container && window.AIFSFigureRuntime?.disposeRoot) {
        try {
          window.AIFSFigureRuntime.disposeRoot(container);
        } catch {
          // ignore cleanup failure
        }
      }
    };
  }, [spec]);

  return (
    <div ref={hostRef}>
      <div className="lesson-figure" data-figure={spec.trim()} />
      {status === 'loading' && (
        <div className="figure-card">
          <div className="figure-head">
            <span className="left">FIG · {figureId.toUpperCase()}</span>
            <span className="right">LOADING INTERACTIVE FIGURE...</span>
          </div>
        </div>
      )}
      {status === 'missing' && (
        <div className="figure-card">
          <div className="figure-head">
            <span className="left">FIG · {figureId.toUpperCase()}</span>
            <span className="right">SCHEMATIC REFERENCE</span>
          </div>
          <div className="figure-body" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
            Interactive figure spec: <code>{spec.trim()}</code>
          </div>
        </div>
      )}
    </div>
  );
};
