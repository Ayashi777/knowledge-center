import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';

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
    <div className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20 hover:border-blue-500 transition-all flex flex-col h-full relative overflow-hidden">
      {benefit && (
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest">
            {benefit}
        </div>
      )}
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
        <Icon name={icon as any} className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      {result && (
        <div className="pt-6 border-t border-gray-50 dark:border-gray-700">
            <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-2">
                {t('common.result')}
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {result}
            </p>
        </div>
      )}
      <button className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
        {t('common.order')}
      </button>
    </div>
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
            <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900">
                <Icon name={icon as any} className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
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
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">
          {t('services.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
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
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                <Icon name="academic-cap" className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {t('services.academy.title')}
            </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-10 bg-gray-900 text-white rounded-[3rem] relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                        <Icon name="users" className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{t('services.academy.seminars.title')}</h3>
                    <p className="text-gray-400 leading-relaxed text-lg mb-10">
                        {t('services.academy.seminars.desc')}
                    </p>
                    <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-50 transition-all shadow-xl">
                        Замовити семінар
                    </button>
                </div>
                <Icon name="academic-cap" className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-[0.03] rotate-12" />
            </div>

            <div className="p-10 bg-blue-600 text-white rounded-[3rem] relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 transition-transform">
                        <Icon name="document-text" className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{t('services.academy.norms.title')}</h3>
                    <p className="text-blue-50 leading-relaxed text-lg mb-10">
                        {t('services.academy.norms.desc')}
                    </p>
                    <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-xl">
                        Консультація по нормам
                    </button>
                </div>
                <Icon name="legal" className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-[0.05] -rotate-12" />
            </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="mb-24">
        <div className="bg-slate-50 dark:bg-gray-800/50 p-12 rounded-[4rem] border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter leading-none">
                    {t('services.form.title')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed mb-10">
                    {t('services.form.subtitle')}
                </p>
                <div className="flex flex-wrap gap-3">
                    {(t('services.form.options', { returnObjects: true } as any) as unknown as string[]).map(opt => (
                        <span key={opt} className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            {opt}
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="w-full lg:w-[450px] bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl shadow-gray-200/50 dark:shadow-black/40 border border-gray-100 dark:border-gray-800">
                <div className="space-y-6">
                    <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25">
                        {t('services.form.send_request')}
                    </button>
                    <button className="w-full py-5 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-500">
                        <Icon name="plus" className="w-4 h-4" />
                        <span>{t('services.form.attach_project')}</span>
                    </button>
                </div>
                <p className="mt-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60 italic">
                    * {t('services.support_note')}
                </p>
            </div>
        </div>
      </section>
    </div>
  );
};
