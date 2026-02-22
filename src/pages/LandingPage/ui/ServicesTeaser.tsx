import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';

export const ServicesTeaser: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const handleChipClick = (_service: string) => {
        // In a real app, this could set a state in a form or navigate with a query param
        navigate('/services');
    };

    return (
        <section className="relative my-12 overflow-hidden rounded-[3rem] bg-muted/35 py-24">
            {/* Background Decorations */}
            <div className="pointer-events-none absolute right-0 top-0 opacity-5">
                <Icon name="calculate" className="w-96 h-96 -mr-20 -mt-20 transform rotate-12" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="mb-6 text-4xl font-black uppercase tracking-tight text-fg sm:text-5xl">
                        {t('landing.teaser.title')}
                    </h2>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-fg">
                        {t('landing.teaser.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {/* Card 1 */}
                    <Card className="group rounded-3xl border-border bg-surface p-8 transition-all hover:border-primary/40">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-all group-hover:bg-primary group-hover:text-primary-fg">
                            <Icon name="calculate" className="w-7 h-7" />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-fg">
                            {t('landing.teaser.cards.calc.title')}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-muted-fg">
                            {t('landing.teaser.cards.calc.desc')}
                        </p>
                        <Button
                            onClick={() => navigate('/services')}
                            variant="ghost"
                            className="h-auto gap-2 p-0 text-sm font-bold text-primary hover:gap-3"
                        >
                            <span>{t('landing.teaser.cards.calc.action')}</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </Button>
                    </Card>

                    {/* Card 2 */}
                    <Card className="group rounded-3xl border-border bg-surface p-8 transition-all hover:border-primary/40">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-all group-hover:bg-primary group-hover:text-primary-fg">
                            <Icon name="architecture" className="w-7 h-7" />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-fg">
                            {t('landing.teaser.cards.design.title')}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-muted-fg">
                            {t('landing.teaser.cards.design.desc')}
                        </p>
                        <Button
                            onClick={() => navigate('/services')}
                            variant="ghost"
                            className="h-auto gap-2 p-0 text-sm font-bold text-primary hover:gap-3"
                        >
                            <span>{t('landing.teaser.cards.design.action')}</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </Button>
                    </Card>

                    {/* Card 3 */}
                    <Card className="group rounded-3xl border-border bg-surface p-8 transition-all hover:border-primary/40">
                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary transition-all group-hover:bg-primary group-hover:text-primary-fg">
                            <Icon name="engineering" className="w-7 h-7" />
                        </div>
                        <h3 className="mb-4 text-2xl font-bold text-fg">
                            {t('landing.teaser.cards.onsite.title')}
                        </h3>
                        <p className="mb-8 text-sm leading-relaxed text-muted-fg">
                            {t('landing.teaser.cards.onsite.desc')}
                        </p>
                        <Button
                            onClick={() => navigate('/services')}
                            variant="ghost"
                            className="h-auto gap-2 p-0 text-sm font-bold text-primary hover:gap-3"
                        >
                            <span>{t('landing.teaser.cards.onsite.action')}</span>
                            <Icon name="arrow-right" className="w-4 h-4" />
                        </Button>
                    </Card>
                </div>

                <div className="text-center">
                    <p className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-fg">
                        {t('landing.teaser.chips_label')}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {(t('services.form.options', { returnObjects: true } as any) as unknown as string[]).map(opt => (
                            <Button
                                key={opt} 
                                onClick={() => handleChipClick(opt)}
                                variant="outline"
                                className="h-auto rounded-full px-5 py-2 text-sm font-bold text-fg hover:border-primary hover:text-primary"
                            >
                                {opt}
                            </Button>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <Button
                            onClick={() => navigate('/services')}
                            className="h-12 rounded-2xl px-10 font-black uppercase tracking-widest"
                        >
                            {t('landing.teaser.cta_all')}
                        </Button>
                        <p className="text-sm italic text-muted-fg">
                            {t('landing.teaser.cta_note')}
                        </p>
                        <div className="mt-4 rounded-full border border-success/30 bg-success/10 px-6 py-2 text-xs font-bold text-success">
                            {t('landing.teaser.stats')}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
