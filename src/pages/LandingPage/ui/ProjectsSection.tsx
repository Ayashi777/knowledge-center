import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';

const PROJECT_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', size: 'large' }, // Feature
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', size: 'small' },
  { url: 'https://images.unsplash.com/photo-1770215962761-bd23387e33a5?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', size: 'small' },
  { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', size: 'wide' },
  { url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=800&q=80', size: 'small' },
  { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', size: 'tall' },
  { url: 'https://images.unsplash.com/photo-1770319125105-e69d454638d3?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', size: 'small' },
];

export const ProjectsSection: React.FC = () => {
  const { t } = useI18n();

  const getGridClasses = (size: string) => {
    switch (size) {
      case 'large': return 'md:col-span-2 md:row-span-2 h-[400px] md:h-auto';
      case 'wide': return 'md:col-span-2 h-[200px] md:h-auto';
      case 'tall': return 'md:row-span-2 h-[300px] md:h-auto';
      default: return 'h-[200px] md:h-auto';
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-50 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-blue-600 dark:text-blue-400 font-black tracking-[0.3em] uppercase text-[10px] mb-4">
                {t('landing.projects.label')}
            </h2>
            <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase leading-tight mb-4 tracking-tighter">
                {t('landing.projects.title')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
                {t('landing.projects.dummy_desc')}
            </p>
        </div>

        {/* Bento Grid Collage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-3 gap-4 md:h-[800px]">
            {PROJECT_IMAGES.map((item, idx) => (
                <div 
                    key={idx} 
                    className={`relative group overflow-hidden rounded-[2.5rem] shadow-lg bg-gray-100 dark:bg-gray-800 transition-all duration-500 hover:shadow-2xl hover:z-10 ${getGridClasses(item.size)}`}
                >
                    <img 
                        src={item.url} 
                        alt={`Showcase ${idx + 1}`}
                        className="w-full h-full object-cover transition-all duration-1000 scale-100 group-hover:scale-110"
                        loading="lazy"
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="w-8 h-1 bg-blue-500 rounded-full mb-3" />
                            <p className="text-white text-[10px] font-black uppercase tracking-widest">View Project</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-16 text-center">
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-slate-50 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-900 dark:text-white hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/25 group">
                <span>Більше об'єктів</span>
                <Icon name="plus" className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </button>
        </div>
      </div>
    </section>
  );
};
