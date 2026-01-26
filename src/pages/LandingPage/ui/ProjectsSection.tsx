import React, { useState } from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';

interface Project {
  id: string;
  name: string;
  images: string[];
  location: string;
  descriptionKey?: string;
}

const PROJECTS: Project[] = [
  {
    id: 'airport-kherson',
    name: 'Міжнародний аеропорт "Херсон"',
    location: 'м. Херсон',
    descriptionKey: 'landing.projects.airport_desc',
    images: [
      '/assets/projects/Herosn/Herson.jpg',
      '/assets/projects/Herosn/Herson_1.jpg',
      '/assets/projects/Herosn/Herson_2.jpg'
    ]
  },
  {
    id: '1',
    name: 'ЖК "RiverStone"',
    location: 'м. Київ',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec239f3d6b9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: '2',
    name: 'Бізнес-центр "Unit.City"',
    location: 'м. Київ',
    images: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const ProjectsSection: React.FC = () => {
  const { t } = useI18n();
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);

  const nextProject = () => {
    setActiveProjectIdx((prev) => (prev + 1) % PROJECTS.length);
  };

  const prevProject = () => {
    setActiveProjectIdx((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length);
  };

  const currentProject = PROJECTS[activeProjectIdx];

  return (
    <section className="py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-blue-600 dark:text-blue-400 font-bold tracking-widest uppercase text-sm mb-4">
              {t('landing.projects.label')}
            </h2>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase leading-tight">
              {t('landing.projects.title')}
            </h3>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prevProject}
              className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all text-gray-600 dark:text-gray-400"
            >
              <Icon name="arrow-left" className="w-5 h-5" />
            </button>
            <button 
              onClick={nextProject}
              className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all text-gray-600 dark:text-gray-400"
            >
              <Icon name="arrow-right" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full mb-4">
                {currentProject.location}
              </span>
              <h4 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {currentProject.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                {currentProject.descriptionKey ? t(currentProject.descriptionKey) : t('landing.projects.dummy_desc')}
              </p>
            </div>
            <div className="flex gap-2">
              {PROJECTS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveProjectIdx(idx)}
                  className={`h-1.5 transition-all rounded-full ${idx === activeProjectIdx ? 'w-8 bg-blue-600' : 'w-4 bg-gray-200 dark:bg-gray-800'}`}
                />
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
              <div className="sm:col-span-2 aspect-[4/3] sm:aspect-auto">
                <img 
                  src={currentProject.images[0]} 
                  alt={currentProject.name}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                <div className="aspect-square sm:aspect-auto">
                  <img 
                    src={currentProject.images[1]} 
                    alt={currentProject.name}
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                </div>
                <div className="aspect-square sm:aspect-auto">
                  <img 
                    src={currentProject.images[2]} 
                    alt={currentProject.name}
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
