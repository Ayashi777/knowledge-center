import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';

export const DatabaseTeaser: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();

    const categories = [
        { key: 'bim', icon: 'layers', color: 'text-primary bg-primary/15' },
        { key: 'dwg', icon: 'architecture', color: 'text-accent bg-accent/15' },
        { key: 'certs', icon: 'verified_user', color: 'text-success bg-success/15' },
        { key: 'guides', icon: 'menu_book', color: 'text-warning bg-warning/15' },
    ];

    return (
        <section className="relative overflow-hidden bg-surface py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 text-center lg:text-left">
                        <h2 className="mb-6 text-4xl font-black uppercase tracking-tight leading-tight text-fg sm:text-5xl">
                            {t('landing.db_teaser.title')}
                        </h2>
                        <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-muted-fg lg:mx-0">
                            {t('landing.db_teaser.subtitle')}
                        </p>

                        <div className="mb-10">
                            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-muted-fg">
                                {t('landing.db_teaser.search_label')}
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                {(t('landing.db_teaser.tags', { returnObjects: true } as any) as unknown as string[]).map(tag => (
                                    <span key={tag} className="rounded-lg border border-border bg-muted/40 px-4 py-1.5 text-sm font-bold text-muted-fg">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/database')}
                            className="h-12 gap-3 rounded-2xl px-8 font-black uppercase tracking-widest"
                        >
                            <Icon name="storage" className="w-5 h-5" />
                            {t('landing.db_teaser.cta')}
                        </Button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {categories.map((cat) => (
                            <Card
                                key={cat.key}
                                className="group rounded-[2rem] border border-transparent bg-muted/35 p-8 transition-all hover:border-primary/30 hover:shadow-soft"
                            >
                                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon name={cat.icon as any} className="w-6 h-6" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-fg">
                                    {t(`landing.db_teaser.cards.${cat.key}.title`)}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-fg">
                                    {t(`landing.db_teaser.cards.${cat.key}.desc`)}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Aesthetic Background Grid */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 overflow-hidden opacity-[0.03]">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>
        </section>
    );
};
