import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lang, TranslationKey, UI_STRINGS } from '../i18n/translations';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('aiefs_lang');
      if (saved === 'th' || saved === 'en') return saved;
    } catch {
      // ignore storage errors
    }
    return 'en';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('aiefs_lang', lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  const setLang = (next: Lang) => setLangState(next);
  const toggleLang = () => setLangState((l) => (l === 'en' ? 'th' : 'en'));
  const t = (key: TranslationKey): string => UI_STRINGS[lang][key];

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
