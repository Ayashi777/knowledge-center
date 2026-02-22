import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';

interface ServiceCardProps {
  title: string;
  description: string;
  result?: string;
  benefit?: string;
  icon: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, result, benefit, icon }) => {
  const { t } = useI18n();
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-border bg-surface p-8 transition-all hover:border-primary/40">
      {benefit && (
        <div className="absolute right-0 top-0 rounded-bl-2xl bg-primary p-4 text-[10px] font-bold uppercase tracking-widest text-primary-fg opacity-0 transition-opacity group-hover:opacity-100">
            {benefit}
        </div>
      )}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
        <Icon name={icon as any} className="w-6 h-6" />
      </div>
      <h3 className="mb-4 text-xl font-bold leading-tight text-fg">
        {title}
      </h3>
      <p className="mb-6 flex-grow text-sm leading-relaxed text-muted-fg">
        {description}
      </p>
      {result && (
        <div className="border-t border-border pt-6">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-fg">
                {t('common.result')}
            </div>
            <p className="text-sm font-medium text-fg">
            {result}
            </p>
        </div>
      )}
      <Button className="mt-8 h-11 w-full rounded-xl text-sm font-bold">
        {t('common.order')}
      </Button>
    </Card>
  );
};

export const ServicesPage: React.FC = () => {
  const { t } = useI18n();

  const renderSection = (key: string, icon: string) => {
    const sectionData = t(`services.${key}`, { returnObjects: true } as any) as any;
    if (!sectionData || !sectionData.items) return null;
    
    return (
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fg text-bg">
                <Icon name={icon as any} className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-fg">
                {sectionData.title}
            </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(sectionData.items).map(([itemKey, item]: [string, any]) => (
            <ServiceCard 
              key={itemKey}
              title={item.title}
              description={item.desc}
              result={item.result}
              benefit={item.benefit}
              icon={icon}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <header className="mb-20 text-center">
        <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter text-fg sm:text-6xl">
          {t('services.title')}
        </h1>
        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-fg">
          {t('services.subtitle')}
        </p>
      </header>

      {renderSection('engineering', 'calculate')}
      {renderSection('thermal', 'thermostat')}
      {renderSection('design', 'architecture')}
      {renderSection('onsite', 'engineering')}

      {/* Professional Academy Section */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-fg">
                <Icon name="academic-cap" className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-fg">
                {t('services.academy.title')}
            </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="group relative overflow-hidden rounded-[3rem] border-fg/20 bg-fg p-10 text-bg">
                <div className="relative z-10">
                    <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-soft transition-transform group-hover:scale-110">
                        <Icon name="users" className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{t('services.academy.seminars.title')}</h3>
                    <p className="mb-10 text-lg leading-relaxed text-bg/70">
                        {t('services.academy.seminars.desc')}
                    </p>
                    <Button variant="outline" className="h-12 rounded-2xl border-bg/30 bg-surface px-8 text-xs font-black uppercase tracking-widest text-fg">
                        Замовити семінар
                    </Button>
                </div>
                <Icon name="academic-cap" className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-[0.03] rotate-12" />
            </Card>

            <Card className="group relative overflow-hidden rounded-[3rem] border-primary/30 bg-primary p-10 text-primary-fg">
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 transition-transform">
                        <Icon name="document-text" className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{t('services.academy.norms.title')}</h3>
                    <p className="mb-10 text-lg leading-relaxed text-primary-fg/85">
                        {t('services.academy.norms.desc')}
                    </p>
                    <Button className="h-12 rounded-2xl bg-fg px-8 text-xs font-black uppercase tracking-widest text-bg hover:brightness-110">
                        Консультація по нормам
                    </Button>
                </div>
                <Icon name="legal" className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-[0.05] -rotate-12" />
            </Card>
        </div>
      </section>

      {/* Form Section */}
      <section className="mb-24">
        <Card className="flex flex-col items-center gap-16 rounded-[4rem] border-border bg-muted/35 p-12 lg:flex-row">
            <div className="flex-1">
                <h2 className="mb-6 text-4xl font-black uppercase leading-none tracking-tighter text-fg">
                    {t('services.form.title')}
                </h2>
                <p className="mb-10 text-lg font-medium leading-relaxed text-muted-fg">
                    {t('services.form.subtitle')}
                </p>
                <div className="flex flex-wrap gap-3">
                    {(t('services.form.options', { returnObjects: true } as any) as unknown as string[]).map(opt => (
                        <span key={opt} className="rounded-full border border-border bg-surface px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-fg">
                            {opt}
                        </span>
                    ))}
                </div>
            </div>
            
            <Card className="w-full rounded-[3rem] border-border bg-surface p-10 lg:w-[450px]">
                <div className="space-y-6">
                    <Button className="h-12 w-full rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                        {t('services.form.send_request')}
                    </Button>
                    <Button variant="outline" className="h-12 w-full rounded-2xl border-2 text-xs font-black uppercase tracking-[0.2em] text-muted-fg">
                        <Icon name="plus" className="w-4 h-4" />
                        <span>{t('services.form.attach_project')}</span>
                    </Button>
                </div>
                <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-muted-fg/70 italic">
                    * {t('services.support_note')}
                </p>
            </Card>
        </Card>
      </section>
    </div>
  );
};
