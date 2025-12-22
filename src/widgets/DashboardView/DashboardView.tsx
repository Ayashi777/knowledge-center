import React from 'react';
import { Document, Category, UserRole, ViewMode, SortBy, Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { Sidebar } from '@widgets/Sidebar';
import { Pagination } from '@shared/ui/Pagination';
import { useAuth } from '@app/providers/AuthProvider';

// Sub-components
import { DashboardHeader } from './ui/DashboardHeader';
import { DashboardFilters } from './ui/DashboardFilters';
import { DocumentList } from './ui/DocumentList';

export const DashboardView: React.FC<{
    onSelectDoc: (doc: Document) => void;
    onRequireLogin: () => void;
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
    selectedRole: UserRole | 'all';
    onRoleSelect: (role: UserRole | 'all') => void;
    onClearFilters: () => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEditCategory: (cat: Category) => void;
}> = ({
    onSelectDoc,
    onRequireLogin,
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
    const { role: currentUserRole } = useAuth();
    const isGuest = currentUserRole === 'guest';

    return (
        <>
            <DashboardHeader />

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
                    <DashboardFilters 
                        searchTerm={searchTerm}
                        onSearchChange={onSearchChange}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        totalDocsCount={totalDocsCount}
                    />

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

                    <DocumentList 
                        docs={docs}
                        viewMode={viewMode}
                        onSelectDoc={onSelectDoc}
                        onRequireLogin={onRequireLogin}
                        isGuest={isGuest}
                        showAdminControls={showAdminControls}
                        onEditDoc={onEditDoc}
                        onDeleteDoc={onDeleteDoc}
                        allTags={allTags}
                    />

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
                </main>
            </div>
        </>
    );
};
