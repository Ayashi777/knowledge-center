import React from 'react';
import { Category, UserRole, Tag } from '../../types';
import { useI18n } from '../../i18n';
import { Icon } from '../../shared/ui/icons';

interface SidebarProps {
  visibleCategories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (key: string | null) => void;
  allTags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  showAdminControls: boolean;
  onEditCategory: (cat: Category) => void;
  onClearFilters: () => void;
  selectedRole: UserRole | null;
  onRoleSelect: (role: UserRole | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  visibleCategories,
  selectedCategory,
  onCategorySelect,
  allTags,
  selectedTags,
  onTagSelect,
  showAdminControls,
  onEditCategory,
  onClearFilters,
  selectedRole,
  onRoleSelect,
}) => {
  const { t } = useI18n();

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-8">
      {/* Search/Filters header for mobile maybe? */}
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-lg font-bold">Фільтри</h2>
        <button onClick={onClearFilters} className="text-sm text-blue-600 font-medium">Очистити</button>
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {t('sidebar.categories')}
          </h3>
          <button 
            onClick={onClearFilters}
            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter hover:underline"
          >
            {t('sidebar.allDocs')}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {visibleCategories.map((cat) => (
            <div key={cat.id} className="group flex items-center gap-1">
              <button
                onClick={() => onCategorySelect(cat.nameKey)}
                className={`flex-grow flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group-active:scale-[0.98] ${
                  selectedCategory === cat.nameKey
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'
                }`}
              >
                <Icon name={cat.iconName as any || 'folder'} className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm truncate">{t(`categories.${cat.nameKey}`)}</span>
              </button>
              
              {showAdminControls && (
                <button 
                  onClick={() => onEditCategory(cat)}
                  className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all"
                >
                  <Icon name="pencil" className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Roles Filter (UI only) */}
      <section className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          Призначено для
        </h3>
        <div className="flex flex-wrap gap-2">
          {['employee', 'worker', 'dispatcher', 'hr'].map((role) => (
            <button
              key={role}
              onClick={() => onRoleSelect(selectedRole === role ? null : role as UserRole)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedRole === role
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t(`roles.${role}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          {t('sidebar.tags')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagSelect(tag.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                selectedTags.includes(tag.id)
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 shadow-sm'
                  : 'bg-white border-gray-100 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              #{tag.id}
            </button>
          ))}
        </div>
      </section>
      
      {/* Help Card */}
      <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Icon name="info-circle" className="w-32 h-32" />
        </div>
        <h4 className="font-black text-lg mb-2 relative z-10 uppercase tracking-tight">Потрібна допомога?</h4>
        <p className="text-blue-100 text-sm mb-4 relative z-10 leading-snug">Якщо ви не знайшли потрібний документ, зверніться до адміністратора або вашого керівника.</p>
        <a 
          href="mailto:support@example.com" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors relative z-10"
        >
          Написати нам
        </a>
      </div>
    </aside>
  );
};
