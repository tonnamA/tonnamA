import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import hljs from 'highlight.js';
import { Link } from 'react-router-dom';
import { CopyButton } from './CopyButton';
import { MermaidBlock } from './MermaidBlock';
import { FigureBlock } from './FigureBlock';

function slugifyHeading(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[^a-zA-Z0-9\u0E00-\u0E7F\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (React.isValidElement(node)) {
    return extractText((node.props as { children?: React.ReactNode }).children);
  }
  return '';
}

function resolveRepoHref(href: string | undefined, currentPhaseDir?: string): { to?: string; external?: string } {
  if (!href) return {};
  if (href.startsWith('#')) return { to: href };
  if (href.startsWith('http://') || href.startsWith('https://')) {
    // Rewrite official site lesson URLs if needed, keep GitHub external
    if (href.includes('aiengineeringfromscratch.com/learn/')) {
      const m = href.match(/\/learn\/([^/?#]+)\/([^/?#]+)/);
      if (m) return { to: `/learn/${m[1]}/${m[2]}` };
    }
    return { external: href };
  }
  const clean = href.replace(/^\.\//, '');
  const phaseMatch = clean.match(/(?:\.\.\/)*phases\/([0-9]{2}-[^/]+)\/([0-9]{2}-[^/]+)/);
  if (phaseMatch) {
    return { to: `/learn/${phaseMatch[1]}/${phaseMatch[2]}` };
  }
  if (currentPhaseDir && clean.match(/^\.\.\/([0-9]{2}-[^/]+)/)) {
    const lm = clean.match(/^\.\.\/([0-9]{2}-[^/]+)/);
    if (lm) return { to: `/learn/${currentPhaseDir}/${lm[1]}` };
  }
  if (clean.includes('glossary/terms')) return { to: '/glossary' };
  if (clean.includes('learning-paths/')) return { to: '/learning-paths' };
  if (clean.includes('projects/')) return { to: '/projects' };
  if (clean.includes('certifications/')) return { to: '/certifications' };
  if (clean.includes('cheatsheets/')) return { to: '/cheatsheets' };
  return {
    external: `https://github.com/rohitg00/ai-engineering-from-scratch/blob/main/${clean.replace(/^(\.\.\/)+/, '')}`,
  };
}

interface LessonMarkdownProps {
  markdown: string;
  currentPhaseDir?: string;
  stripTitle?: boolean;
}

export const LessonMarkdown: React.FC<LessonMarkdownProps> = ({
  markdown,
  currentPhaseDir,
  stripTitle = false,
}) => {
  let prepared = stripTitle ? markdown.replace(/^#\s+[^\n]+\n+/, '') : markdown;
  if (stripTitle) {
    // Strip duplicated motto blockquote and top meta lines when LessonPage header already renders them
    prepared = prepared
      .replace(/^>\s+[^\n]+\n+/, '')
      .replace(/^(\*\*(?:Type|Languages?|Prerequisites?|Time):\*\*[^\n]*\n+)+/, '');
  }
  const headingSeen = new Map<string, number>();

  const nextHeadingId = (children: React.ReactNode) => {
    const base = slugifyHeading(extractText(children)) || 'section';
    const count = headingSeen.get(base) || 0;
    headingSeen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h2: ({ children }) => <h2 id={nextHeadingId(children)}>{children}</h2>,
          h3: ({ children }) => <h3 id={nextHeadingId(children)}>{children}</h3>,
          table: ({ children }) => (
            <div className="table-wrap">
              <table>{children}</table>
            </div>
          ),
          a: ({ href, children }) => {
            const resolved = resolveRepoHref(href, currentPhaseDir);
            if (resolved.to) {
              if (resolved.to.startsWith('#')) {
                return <a href={resolved.to}>{children}</a>;
              }
              return <Link to={resolved.to}>{children}</Link>;
            }
            return (
              <a href={resolved.external || href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...rest }) => {
            const rawCode = String(children).replace(/\n$/, '');
            const langMatch = /language-([^\s]+)/.exec(className || '');
            const lang = langMatch ? langMatch[1].toLowerCase() : '';
            const isBlock = Boolean(langMatch) || rawCode.includes('\n');

            if (!isBlock) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }

            if (lang === 'mermaid') {
              return <MermaidBlock chart={rawCode} />;
            }

            if (lang === 'figure') {
              return <FigureBlock spec={rawCode} />;
            }

            let highlighted = '';
            try {
              if (lang && hljs.getLanguage(lang)) {
                highlighted = hljs.highlight(rawCode, { language: lang }).value;
              } else {
                highlighted = hljs.highlightAuto(rawCode).value;
              }
            } catch {
              highlighted = '';
            }

            return (
              <div
                style={{
                  margin: '18px 0',
                  border: '1px solid var(--rule-soft)',
                  background: 'var(--code-bg)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '5px 12px',
                    borderBottom: '1px solid var(--rule-soft)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-mute)',
                  }}
                >
                  <span>{lang || 'code'}</span>
                  <CopyButton text={rawCode} />
                </div>
                <pre style={{ margin: 0, border: 0, padding: '14px 16px', overflowX: 'auto' }}>
                  {highlighted ? (
                    <code
                      className={`hljs ${lang ? `language-${lang}` : ''}`}
                      dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                  ) : (
                    <code>{rawCode}</code>
                  )}
                </pre>
              </div>
            );
          },
        }}
      >
        {prepared}
      </ReactMarkdown>
    </div>
  );
};
