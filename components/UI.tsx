import React from 'react';
import { Icon } from './icons';
import { useI18n } from '../i18n';

export const ThemeSwitcher: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const { t } = useI18n();
    return (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('header.toggleTheme')}
    >
        {theme === 'light' ? <Icon name="moon" className="w-6 h-6" /> : <Icon name="sun" className="w-6 h-6" />}
    </button>
)};

export const LanguageSwitcher: React.FC = () => {
    const { lang, setLang } = useI18n();
    
    return (
        <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
            <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${lang === 'en' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
                EN
            </button>
            <button
                onClick={() => setLang('uk')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${lang === 'uk' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
                UA
            </button>
        </div>
    );
};

export const EditableField: React.FC<{ label: string; value: string; onChange: (value: string) => void; multiline?: boolean; rows?: number; }> = ({ label, value, onChange, multiline = false, rows = 4 }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
        rows={rows}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
      />
    )}
  </div>
);
