import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface QuizScoreRecord {
  correct: number;
  total: number;
  updatedAt: string;
}

export interface ProgressState {
  completedLessons: string[];
  bookmarkedLessons: string[];
  quizScores: Record<string, QuizScoreRecord>;
  lastVisited: string | null;
}

const STORAGE_KEY = 'aiefs_progress_v1';

const EMPTY_STATE: ProgressState = {
  completedLessons: [],
  bookmarkedLessons: [],
  quizScores: {},
  lastVisited: null,
};

interface ProgressContextValue {
  state: ProgressState;
  isCompleted: (lessonKey: string) => boolean;
  isBookmarked: (lessonKey: string) => boolean;
  toggleComplete: (lessonKey: string) => void;
  markComplete: (lessonKey: string, done?: boolean) => void;
  toggleBookmark: (lessonKey: string) => void;
  recordQuizScore: (lessonKey: string, correct: number, total: number) => void;
  setLastVisited: (lessonKey: string) => void;
  resetProgress: () => void;
  exportProgressJson: () => string;
  importProgressJson: (raw: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgressState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProgressState>;
        return {
          completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
          bookmarkedLessons: Array.isArray(parsed.bookmarkedLessons) ? parsed.bookmarkedLessons : [],
          quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
          lastVisited: typeof parsed.lastVisited === 'string' ? parsed.lastVisited : null,
        };
      }
    } catch {
      // ignore invalid storage
    }
    return EMPTY_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
  }, [state]);

  const isCompleted = useCallback(
    (lessonKey: string) => state.completedLessons.includes(lessonKey),
    [state.completedLessons],
  );

  const isBookmarked = useCallback(
    (lessonKey: string) => state.bookmarkedLessons.includes(lessonKey),
    [state.bookmarkedLessons],
  );

  const toggleComplete = useCallback((lessonKey: string) => {
    setState((prev) => {
      const exists = prev.completedLessons.includes(lessonKey);
      return {
        ...prev,
        completedLessons: exists
          ? prev.completedLessons.filter((k) => k !== lessonKey)
          : [...prev.completedLessons, lessonKey],
      };
    });
  }, []);

  const markComplete = useCallback((lessonKey: string, done = true) => {
    setState((prev) => {
      const exists = prev.completedLessons.includes(lessonKey);
      if (done && !exists) {
        return { ...prev, completedLessons: [...prev.completedLessons, lessonKey] };
      }
      if (!done && exists) {
        return { ...prev, completedLessons: prev.completedLessons.filter((k) => k !== lessonKey) };
      }
      return prev;
    });
  }, []);

  const toggleBookmark = useCallback((lessonKey: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedLessons.includes(lessonKey);
      return {
        ...prev,
        bookmarkedLessons: exists
          ? prev.bookmarkedLessons.filter((k) => k !== lessonKey)
          : [...prev.bookmarkedLessons, lessonKey],
      };
    });
  }, []);

  const recordQuizScore = useCallback((lessonKey: string, correct: number, total: number) => {
    setState((prev) => ({
      ...prev,
      quizScores: {
        ...prev.quizScores,
        [lessonKey]: { correct, total, updatedAt: new Date().toISOString() },
      },
    }));
  }, []);

  const setLastVisited = useCallback((lessonKey: string) => {
    setState((prev) => (prev.lastVisited === lessonKey ? prev : { ...prev, lastVisited: lessonKey }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(EMPTY_STATE);
  }, []);

  const exportProgressJson = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importProgressJson = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as Partial<ProgressState>;
      if (!Array.isArray(parsed.completedLessons)) return false;
      setState({
        completedLessons: parsed.completedLessons,
        bookmarkedLessons: Array.isArray(parsed.bookmarkedLessons) ? parsed.bookmarkedLessons : [],
        quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
        lastVisited: typeof parsed.lastVisited === 'string' ? parsed.lastVisited : null,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        state,
        isCompleted,
        isBookmarked,
        toggleComplete,
        markComplete,
        toggleBookmark,
        recordQuizScore,
        setLastVisited,
        resetProgress,
        exportProgressJson,
        importProgressJson,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
