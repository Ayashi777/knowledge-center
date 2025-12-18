import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from './translations';

export type Language = 'uk'; // Locked to Ukrainian for now

type I18nContextType = {
  lang: Language;
  t: (key: string, options?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const resolveKey = (obj: any, key: string): string => {
  return key.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') return acc[part];
    return undefined;
  }, obj);
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang] = useState<Language>('uk');

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    let text = resolveKey(translations[lang], key);

    if (!text) {
        // Fallback to English only if key exists there, otherwise return key name
        text = resolveKey((translations as any).en, key) || key;
    }
    
    if (options && typeof text === 'string') {
      Object.entries(options).forEach(([k, v]) => {
        const regex = new RegExp(`{${k}}`, 'g');
        text = text.replace(regex, String(v));
      });
    }

    return text;
  }, [lang]);
  
  return (
    <I18nContext.Provider value={{ lang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};
