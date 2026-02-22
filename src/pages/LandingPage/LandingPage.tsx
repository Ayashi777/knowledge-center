import React, { useState } from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';
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

  const faqItems = t('landing.faq.items', { returnObjects: true } as any) as unknown as { q: string; a: string }[];

  const sectors = [
    { key: 'industrial', icon: 'building-office' },
    { key: 'residential', icon: 'home-modern' },
    { key: 'commercial', icon: 'shopping-bag' },
    { key: 'infrastructure', icon: 'truck' },
    { key: 'renovation', icon: 'sparkles' },
    { key: 'energy', icon: 'globe-alt' },
  ];

  return (
    <div className="flex flex-col gap-0 pb-24">
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-black uppercase leading-[1.1] tracking-tight text-fg sm:text-6xl">
              {t('landing.hero.title')}
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-muted-fg sm:text-2xl">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-4">
                <Button
                    onClick={onLoginClick}
                    className="h-12 rounded-lg px-8 text-lg font-bold"
                >
                    {t('landing.hero.cta_login')}
                </Button>
                <Button
                    onClick={onRegisterClick}
                    variant="outline"
                    className="h-12 rounded-lg border-2 px-8 text-lg font-bold text-primary"
                >
                    {t('landing.hero.cta_register')}
                </Button>
                </div>
                <p className="text-xs italic text-muted-fg">
                    {t('landing.hero.register_hint')}
                </p>
            </div>
            <Button
              onClick={onExploreClick}
              variant="ghost"
              className="mx-auto mt-8 h-auto gap-2 p-0 font-medium text-muted-fg hover:text-primary"
            >
              <span>{t('landing.hero.cta_guest')}</span>
              <Icon name="chevron-right" className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
           <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary blur-[120px]"></div>
           <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent blur-[150px]"></div>
        </div>
      </section>

      {/* 2. For Whom Section (Moved UP) */}
      <section id="for-whom-section" className="mx-auto w-full max-w-7xl border-t border-border px-4 py-24 sm:px-6 lg:px-8">
        <h2 className="mb-16 text-center text-3xl font-bold uppercase tracking-wider text-fg">
          {t('landing.for_whom.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { role: 'architect', icon: 'architecture' },
            { role: 'engineer', icon: 'engineering' },
            { role: 'builder', icon: 'construction' },
            { role: 'partner', icon: 'handshake' }
          ].map((item) => (
            <Card key={item.role} className="group rounded-2xl border-border bg-surface p-8 text-center transition-all hover:border-primary/40">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                <Icon name={item.icon as any} className="w-8 h-8" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-fg">
                {t(`landing.for_whom.${item.role}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-fg">
                {t(`landing.for_whom.${item.role}.desc`)}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Construction Sectors Section (Moved DOWN) */}
      <section className="border-y border-border bg-surface py-24">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="mb-4 text-xs font-black uppercase tracking-[0.4em] text-primary">
                    {t('landing.sectors.title')}
                </h2>
                <p className="px-4 text-xl font-bold leading-relaxed text-fg md:text-2xl">
                    {t('landing.sectors.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-12 gap-x-6">
                {sectors.map((item) => (
                    <div key={item.key} className="flex flex-col items-center text-center group cursor-default">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-muted text-muted-fg shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-primary group-hover:text-primary-fg group-hover:shadow-soft md:h-28 md:w-28">
                            <Icon name={item.icon as any} className="w-12 h-12 md:w-14 md:h-14" />
                        </div>
                        <span className="px-2 text-[10px] font-black uppercase leading-tight tracking-widest text-muted-fg transition-colors group-hover:text-fg md:text-xs">
                            {t(`landing.sectors.${item.key}`)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </section>

      <DatabaseTeaser />
      
      <div id="tech-team-section">
        <ServicesTeaser />
      </div>

      <ProjectsSection />

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
        <h2 className="mb-16 text-center text-3xl font-bold uppercase tracking-wider text-fg">
          {t('landing.faq.title')}
        </h2>
        <div className="space-y-4">
            {faqItems.map((item, idx) => (
                <Card key={idx} className="overflow-hidden rounded-2xl border-border bg-surface shadow-sm">
                    <Button
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        variant="ghost"
                        className="h-auto w-full justify-between gap-4 rounded-none p-6 text-left hover:bg-muted/40"
                    >
                        <span className="font-bold text-fg">{item.q}</span>
                        <Icon 
                            name={openFaq === idx ? 'chevron-up' : 'chevron-down'} 
                            className={`w-6 h-6 text-primary transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                        />
                    </Button>
                    {openFaq === idx && (
                        <div className="animate-fade-in px-6 pb-6 text-sm leading-relaxed text-muted-fg">
                            {item.a}
                        </div>
                    )}
                </Card>
            ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="relative overflow-hidden rounded-[3rem] border-primary/30 bg-primary p-12 text-center text-primary-fg md:p-24">
            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter">
                    {t('landing.final_cta.title')}
                </h2>
                <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-primary-fg/80">
                    {t('landing.final_cta.subtitle')}
                </p>
                <Button
                    onClick={onRegisterClick}
                    variant="outline"
                    className="h-12 rounded-2xl border-primary-fg/40 bg-surface px-10 font-black uppercase tracking-widest text-primary"
                >
                    {t('landing.final_cta.button')}
                </Button>
            </div>
            <Icon name="users" className="absolute -bottom-20 -left-20 w-96 h-96 text-white opacity-10 pointer-events-none" />
            <Icon name="plus" className="absolute -top-20 -right-20 w-64 h-64 text-white opacity-10 pointer-events-none" />
        </Card>
      </section>
    </div>
  );
};
