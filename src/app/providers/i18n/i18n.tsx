import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from './translations';
import { Language } from '@shared/types';

export type { Language };

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string | undefined | null, options?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const resolveKey = (obj: any, key: string): string => {
  if (!key) return '';
  try {
    return key.split('.').reduce((acc, part) => {
        if (acc && typeof acc === 'object') return acc[part];
        return undefined;
    }, obj);
  } catch (e) {
    return key;
  }
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('uk');

  const t = useCallback((key: string | undefined | null, options?: Record<string, string | number>): string => {
    if (!key) return '';
    
    let text = resolveKey(translations[lang as keyof typeof translations], key);

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
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};
