import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './config'; // Import i18n configuration
import { Language } from '@shared/types';

export type { Language };

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string | undefined | null, options?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t: i18nT, i18n } = useTranslation();

  const setLang = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
  }, [i18n]);

  const t = useCallback((key: string | undefined | null, options?: Record<string, string | number>): string => {
    if (!key) return '';
    return i18nT(key, options);
  }, [i18nT]);
  
  return (
    <I18nContext.Provider value={{ lang: i18n.language as Language, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};
