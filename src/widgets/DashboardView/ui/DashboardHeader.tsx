import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';

export const DashboardHeader: React.FC = () => {
    const { t } = useI18n();

    return (
        <header className="mb-12 text-center pt-16 sm:pt-12 animate-fade-in">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-gray-900 dark:text-white mb-4 uppercase">
                {t('dashboard.title')}
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 max-w-3xl mx-auto leading-tight">
                {t('dashboard.subtitle')}
            </p>
            <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed italic">
                {t('dashboard.description')}
            </p>
            <div className="mt-10 h-px w-32 bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-900 to-transparent mx-auto"></div>
        </header>
    );
};
