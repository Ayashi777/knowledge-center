import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';

interface ServiceCardProps {
  title: string;
  description: string;
  result: string;
  benefit: string;
  icon: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, result, benefit, icon }) => {
  const { t } = useI18n();
  return (
    <div className="group bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20 hover:border-blue-500 transition-all flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest">
        {benefit}
      </div>
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
        <Icon name={icon as any} className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      <div className="pt-6 border-t border-gray-50 dark:border-gray-700">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-bold mb-2">
            {t('common.result')}
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {result}
        </p>
      </div>
      <button className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
        {t('common.order')}
      </button>
    </div>
  );
};

export const ServicesPage: React.FC = () => {
  const { t } = useI18n();

  const renderSection = (key: string, icon: string) => {
    const items = t(`services.${key}.items`, { returnObjects: true }) as any;
    return (
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900">
                <Icon name={icon as any} className="w-5 h-5" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {t(`services.${key}.title`)}
            </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(items).map(([itemKey, item]: [string, any]) => (
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

      {/* Academy Section */}
      <section className="mb-24 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 bg-gray-900 text-white rounded-[40px] relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-6 relative z-10">{t('services.academy.title')}</h2>
            <div className="space-y-8 relative z-10">
                <div>
                    <h4 className="text-blue-400 font-bold mb-2">{t('services.academy.seminars.title')}</h4>
                    <p className="text-gray-400">{t('services.academy.seminars.desc')}</p>
                </div>
                <div>
                    <h4 className="text-blue-400 font-bold mb-2">{t('services.academy.norms.title')}</h4>
                    <p className="text-gray-400">{t('services.academy.norms.desc')}</p>
                </div>
            </div>
            <Icon name="school" className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5" />
        </div>
        
        <div className="p-10 bg-blue-600 text-white rounded-[40px]">
            <h2 className="text-3xl font-bold mb-8">{t('services.form.title')}</h2>
            <p className="mb-8 text-blue-100">{t('services.form.subtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {(t('services.form.options', { returnObjects: true }) as string[]).map(opt => (
                    <button key={opt} className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all text-left">
                        {opt}
                    </button>
                ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-grow py-4 bg-white text-blue-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-colors">
                    {t('services.form.send_request')}
                </button>
                <button className="px-6 py-4 border-2 border-white/30 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-colors">
                    <Icon name="attach_file" className="w-5 h-5" />
                    <span className="text-sm">{t('services.form.attach_project')}</span>
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};
