import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';

export const DatabaseTeaser: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const categories = [
        { key: 'bim', icon: 'layers', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
        { key: 'dwg', icon: 'architecture', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
        { key: 'certs', icon: 'verified_user', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
        { key: 'guides', icon: 'menu_book', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
    ];

    return (
        <section className="py-24 bg-white dark:bg-gray-900 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-tight">
                            {t('landing.db_teaser.title')}
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                            {t('landing.db_teaser.subtitle')}
                        </p>

                        <div className="mb-10">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">
                                {t('landing.db_teaser.search_label')}
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                {(t('landing.db_teaser.tags', { returnObjects: true }) as string[]).map(tag => (
                                    <span key={tag} className="px-4 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-bold border border-gray-100 dark:border-gray-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/database')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-xl"
                        >
                            <Icon name="storage" className="w-5 h-5" />
                            {t('landing.db_teaser.cta')}
                        </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {categories.map((cat) => (
                            <div 
                                key={cat.key}
                                className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-transparent hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5 group"
                            >
                                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon name={cat.icon as any} className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {t(`landing.db_teaser.cards.${cat.key}.title`)}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {t(`landing.db_teaser.cards.${cat.key}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Aesthetic Background Grid */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>
        </section>
    );
};
