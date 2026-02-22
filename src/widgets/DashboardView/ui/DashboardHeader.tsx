import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';

export const DashboardHeader: React.FC = () => {
    const { t } = useI18n();

    return (
        <header className="mb-12 text-center pt-16 sm:pt-12 animate-fade-in">
            <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter text-fg sm:text-6xl">
                {t('dashboard.title')}
            </h1>
            <p className="mx-auto mb-6 max-w-3xl text-xl font-bold leading-tight text-primary sm:text-2xl">
                {t('dashboard.subtitle')}
            </p>
            <p className="mx-auto max-w-2xl text-base italic leading-relaxed text-muted-fg sm:text-lg">
                {t('dashboard.description')}
            </p>
            <div className="mx-auto mt-10 h-px w-32 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
        </header>
    );
};
