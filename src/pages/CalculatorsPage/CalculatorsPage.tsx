import React, { useMemo, useState } from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Button, Card } from '@shared/ui/primitives';
import { Icon } from '@shared/ui/icons';

type CalculatorItem = {
  id: string;
  fileName: string;
  group: 'roofing' | 'facade' | 'drainage' | 'junctions';
};
type TaskFilter = 'all' | 'flat-roof' | 'pitched-roof' | 'facade' | 'drainage' | 'junctions' | 'thermal';

const CALCULATORS: CalculatorItem[] = [
  { id: 'flat-roof-2023', fileName: 'Плоска покрівля 2023.xlsx', group: 'roofing' },
  { id: 'pitched-roof-2023-09', fileName: 'СКАТНА покрівля 2023 09.xls', group: 'roofing' },
  { id: 'ttr-sumishenogo-pokryttya', fileName: 'ТТР_Суміщеного_покриття_.xlsx', group: 'roofing' },
  { id: 'soffit-2025', fileName: 'соффит 2025.xlsm', group: 'facade' },
  { id: 'siding-2-5', fileName: 'САЙДИНГ 2.5.xlsm', group: 'facade' },
  { id: 'recyfix-standart-100', fileName: 'варіанти системRecyfix Standart 100.xlsx', group: 'drainage' },
  { id: 'profil-kolina', fileName: 'PROFIL  двораструбні коліна.xlsm', group: 'junctions' },
];

const getFileExtension = (fileName: string) => {
  const ext = fileName.split('.').pop();
  return ext ? ext.toUpperCase() : '';
};

const buildFileHref = (fileName: string) => `/calculators/${encodeURIComponent(fileName)}`;

export const CalculatorsPage: React.FC = () => {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const tr = (key: string, fallback = '') => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const calculators = useMemo(
    () =>
      CALCULATORS.map((item) => ({
        ...item,
        href: buildFileHref(item.fileName),
        extension: getFileExtension(item.fileName),
        name: tr(`calculators.items.${item.id}.name`, item.fileName),
        purpose: tr(`calculators.items.${item.id}.purpose`, ''),
        inputs: tr(`calculators.items.${item.id}.inputs`, ''),
        result: tr(`calculators.items.${item.id}.result`, ''),
      })),
    [t]
  );

  const groupOrder: CalculatorItem['group'][] = ['roofing', 'facade', 'drainage', 'junctions'];
  const filterOptions: TaskFilter[] = ['all', 'flat-roof', 'pitched-roof', 'thermal', 'facade', 'drainage', 'junctions'];

  const isItemVisible = (item: (typeof calculators)[number]) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'flat-roof') return item.id === 'flat-roof-2023';
    if (activeFilter === 'pitched-roof') return item.id === 'pitched-roof-2023-09';
    if (activeFilter === 'thermal') return item.id === 'ttr-sumishenogo-pokryttya';
    if (activeFilter === 'facade') return item.group === 'facade';
    if (activeFilter === 'drainage') return item.group === 'drainage';
    if (activeFilter === 'junctions') return item.group === 'junctions';
    return true;
  };

  const groupedCalculators = useMemo(
    () =>
      groupOrder
        .map((group) => ({
          group,
          items: calculators.filter((item) => item.group === group && isItemVisible(item)),
        }))
        .filter((entry) => entry.items.length > 0),
    [calculators, activeFilter]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-8">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">
          <Icon name="engineering" className="h-4 w-4" />
          {t('calculators.badge')}
        </p>
        <h1 className="mb-4 text-4xl font-black uppercase tracking-tight text-fg sm:text-5xl">
          {t('calculators.title')}
        </h1>
        <p className="max-w-4xl text-sm leading-relaxed text-muted-fg sm:text-base">
          {t('calculators.subtitle')}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary-fg">
            {t('calculators.audience.architect')}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-widest text-fg">
            {t('calculators.audience.designer')}
          </span>
        </div>
      </header>

      <Card className="mb-8 rounded-2xl border-border/70 bg-muted/25 p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-fg">1</p>
            <p className="text-sm font-bold text-fg">{t('calculators.flow.step1')}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-fg">2</p>
            <p className="text-sm font-bold text-fg">{t('calculators.flow.step2')}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-fg">3</p>
            <p className="text-sm font-bold text-fg">{t('calculators.flow.step3')}</p>
          </div>
        </div>
      </Card>

      <Card className="mb-8 rounded-2xl p-5">
        <p className="mb-3 text-xs font-black uppercase tracking-widest text-muted-fg">
          {t('calculators.quickFilter.title')}
        </p>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option}
              variant={activeFilter === option ? 'primary' : 'outline'}
              className="h-9 rounded-lg px-3 text-[11px] font-black uppercase tracking-wider"
              onClick={() => setActiveFilter(option)}
            >
              {t(`calculators.quickFilter.${option}`)}
            </Button>
          ))}
        </div>
      </Card>

      {groupedCalculators.map(({ group, items }) => (
        <section key={group} className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black uppercase tracking-tight text-fg">
              {t(`calculators.groups.${group}`)}
            </h2>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-fg">
              {items.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              return (
                <Card key={item.id} className="flex h-full flex-col rounded-2xl p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon name="document-text" className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-fg">
                      {item.extension}
                    </span>
                  </div>

                  <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-fg">{item.name}</h3>
                  <p className="mb-3 text-xs text-muted-fg">{item.purpose}</p>

                  <div className="mb-5 space-y-2 rounded-xl border border-border bg-muted/20 p-3 text-xs">
                    <p className="text-fg"><span className="font-black">{t('calculators.labels.inputs')}:</span> {item.inputs}</p>
                    <p className="text-fg"><span className="font-black">{t('calculators.labels.result')}:</span> {item.result}</p>
                  </div>

                  <a href={item.href} download className="mt-auto">
                    <Button className="h-11 w-full rounded-xl text-xs font-black uppercase tracking-widest">
                      <Icon name="download" className="h-4 w-4" />
                      {t('calculators.open')}
                    </Button>
                  </a>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <Card className="mt-8 rounded-2xl border-dashed p-5 text-xs text-muted-fg">
        {t('calculators.note')}
      </Card>
    </div>
  );
};
