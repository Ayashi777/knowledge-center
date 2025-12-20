import React from 'react';
import { Document, Category, UserRole, ViewMode, SortBy, Tag } from '../../types';
import { useI18n } from '../../i18n';
import { Icon } from '../../components/icons';
import { Sidebar } from '../../components/Sidebar';
import { DocumentGridItem, DocumentListItem } from '../../components/DocumentComponents';
import { Pagination } from '../../shared/ui/Pagination';

export const DashboardView: React.FC<{
    onSelectDoc: (doc: Document) => void;
    onRequireLogin: () => void;
    isGuest: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    docs: Document[];
    totalDocsCount: number;
    showAdminControls: boolean;
    onEditDoc: (doc: Document) => void;
    onDeleteDoc: (id: string) => void;
    onAddNewDoc: () => void;
    selectedCategory: string | null;
    onCategorySelect: (categoryName: string | null) => void;
    visibleCategories: Category[];
    allTags: Tag[];
    selectedTags: string[];
    onTagSelect: (tagName: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    sortBy: SortBy;
    setSortBy: (sort: SortBy) => void;
    selectedRole: UserRole | null;
    onRoleSelect: (role: UserRole | null) => void;
    onClearFilters: () => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEditCategory: (cat: Category) => void;
}> = ({
    onSelectDoc,
    onRequireLogin,
    isGuest,
    searchTerm,
    onSearchChange,
    docs,
    totalDocsCount,
    showAdminControls,
    onEditDoc,
    onDeleteDoc,
    onAddNewDoc,
    selectedCategory,
    onCategorySelect,
    visibleCategories,
    allTags,
    selectedTags,
    onTagSelect,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    selectedRole,
    onRoleSelect,
    onClearFilters,
    currentPage,
    totalPages,
    onPageChange,
    onEditCategory,
}) => {
    const { t } = useI18n();

    return (
        <>
            <header className="mb-12 text-center pt-16 sm:pt-12 animate-fade-in">
                {/* Головна назва веб-додатка */}
                <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-gray-900 dark:text-white mb-4 uppercase">
                    {t('dashboard.title')}
                </h1>

                {/* Підзаголовок: Яка роль додатка */}
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 max-w-3xl mx-auto leading-tight">
                    {t('dashboard.subtitle')}
                </p>

                {/* Опис: Що тут можна знайти */}
                <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed italic">
                    {t('dashboard.description')}
                </p>

                {/* Декоративний елемент для візуального розділення */}
                <div className="mt-10 h-px w-32 bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-900 to-transparent mx-auto"></div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                <Sidebar
                    visibleCategories={visibleCategories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={onCategorySelect}
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagSelect={onTagSelect}
                    showAdminControls={showAdminControls}
                    onEditCategory={onEditCategory}
                    onClearFilters={onClearFilters}
                    selectedRole={selectedRole}
                    onRoleSelect={onRoleSelect}
                />

                <main className="flex-grow">
                    <div className="relative mb-6">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                                className="h-5 w-5 text-gray-400 dark:text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                    clipRule="evenodd"
                                />
                            </svg>
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
                                        sortBy === 'recent' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    {t('dashboard.mostRecent')}
                                </button>
                                <button
                                    onClick={() => setSortBy('alpha')}
                                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                        sortBy === 'alpha' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
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
                                        viewMode === 'grid' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    <Icon name="view-grid" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    aria-label="List view"
                                    className={`p-1 rounded ${
                                        viewMode === 'list' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    <Icon name="view-list" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

					<div className="flex justify-between items-baseline mb-4">
						<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('dashboard.results', { count: totalDocsCount })}</p>
					</div>

					{showAdminControls && (
						<div className="mb-4 text-right">
							<button
								onClick={onAddNewDoc}
								className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
							>
								<Icon name="plus" className="h-5 w-5" />
								<span>{t('common.add')}</span>
							</button>
						</div>
					)}

					{docs.length > 0 ? (
						viewMode === 'grid' ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
								{docs.map((doc) => (
									<DocumentGridItem key={doc.id} doc={doc} onClick={() => onSelectDoc(doc)} onRequireLogin={onRequireLogin} isGuest={isGuest} />
								))}
							</div>
						) : (
							<div className="space-y-3">
								{docs.map((doc) => (
									<DocumentListItem
										key={doc.id}
										doc={doc}
										onClick={() => onSelectDoc(doc)}
										onEdit={() => onEditDoc(doc)}
										onDelete={() => onDeleteDoc(doc.id)}
										showAdminControls={showAdminControls}
									/>
								))}
							</div>
						)
					) : (
						<div className="text-center py-10 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg">
							<p className="text-gray-500 dark:text-gray-400">{t('dashboard.noResults')}</p>
							<p className="text-gray-600 dark:text-gray-500 text-sm mt-1">{t('dashboard.noResultsDescription')}</p>
						</div>
					)}

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
                </main>
            </div>
        </>
    );
};
