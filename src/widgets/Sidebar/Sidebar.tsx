import React from 'react';
import { Category, UserRole, Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { getCategoryName, normalizeCategoryKey } from '@shared/lib/utils/format';
import { Button, Card } from '@shared/ui/primitives';

interface SidebarProps {
  visibleCategories: Category[];
  selectedCategories: string[]; // 🔥 Changed to array
  onCategoryToggle: (key: string) => void; // 🔥 Changed to toggle
  allTags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  showAdminControls: boolean;
  onEditCategory: (cat: Category) => void;
  onClearFilters: () => void;
  selectedRoles: UserRole[]; // 🔥 Changed to array
  onRoleToggle: (role: UserRole) => void; // 🔥 Changed to toggle
}

export const Sidebar: React.FC<SidebarProps> = ({
  visibleCategories,
  selectedCategories,
  onCategoryToggle,
  allTags,
  selectedTags,
  onTagSelect,
  showAdminControls,
  onEditCategory,
  onClearFilters,
  selectedRoles,
  onRoleToggle,
}) => {
  const { t } = useI18n();

  const selectableRoles: UserRole[] = ['foreman', 'engineer', 'architect'];

  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    selectedTags.length > 0 || 
    selectedRoles.length > 0;

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-8">
      {/* Search/Filters header for mobile */}
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-lg font-bold">{t('sidebar.filters')}</h2>
        {hasActiveFilters && (
          <Button onClick={onClearFilters} variant="ghost" className="h-auto p-0 text-sm font-medium text-danger">
            <Icon name="x-mark" className="w-4 h-4" />
            {t('dashboard.clearFilters')}
          </Button>
        )}
      </div>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-fg">
            {t('sidebar.categories')}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {visibleCategories.map((cat) => {
            const isSelected = selectedCategories.some(k => normalizeCategoryKey(k) === normalizeCategoryKey(cat.nameKey));
            return (
              <div key={cat.id} className="group flex items-center gap-1">
                <Button
                  onClick={() => onCategoryToggle(cat.nameKey)}
                  variant={isSelected ? 'primary' : 'ghost'}
                  className={`h-auto flex-grow justify-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group-active:scale-[0.98] ${
                    isSelected
                      ? ''
                      : 'text-muted-fg hover:bg-surface hover:shadow-sm'
                  }`}
                >
                  <Icon name={cat.iconName as any || 'folder'} className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-sm truncate">{getCategoryName(cat.nameKey, t)}</span>
                </Button>
                
                {showAdminControls && (
                  <Button
                    onClick={() => onEditCategory(cat)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-fg opacity-0 transition-all group-hover:opacity-100 hover:text-primary"
                  >
                    <Icon name="pencil" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Roles Filter (Multi-select) */}
      <section className="border-t border-border pt-4">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-fg">
          {t('sidebar.forWhom')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectableRoles.map((role) => {
            const isSelected = selectedRoles.includes(role);
            return (
              <Button
                key={role}
                onClick={() => onRoleToggle(role)}
                variant={isSelected ? 'primary' : 'outline'}
                className={`h-auto rounded-lg px-3 py-1.5 text-xs font-bold ${
                  isSelected
                    ? ''
                    : 'text-muted-fg'
                }`}
              >
                {t(`roles.${role}`)}
              </Button>
            );
          })}
        </div>
      </section>

      {/* Tags */}
      <section className="border-t border-border pt-4">
        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-muted-fg">
          {t('sidebar.tags')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <Button
              key={tag.id}
              onClick={() => onTagSelect(tag.id)}
              variant={selectedTags.includes(tag.id) ? 'primary' : 'outline'}
              className={`h-auto rounded-lg border px-3 py-1.5 text-xs font-bold ${
                selectedTags.includes(tag.id)
                  ? ''
                  : 'text-muted-fg'
              }`}
            >
              #{tag.name || tag.id}
            </Button>
          ))}
        </div>
      </section>

      {/* Reset Filters Button */}
      {hasActiveFilters && (
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="h-12 w-full rounded-2xl border-danger/30 bg-danger/10 text-[10px] font-black uppercase tracking-widest text-danger hover:bg-danger/15 active:scale-[0.98]"
        >
          <Icon name="x-mark" className="w-3.5 h-3.5" />
          {t('dashboard.clearFilters')}
        </Button>
      )}
      
      {/* Help Card */}
      <Card className="group relative overflow-hidden rounded-2xl border-primary/30 bg-gradient-to-br from-primary to-accent p-5 text-primary-fg shadow-soft">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Icon name="info-circle" className="w-32 h-32" />
        </div>
        <h4 className="font-black text-lg mb-2 relative z-10 uppercase tracking-tight">{t('sidebar.helpTitle')}</h4>
        <p className="text-sm mb-4 relative z-10 leading-snug text-primary-fg/80">{t('sidebar.helpDescription')}</p>
        <a 
          href="mailto:support@example.com" 
          className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-xs font-black uppercase tracking-widest text-primary transition-colors hover:brightness-95"
        >
          {t('sidebar.contactUs')}
        </a>
      </Card>
    </aside>
  );
};
