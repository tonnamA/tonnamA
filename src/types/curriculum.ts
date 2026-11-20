export interface VolumeMeta {
  num: number;
  id: string;
  title: string;
  titleTh: string;
  subtitle: string;
  subtitleTh: string;
  phases: number[];
  epub: string;
  pdf: string;
}

export interface LessonStub {
  num: number;
  dirName: string;
  slug: string;
  phaseNum: number;
  phaseDir: string;
  phaseSlug: string;
  phaseTitle: string;
  phaseTitleTh: string;
  path: string;
  title: string;
  motto: string;
  type: 'Build' | 'Learn';
  languages: string[];
  timeMinutes: number;
  hasQuiz: boolean;
  quizCount: number;
  codeFileCount: number;
  outputCount: number;
  hasMission: boolean;
  track: string | null;
}

export interface PhaseMeta {
  num: number;
  dirName: string;
  slug: string;
  title: string;
  titleTh: string;
  tagline: string;
  taglineTh: string;
  volume: number;
  dependencies: number[];
  lessonCount: number;
  estimatedHours: number;
  lessons: LessonStub[];
}

export interface ManifestTotals {
  phases: number;
  lessons: number;
  codeFiles: number;
  quizzes: number;
  skills: number;
  prompts: number;
  agents: number;
  outputs: number;
  projects: number;
  learningPaths: number;
  glossaryTerms: number;
  cheatsheets: number;
  practiceProblems: number;
  interviewQuestions: number;
  figureCount: number;
}

export interface ManifestData {
  schemaVersion: number;
  repoUrl: string;
  totals: ManifestTotals;
  volumes: VolumeMeta[];
  phases: PhaseMeta[];
}

export interface LessonHeading {
  level: number;
  text: string;
  id: string;
}

export interface CodeFileEntry {
  name: string;
  language: string;
  content: string;
  truncated: boolean;
  lines: number;
}

export interface QuizQuestion {
  id: string;
  stage: 'pre' | 'check' | 'post';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ArtifactEntry {
  id: string;
  type: 'skill' | 'prompt' | 'agent' | 'mcp';
  name: string;
  description: string;
  version: string;
  tags: string[];
  filename: string;
  phaseNum: number;
  lessonNum: number;
  phaseDir: string;
  lessonDir: string;
  frontmatter: Record<string, unknown>;
  body: string;
  raw: string;
  truncated: boolean;
}

export interface LessonPointer {
  phaseDir: string;
  dirName: string;
  title: string;
  phaseNum: number;
  num: number;
}

export interface LessonDetail extends LessonStub {
  prerequisites: string;
  timeStr: string;
  headings: LessonHeading[];
  docsMarkdown: string;
  missionMarkdown: string | null;
  codeFiles: CodeFileEntry[];
  quiz: QuizQuestion[];
  outputs: ArtifactEntry[];
  githubUrl: string;
  prev: LessonPointer | null;
  next: LessonPointer | null;
}

export interface SearchItem {
  kind: 'phase' | 'lesson' | 'glossary' | 'skill' | 'project' | 'cheatsheet';
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  route: string;
}

export interface LearningPathEntry {
  id: string;
  kind?: string;
  title: string;
  summary: string;
  estimatedMinutes?: number;
  workFamily?: string;
  commonTitles?: string[];
  mission?: string;
  quickStart?: {
    lessonPath?: string;
    goal?: string;
    installCommand?: string;
  };
  lessons: Array<{
    order?: number;
    path: string;
    title?: string;
    minutes?: number;
    required?: boolean;
    group?: string;
  }>;
  stages?: Array<{
    id: string;
    title: string;
    outcome: string;
    lessonPaths: string[];
    artifact?: string;
  }>;
}

export interface ProjectEntry {
  id: string;
  title: string;
  level: number;
  levelName: string;
  tagline: string;
  summary: string;
  youWillBuild: string;
  usefulFor: string[];
  hours: number;
  languages: string[];
  status: string;
  stages: Array<{
    id: string;
    title: string;
    summary: string;
    hours?: number;
    difficulty?: string;
    language?: string;
    concepts?: string[];
  }>;
  prerequisites: unknown[];
  readmeMarkdown: string;
  starterFiles: Array<{ name: string; language: string; content: string; truncated: boolean }>;
  solutionFiles: Array<{ name: string; language: string; content: string; truncated: boolean }>;
  githubUrl: string;
}

export interface GlossaryEntry {
  term: string;
  letter: string;
  slug: string;
  category: string;
  whatPeopleSay: string;
  meaning: string;
  confusion: string;
  inPractice: string;
  learnLink: string;
  related: string[];
}

export interface CheatsheetEntry {
  id: string;
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  sources: string[];
  markdown: string;
}

export interface CertificationTrack {
  id: string;
  slug: string;
  examCode: string;
  credential: string;
  shortName: string;
  level: string;
  badge?: string;
  summary: string;
  audience?: string;
  recommendedExperience?: string;
  exam?: Record<string, unknown>;
  domains: Array<{ id: string; name: string; weight?: number; summary?: string }>;
  lessons: Array<{ path: string; title?: string; domains?: string[]; role?: string; required?: boolean }>;
  assessmentsData?: Record<string, { title: string; questionCount: number; questions: Array<Record<string, unknown>> }>;
}

export interface CertificationProgram {
  id: string;
  program: {
    id: string;
    name: string;
    shortName: string;
    provider: string;
    summary: string;
    promise: string;
    accessNoticeTitle?: string;
    accessNotice?: string;
    disclaimer?: string;
  };
  readmeMarkdown: string;
  gettingStartedMarkdown: string;
  tracks: CertificationTrack[];
  lessons: Array<{ slug: string; title: string; docsMarkdown: string; quiz: QuizQuestion[] }>;
}

export interface PracticeData {
  collections: Array<{ id: string; title: string; summary: string }>;
  problems: Array<{
    id: string;
    title: string;
    collection: string;
    difficulty: string;
    minutes: number;
    summary: string;
    problemMarkdown: string;
    hintsMarkdown: string;
    starterCode: string;
    solutionCode: string;
  }>;
  interviews: Array<{
    id: string;
    title: string;
    category: string;
    kind: string;
    level: string;
    roles: string[];
    tags: string[];
    minutes: string;
    markdown: string;
  }>;
  manuals: Array<{
    id: string;
    title: string;
    summary: string;
    markdown: string;
    githubUrl: string;
  }>;
}
