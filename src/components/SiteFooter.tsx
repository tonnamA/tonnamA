import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { CopyButton } from './CopyButton';

export const SiteFooter: React.FC = () => {
  const { t } = useLang();
  const cloneCmd = 'git clone https://github.com/rohitg00/ai-engineering-from-scratch.git';

  return (
    <>
      <section className="colophon container">
        <div className="colophon-grid">
          <div className="fig-label">{t('colophonEyebrow')}</div>
          <div>
            <p>{t('colophonDesc')}</p>
            <div className="colophon-cmd">
              <code>{cloneCmd}</code>
              <CopyButton text={cloneCmd} />
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <p>© 2026 · AI ENGINEERING FROM SCRATCH · MIT OPEN SOURCE</p>
          <div className="footer-links">
            <a
              href="https://github.com/rohitg00/ai-engineering-from-scratch"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <Link to="/catalog">{t('navCatalog')}</Link>
            <Link to="/roadmap">{t('navRoadmap')}</Link>
            <Link to="/learning-paths">{t('navPaths')}</Link>
            <Link to="/projects">{t('navProjects')}</Link>
            <Link to="/labs">{t('navLabs')}</Link>
            <Link to="/certifications">{t('navCerts')}</Link>
            <Link to="/skills">{t('navToolkit')}</Link>
            <Link to="/cheatsheets">{t('navCheatsheets')}</Link>
            <Link to="/practice">{t('navPractice')}</Link>
            <Link to="/glossary">{t('navGlossary')}</Link>
            <Link to="/assessment">{t('navAssessment')}</Link>
            <Link to="/guide-th">{t('navThaiGuide')}</Link>
          </div>
        </div>
      </footer>
    </>
  );
};
