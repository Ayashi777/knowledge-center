import React from 'react';
import { useI18n, Language } from '@app/providers/i18n/i18n';
import { Button } from './primitives';

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-xl bg-muted p-1">
      {(['uk', 'en'] as Language[]).map((l) => (
        <Button
          key={l}
          onClick={() => setLang(l)}
          variant={lang === l ? 'outline' : 'ghost'}
          className={`h-auto rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-widest ${
            lang === l
              ? 'bg-surface text-primary shadow-sm'
              : 'text-muted-fg'
          }`}
        >
          {l}
        </Button>
      ))}
    </div>
  );
};
