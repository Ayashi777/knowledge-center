import React, { useState } from 'react';
import { Category } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';

const FilterSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left" aria-expanded={isOpen}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <Icon name={isOpen ? 'minus' : 'plus'} className="w-4 h-4 text-gray-500" />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

export const Sidebar: React.FC<{
  visibleCategories: Category[],
  selectedCategory: string | null,
  onCategorySelect: (key: string | null) => void,
  allTags: string[],
  selectedTags: Set<string>,
  onTagSelect: (tag: string) => void,
  showAdminControls?: boolean,
  onEditCategory?: (cat: Category) => void
}> = ({ visibleCategories, selectedCategory, onCategorySelect, allTags, selectedTags, onTagSelect, showAdminControls, onEditCategory }) => {
    const { t } = useI18n();
    return (
        <aside className="w-full lg:w-64 lg:pr-8 flex-shrink-0">
            <h2 className="text-lg font-bold mb-2">{t('sidebar.filterBy')}</h2>
            <FilterSection title={t('sidebar.resourceType')}>
                <ul className="space-y-2 text-sm">
                    <li>
                        <button onClick={() => onCategorySelect(null)} className={`w-full text-left ${!selectedCategory ? 'font-bold text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>
                            {t('sidebar.allTypes')}
                        </button>
                    </li>
                    {visibleCategories.map(cat => (
                         <li key={cat.id} className="flex items-center justify-between group/cat">
                            <button onClick={() => onCategorySelect(cat.nameKey)} className={`flex-grow text-left ${selectedCategory === cat.nameKey ? 'font-bold text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>
                                {t(cat.nameKey)}
                            </button>
                            {showAdminControls && onEditCategory && (
                                <button onClick={() => onEditCategory(cat)} className="opacity-0 group-hover/cat:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all">
                                    <Icon name="plus" className="w-3 h-3 rotate-45" /> {/* Use plus rotated as pencil/edit for now or just generic icon */}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </FilterSection>
             <FilterSection title={t('sidebar.tags')}>
                <div className="space-y-2">
                    {allTags.map(tag => (
                        <label key={tag} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={selectedTags.has(tag)} onChange={() => onTagSelect(tag)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span>{tag}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </aside>
    );
}
