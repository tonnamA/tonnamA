import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { SearchItem } from '../types/curriculum';
import { useLang } from '../context/LangContext';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const KINDS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'lesson', label: 'Lessons' },
  { id: 'phase', label: 'Phases' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'skill', label: 'Toolkit' },
  { id: 'project', label: 'Projects' },
  { id: 'cheatsheet', label: 'Cheatsheets' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  const { t } = useLang();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    if (!items) {
      fetch('/data/search-index.json')
        .then((r) => r.json() as Promise<SearchItem[]>)
        .then((data) => setItems(data))
        .catch(() => setItems([]));
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [open, items]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const pool = kindFilter === 'all' ? items : items.filter((it) => it.kind === kindFilter);
    if (!tokens.length) return pool.slice(0, 40);
    const matches: SearchItem[] = [];
    for (const it of pool) {
      const hay = `${it.title} ${it.subtitle} ${it.meta}`.toLowerCase();
      if (tokens.every((tok) => hay.includes(tok))) {
        matches.push(it);
        if (matches.length >= 60) break;
      }
    }
    return matches;
  }, [items, query, kindFilter]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, kindFilter]);

  const selectItem = (item: SearchItem) => {
    onClose();
    navigate(item.route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      selectItem(filtered[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="cmd-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Global curriculum search"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="cmd-panel">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderBottom: '1px solid var(--rule-soft)',
          }}
        >
          <Search size={16} style={{ color: 'var(--blueprint)', flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            style={{
              flex: 1,
              border: 0,
              background: 'transparent',
              color: 'var(--ink)',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            style={{
              border: '1px solid var(--rule-soft)',
              background: 'transparent',
              color: 'var(--ink-soft)',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            padding: '8px 14px',
            borderBottom: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
          }}
        >
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKindFilter(k.id)}
              className={`bp-btn bp-btn--sm ${kindFilter === k.id ? 'bp-btn--active' : ''}`}
            >
              {k.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {!items ? (
            <div style={{ padding: 24, fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--ink-mute)' }}>
              Loading search index...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, color: 'var(--ink-mute)' }}>{t('noItemsMatch')}</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={`${item.kind}-${item.id}`}
                type="button"
                onClick={() => selectItem(item)}
                onMouseEnter={() => setActiveIndex(idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 16px',
                  border: 0,
                  borderBottom: '1px solid var(--rule-soft)',
                  background: idx === activeIndex ? 'var(--blueprint-tint)' : 'transparent',
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                  gap: '6px 12px',
                  alignItems: 'center',
                }}
              >
                <span className="bp-chip bp-chip--blue">{item.kind}</span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      fontSize: '0.96rem',
                    }}
                  >
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--ink-soft)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.subtitle}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: 'var(--ink-mute)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.meta}
                </span>
              </button>
            ))
          )}
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderTop: '1px solid var(--rule-soft)',
            background: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            color: 'var(--ink-mute)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          <span>↑↓ Navigate · ↵ Open · Esc Close</span>
          <span>{filtered.length} shown</span>
        </div>
      </div>
    </div>
  );
};
