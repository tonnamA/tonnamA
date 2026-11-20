import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider } from './context/LangContext';
import { ProgressProvider } from './context/ProgressContext';
import { ManifestProvider } from './context/ManifestContext';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { CommandPalette } from './components/CommandPalette';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { CatalogPage } from './pages/CatalogPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LearningPathsPage } from './pages/LearningPathsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { LabsPage } from './pages/LabsPage';
import { CertificationsPage } from './pages/CertificationsPage';
import { ToolkitPage } from './pages/ToolkitPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { CheatsheetsPage } from './pages/CheatsheetsPage';
import { PracticePage } from './pages/PracticePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ThaiGuidePage } from './pages/ThaiGuidePage';

const ScrollAndHashHandler: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

const AppShell: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollAndHashHandler />
      <SiteHeader onOpenSearch={() => setSearchOpen(true)} />
      <main id="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<Navigate to="/learn/00-setup-and-tooling/01-dev-environment" replace />} />
          <Route path="/learn/:phaseSlug/:lessonSlug" element={<LessonPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/learning-paths" element={<LearningPathsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectsPage />} />
          <Route path="/labs" element={<LabsPage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/skills" element={<ToolkitPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/cheatsheets" element={<CheatsheetsPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/guide-th" element={<ThaiGuidePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <SiteFooter />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LangProvider>
        <ProgressProvider>
          <ManifestProvider>
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          </ManifestProvider>
        </ProgressProvider>
      </LangProvider>
    </ThemeProvider>
  );
};
