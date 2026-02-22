import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { ViewMode, SortBy } from '@shared/types';
import { Button, Input } from '@shared/ui/primitives';

interface DashboardFiltersProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortBy: SortBy;
    setSortBy: (sort: SortBy) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    totalDocsCount: number;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
    searchTerm,
    onSearchChange,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    totalDocsCount,
}) => {
    const { t } = useI18n();

    return (
        <div className="main-content-filters">
            <div className="relative mb-6">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icon name="search" className="h-5 w-5 text-muted-fg" />
                </div>
                <Input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-11 border-border bg-muted/50 py-3 pl-10 pr-3 sm:text-sm sm:leading-6"
                    placeholder={t('dashboard.searchPlaceholder')}
                />
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-fg">{t('dashboard.sortBy')}</span>
                    <div className="flex items-center rounded-md bg-muted p-0.5">
                        <Button
                            onClick={() => setSortBy('recent')}
                            variant={sortBy === 'recent' ? 'outline' : 'ghost'}
                            className={`h-auto rounded px-2 py-0.5 text-xs font-semibold ${
                                sortBy === 'recent' ? 'bg-surface text-primary shadow-sm' : 'text-muted-fg'
                            }`}
                        >
                            {t('dashboard.mostRecent')}
                        </Button>
                        <Button
                            onClick={() => setSortBy('alpha')}
                            variant={sortBy === 'alpha' ? 'outline' : 'ghost'}
                            className={`h-auto rounded px-2 py-0.5 text-xs font-semibold ${
                                sortBy === 'alpha' ? 'bg-surface text-primary shadow-sm' : 'text-muted-fg'
                            }`}
                        >
                            {t('dashboard.alphabetical')}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg">{t('dashboard.viewAs')}</span>
                    <div className="flex items-center rounded-md bg-muted p-0.5">
                        <Button
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                            variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                            className={`h-auto rounded p-1 ${
                                viewMode === 'grid' ? 'bg-surface text-primary shadow-sm' : 'text-muted-fg'
                            }`}
                        >
                            <Icon name="view-grid" className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                            variant={viewMode === 'list' ? 'outline' : 'ghost'}
                            className={`h-auto rounded p-1 ${
                                viewMode === 'list' ? 'bg-surface text-primary shadow-sm' : 'text-muted-fg'
                            }`}
                        >
                            <Icon name="view-list" className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-baseline mb-4">
                <p className="text-sm font-semibold text-muted-fg">
                    {t('dashboard.results', { count: totalDocsCount })}
                </p>
            </div>
        </div>
    );
};
