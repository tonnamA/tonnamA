import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import { useManifest } from '../context/ManifestContext';

interface SiteHeaderProps {
  onOpenSearch: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ onOpenSearch }) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const { manifest } = useManifest();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryLinks = [
    { to: '/#contents', label: t('navContents'), match: '/' },
    { to: '/catalog', label: t('navCatalog'), match: '/catalog' },
    { to: '/roadmap', label: t('navRoadmap'), match: '/roadmap' },
    { to: '/learning-paths', label: t('navPaths'), match: '/learning-paths' },
    { to: '/projects', label: t('navProjects'), match: '/projects' },
    { to: '/labs', label: t('navLabs'), match: '/labs' },
    { to: '/certifications', label: t('navCerts'), match: '/certifications' },
    { to: '/skills', label: t('navToolkit'), match: '/skills' },
    { to: '/glossary', label: t('navGlossary'), match: '/glossary' },
  ];

  const drawerLinks = [
    ...primaryLinks,
    { to: '/cheatsheets', label: t('navCheatsheets'), match: '/cheatsheets' },
    { to: '/practice', label: t('navPractice'), match: '/practice' },
    { to: '/assessment', label: t('navAssessment'), match: '/assessment' },
    { to: '/guide-th', label: t('navThaiGuide'), match: '/guide-th' },
  ];

  const isActive = (match: string) => {
    if (match === '/') return location.pathname === '/';
    return location.pathname.startsWith(match);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon" aria-hidden="true" />
          <span>AI / FROM SCRATCH</span>
        </Link>

        <nav className="header-priority-nav" aria-label="Primary Navigation">
          {primaryLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={isActive(item.match) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-tools">
          <a
            href={manifest?.repoUrl || 'https://github.com/rohitg00/ai-engineering-from-scratch'}
            target="_blank"
            rel="noopener noreferrer"
            className="header-github"
            aria-label="GitHub repository"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span className="gh-label">GitHub</span>
          </a>

          <button
            type="button"
            className="header-icon-btn"
            onClick={onOpenSearch}
            aria-label="Search curriculum (Cmd+K)"
            title="Search (⌘K)"
          >
            <Search size={14} aria-hidden="true" />
            <span className="header-kbd">⌘K</span>
          </button>

          <button
            type="button"
            className="lang-toggle-btn"
            onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
            aria-label="Switch language between English and Thai"
            title="Switch Language (EN / ไทย)"
          >
            <span style={{ color: lang === 'en' ? 'var(--blueprint)' : 'var(--ink-mute)' }}>EN</span>
            <span>/</span>
            <span style={{ color: lang === 'th' ? 'var(--blueprint)' : 'var(--ink-mute)' }}>ไทย</span>
          </button>

          <button
            type="button"
            className="header-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Day Blueprint' : 'Switch to Dark Night Blueprint'}
            title={theme === 'dark' ? 'Light Blueprint' : 'Dark Blueprint'}
          >
            {theme === 'dark' ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
          </button>

          <button
            type="button"
            className="header-menu-toggle"
            aria-expanded={menuOpen}
            aria-label="Toggle full navigation menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <nav className="header-drawer" aria-label="Full Site Index">
            {drawerLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(item.match) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span>{item.label}</span>
                <span style={{ color: 'var(--blueprint)' }}>→</span>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
