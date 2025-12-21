import React from 'react';
import { useI18n, Language } from '@app/providers/i18n/i18n';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
      {(['uk', 'en'] as Language[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
            lang === l
              ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
};
