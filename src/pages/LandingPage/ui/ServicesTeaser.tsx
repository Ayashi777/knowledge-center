import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';

export const ServicesTeaser: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const handleChipClick = (service: string) => {
        // In a real app, this could set a state in a form or navigate with a query param
        navigate('/services');
    };

    return (
        <section className="py-24 bg-slate-50 dark:bg-gray-800/30 rounded-[3rem] my-12 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 opacity-5 dark:opacity-10 pointer-events-none">
                <Icon name="calculate" className="w-96 h-96 -mr-20 -mt-20 transform rotate-12" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                        {t('landing.teaser.title')}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        {t('landing.teaser.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 hover:border-blue-500 transition-all group">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Icon name="calculate" className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            {t('landing.teaser.cards.calc.title')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                            {t('landing.teaser.cards.calc.desc')}
                        </p>
                        <button 
                            onClick={() => navigate('/services')}
                            className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm"
                        >
                            <span>{t('landing.teaser.cards.calc.action')}</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 hover:border-blue-500 transition-all group">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Icon name="architecture" className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            {t('landing.teaser.cards.design.title')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                            {t('landing.teaser.cards.design.desc')}
                        </p>
                        <button 
                            onClick={() => navigate('/services')}
                            className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm"
                        >
                            <span>{t('landing.teaser.cards.design.action')}</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 hover:border-blue-500 transition-all group">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Icon name="engineering" className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            {t('landing.teaser.cards.onsite.title')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                            {t('landing.teaser.cards.onsite.desc')}
                        </p>
                        <button 
                            onClick={() => navigate('/services')}
                            className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:gap-3 transition-all text-sm"
                        >
                            <span>{t('landing.teaser.cards.onsite.action')}</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
                        {t('landing.teaser.chips_label')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {(t('services.form.options', { returnObjects: true }) as string[]).map(opt => (
                            <button 
                                key={opt} 
                                onClick={() => handleChipClick(opt)}
                                className="px-5 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-full text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <button 
                            onClick={() => navigate('/services')}
                            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25"
                        >
                            {t('landing.teaser.cta_all')}
                        </button>
                        <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                            {t('landing.teaser.cta_note')}
                        </p>
                        <div className="mt-4 px-6 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-900/30">
                            {t('landing.teaser.stats')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
