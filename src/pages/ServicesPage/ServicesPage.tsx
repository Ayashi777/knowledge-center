import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { Button, Card } from '@shared/ui/primitives';

interface ServiceCardProps {
  title: string;
  description: string;
  result?: string;
  example?: string;
  onOpenExample?: () => void;
  benefit?: string;
  icon: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, result, example, onOpenExample, benefit, icon }) => {
  const { t } = useI18n();
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-border bg-surface p-6 transition-all hover:border-primary/40 sm:p-8">
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
      {example && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-fg">
                  {t('common.exampleCalculation')}
                </div>
                <p className="mt-1 text-xs font-medium text-fg/80">
                  PDF / фото / текст
                </p>
              </div>
              <Button variant="outline" className="h-9 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest" onClick={onOpenExample}>
                Переглянути
              </Button>
            </div>
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
  const [exampleDrawer, setExampleDrawer] = useState<{ title: string; example: string } | null>(null);
  const [sheetDragY, setSheetDragY] = useState(0);
  const [isSheetDragging, setIsSheetDragging] = useState(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!exampleDrawer) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [exampleDrawer]);

  useEffect(() => {
    if (!exampleDrawer) {
      setSheetDragY(0);
      setIsSheetDragging(false);
      touchStartYRef.current = null;
    }
  }, [exampleDrawer]);

  const handleSheetTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0].clientY;
    setIsSheetDragging(true);
  };

  const handleSheetTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null) return;
    const delta = event.touches[0].clientY - touchStartYRef.current;
    if (delta <= 0) {
      setSheetDragY(0);
      return;
    }
    setSheetDragY(Math.min(delta, 320));
  };

  const handleSheetTouchEnd = () => {
    if (!isSheetDragging) return;
    if (sheetDragY > 120) {
      setExampleDrawer(null);
      return;
    }
    setIsSheetDragging(false);
    setSheetDragY(0);
    touchStartYRef.current = null;
  };

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
              example={item.example}
              onOpenExample={
                item.example
                  ? () => setExampleDrawer({ title: item.title, example: item.example })
                  : undefined
              }
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

      {exampleDrawer && (
        <>
          <button
            type="button"
            aria-label="Close example drawer overlay"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[1px]"
            onClick={() => setExampleDrawer(null)}
          />
          <aside
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-hidden rounded-t-3xl border-t border-border bg-surface shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-full md:max-w-xl md:rounded-none md:border-t-0 md:border-l"
            style={{
              transform: `translateY(${sheetDragY}px)`,
              transition: isSheetDragging ? 'none' : 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <div className="flex h-full flex-col">
              <div
                className="flex justify-center py-2 md:hidden"
                onTouchStart={handleSheetTouchStart}
                onTouchMove={handleSheetTouchMove}
                onTouchEnd={handleSheetTouchEnd}
                onTouchCancel={handleSheetTouchEnd}
              >
                <span className="h-1.5 w-12 rounded-full bg-muted" />
              </div>

              <div className="sticky top-0 z-10 border-b border-border bg-surface/95 px-5 pb-4 pt-2 backdrop-blur md:px-8 md:pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-fg">
                      {t('common.exampleCalculation')}
                    </p>
                    <h3 className="mt-2 text-lg font-black leading-tight text-fg md:text-xl">
                      {exampleDrawer.title}
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setExampleDrawer(null)} aria-label="Close example drawer">
                    <Icon name="x-mark" className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto space-y-5 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-8 md:pb-8">
                <Card className="rounded-xl border-border bg-muted/25 p-4 shadow-none">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-fg">Опис прикладу</p>
                  <p className="text-sm leading-relaxed text-fg">{exampleDrawer.example}</p>
                </Card>

                <Card className="rounded-xl border-dashed border-border bg-bg p-4 shadow-none">
                  <div className="mb-2 flex items-center gap-2 text-muted-fg">
                    <Icon name="document-text" className="h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">PDF приклад</p>
                  </div>
                  <p className="text-xs text-muted-fg">Коли PDF буде додано, тут з'явиться кнопка відкриття/завантаження.</p>
                </Card>

                <Card className="rounded-xl border-dashed border-border bg-bg p-4 shadow-none">
                  <div className="mb-2 flex items-center gap-2 text-muted-fg">
                    <Icon name="view-grid" className="h-4 w-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Фото прикладу</p>
                  </div>
                  <p className="text-xs text-muted-fg">Коли фото буде додано, тут з'явиться прев'ю і міні-галерея.</p>
                </Card>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};
