import React from 'react';
import { Document, Category, UserRole, ViewMode, SortBy, Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { Sidebar } from '@widgets/Sidebar';
import { Pagination } from '@shared/ui/Pagination';
import { useAuth } from '@app/providers/AuthProvider';
import { Button } from '@shared/ui/primitives';

// Sub-components
import { DashboardHeader } from './ui/DashboardHeader';
import { DashboardFilters } from './ui/DashboardFilters';
import { DocumentList } from './ui/DocumentList';

export const DashboardView: React.FC<{
    onSelectDoc: (doc: Document) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    docs: Document[];
    totalDocsCount: number;
    showAdminControls: boolean;
    onEditDoc: (doc: Document) => void;
    onDeleteDoc: (id: string) => void;
    onAddNewDoc: () => void;
    selectedCategories: string[]; // 🔥 Multi-select
    handleCategoryToggle: (categoryName: string) => void;
    visibleCategories: Category[];
    allTags: Tag[];
    selectedTags: string[];
    onTagSelect: (tagName: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    sortBy: SortBy;
    setSortBy: (sort: SortBy) => void;
    selectedRoles: UserRole[]; // 🔥 Multi-select
    handleRoleToggle: (role: UserRole) => void;
    onClearFilters: () => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEditCategory: (cat: Category) => void;
}> = ({
    onSelectDoc,
    searchTerm,
    onSearchChange,
    docs,
    totalDocsCount,
    showAdminControls,
    onEditDoc,
    onDeleteDoc,
    onAddNewDoc,
    selectedCategories,
    handleCategoryToggle,
    visibleCategories,
    allTags,
    selectedTags,
    onTagSelect,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    selectedRoles,
    handleRoleToggle,
    onClearFilters,
    currentPage,
    totalPages,
    onPageChange,
    onEditCategory,
}) => {
    const { t } = useI18n();
    const { role: currentUserRole } = useAuth();

    return (
        <>
            <DashboardHeader />

            <div className="flex flex-col lg:flex-row gap-8">
                <Sidebar
                    visibleCategories={visibleCategories}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagSelect={onTagSelect}
                    showAdminControls={showAdminControls}
                    onEditCategory={onEditCategory}
                    onClearFilters={onClearFilters}
                    selectedRoles={selectedRoles}
                    onRoleToggle={handleRoleToggle}
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
							<Button
								onClick={onAddNewDoc}
								className="h-10 whitespace-nowrap rounded-md px-4 text-sm font-semibold"
							>
								<Icon name="plus" className="h-5 w-5" />
								<span>{t('common.add')}</span>
							</Button>
						</div>
					)}

                    <DocumentList 
                        docs={docs}
                        viewMode={viewMode}
                        onSelectDoc={onSelectDoc}
                        currentUserRole={currentUserRole}
                        showAdminControls={showAdminControls}
                        onEditDoc={onEditDoc}
                        onDeleteDoc={onDeleteDoc}
                        categories={visibleCategories}
                    />

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
                </main>
            </div>
        </>
    );
};
