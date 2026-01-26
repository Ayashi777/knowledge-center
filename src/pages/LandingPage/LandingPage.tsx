import React, { useState } from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { ProjectsSection } from './ui/ProjectsSection';
import { ServicesTeaser } from './ui/ServicesTeaser';
import { DatabaseTeaser } from './ui/DatabaseTeaser';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onExploreClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onLoginClick, 
  onRegisterClick, 
  onExploreClick 
}) => {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = t('landing.faq.items', { returnObjects: true }) as { q: string, a: string }[];

  return (
    <div className="flex flex-col gap-0 pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-6 uppercase leading-[1.1]">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-4">
                <button 
                    onClick={onLoginClick}
                    className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25"
                >
                    {t('landing.hero.cta_login')}
                </button>
                <button 
                    onClick={onRegisterClick}
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg font-bold text-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
                >
                    {t('landing.hero.cta_register')}
                </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    {t('landing.hero.register_hint')}
                </p>
            </div>
            <button 
              onClick={onExploreClick}
              className="mt-8 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 mx-auto font-medium"
            >
              <span>{t('landing.hero.cta_guest')}</span>
              <Icon name="arrow-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Abstract background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
           <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px]"></div>
        </div>
      </section>

      {/* Brands/Trust Bar */}
      <section className="py-12 border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-8">
                {t('landing.brands.title')}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-80 dark:opacity-90 grayscale hover:grayscale-0 transition-all duration-700">
                {['ArmoPlit', 'Edilmodulo', 'Fixit', 'Typar', 'Freudenberg', 'SITA'].map(brand => (
                    <span key={brand} className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{brand}</span>
                ))}
            </div>
        </div>
      </section>

      {/* 2. For Whom Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white uppercase tracking-wider">
          {t('landing.for_whom.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { role: 'architect', icon: 'architecture' },
            { role: 'engineer', icon: 'engineering' },
            { role: 'builder', icon: 'construction' },
            { role: 'partner', icon: 'handshake' }
          ].map((item) => (
            <div key={item.role} className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/20 hover:border-blue-500 transition-all group text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Icon name={item.icon as any} className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {t(`landing.for_whom.${item.role}.title`)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                {t(`landing.for_whom.${item.role}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <DatabaseTeaser />
      <ServicesTeaser />
      <ProjectsSection />

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
        <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white uppercase tracking-wider">
          {t('landing.faq.title')}
        </h2>
        <div className="space-y-4">
            {faqItems.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <button 
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <span className="font-bold text-gray-900 dark:text-white">{item.q}</span>
                        <Icon 
                            name={openFaq === idx ? 'expand_less' : 'expand_more'} 
                            className={`w-6 h-6 text-blue-600 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} 
                        />
                    </button>
                    {openFaq === idx && (
                        <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed animate-fade-in text-sm">
                            {item.a}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
                    {t('landing.final_cta.title')}
                </h2>
                <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                    {t('landing.final_cta.subtitle')}
                </p>
                <button 
                    onClick={onRegisterClick}
                    className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl"
                >
                    {t('landing.final_cta.button')}
                </button>
            </div>
            <Icon name="groups" className="absolute -bottom-20 -left-20 w-96 h-96 text-white opacity-10 pointer-events-none" />
            <Icon name="rocket_launch" className="absolute -top-20 -right-20 w-64 h-64 text-white opacity-10 pointer-events-none" />
        </div>
      </section>
    </div>
  );
};
