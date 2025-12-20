import React, { useState } from 'react';
import { Category, Tag, UserRole } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';

const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 uppercase text-[10px] tracking-widest">{title}</h3>
        <Icon name={isOpen ? 'minus' : 'plus'} className="w-4 h-4 text-gray-400" />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

export const Sidebar: React.FC<{
  visibleCategories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (key: string | null) => void;
  allTags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  selectedRole: UserRole | null; // ✅ NEW
  onRoleSelect: (role: UserRole | null) => void; // ✅ NEW
  onClearFilters: () => void;
  showAdminControls?: boolean;
  onEditCategory?: (cat: Category) => void;
}> = ({
  visibleCategories,
  selectedCategory,
  onCategorySelect,
  allTags,
  selectedTags,
  onTagSelect,
  selectedRole,
  onRoleSelect,
  onClearFilters,
  showAdminControls,
  onEditCategory,
}) => {
  const { t } = useI18n();

  const activeFiltersCount = (selectedCategory ? 1 : 0) + selectedTags.length + (selectedRole ? 1 : 0);

  return (
    <aside className="w-full lg:w-64 lg:pr-8 flex-shrink-0">
      <h2 className="text-lg font-bold mb-2">{t('sidebar.filterBy')}</h2>

      <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
        
        {/* ✅ NEW: Role Filter Section */}
        <FilterSection title={t('sidebar.forWhom')}>
            <div className="flex flex-col gap-1">
                {['foreman', 'architect', 'designer'].map((role) => (
                    <button
                        key={role}
                        onClick={() => onRoleSelect(selectedRole === role ? null : (role as UserRole))}
                        className={`text-left py-2 px-3 rounded-xl transition-all text-sm font-bold ${
                            selectedRole === role
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        {t(`roles.${role}`)}
                    </button>
                ))}
            </div>
        </FilterSection>

        <FilterSection title={t('sidebar.resourceType')}>
            <div className="flex flex-col gap-1">
            {visibleCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between group/cat">
                <button
                    onClick={() => onCategorySelect(selectedCategory === cat.nameKey ? null : cat.nameKey)}
                    className={`flex-grow text-left py-2 px-3 rounded-xl transition-all text-sm font-bold ${
                    selectedCategory === cat.nameKey
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                >
                    {t(cat.nameKey)}
                </button>

                {showAdminControls && onEditCategory && (
                    <button
                        onClick={() => onEditCategory(cat)}
                        className="opacity-0 group-hover/cat:opacity-100 p-2 text-gray-400 hover:text-blue-500 transition-all"
                    >
                        <Icon name="cog" className="w-4 h-4" />
                    </button>
                )}
                </div>
            ))}
            </div>
        </FilterSection>

        <FilterSection title={t('sidebar.tags')}>
          <div className="space-y-1">
            {allTags.map((tag) => {
              const checked = selectedTags.includes(tag.id);
              return (
                <label key={tag.id} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${checked ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onTagSelect(tag.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      style={{ backgroundColor: tag.color || '#cccccc' }}
                      className="w-2 h-2 rounded-full shrink-0"
                    />
                    <span className={`text-sm truncate ${checked ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tag.name}
                    </span>
                  </div>
                </label>
              );
            })}
            {allTags.length === 0 && (
              <p className="text-xs text-gray-400 italic p-2">{t('editorModal.noTagsHint')}</p>
            )}
          </div>
        </FilterSection>

        {activeFiltersCount > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
            <div className="mb-4 flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {t('common.activeFilters')}
              </span>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                {activeFiltersCount}
              </span>
            </div>

            <button
              onClick={onClearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-900/50"
            >
              <Icon name="x" className="w-4 h-4" />
              {t('common.resetFilters')}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
