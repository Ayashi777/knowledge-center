import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { ViewMode, SortBy } from '@shared/types';

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
                    <Icon name="search" className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-100 dark:bg-gray-800 py-3 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                    placeholder={t('dashboard.searchPlaceholder')}
                />
            </div>

            <div className="flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{t('dashboard.sortBy')}</span>
                    <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                        <button
                            onClick={() => setSortBy('recent')}
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                sortBy === 'recent' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {t('dashboard.mostRecent')}
                        </button>
                        <button
                            onClick={() => setSortBy('alpha')}
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                sortBy === 'alpha' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {t('dashboard.alphabetical')}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('dashboard.viewAs')}</span>
                    <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                        <button
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                            className={`p-1 rounded ${
                                viewMode === 'grid' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <Icon name="view-grid" className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                            className={`p-1 rounded ${
                                viewMode === 'list' ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            <Icon name="view-list" className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-baseline mb-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {t('dashboard.results', { count: totalDocsCount })}
                </p>
            </div>
        </div>
    );
};
