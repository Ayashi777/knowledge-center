import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';

import { useI18n } from '@app/providers/i18n/i18n';
import { useModal } from '@app/providers/ModalProvider/ModalProvider';
import { GlobalModals } from '@app/providers/ModalProvider/GlobalModals';

import { DashboardView } from '@widgets/DashboardView';
import { DocumentPage } from '@pages/DocumentPage';
import { AdminPage } from '@pages/AdminPage';
import { MainLayout } from './layouts/MainLayout';

import { useAuth } from './providers/AuthProvider';
import { useDocumentManagement } from '@/shared/hooks/useDocumentManagement';
import { useAdminActions } from '@/shared/hooks/useAdminActions';

const AppContent: React.FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { role: currentUserRole } = useAuth();
  const { openModal } = useModal();

  const {
    documents,
    categories,
    isLoading: isDocsLoading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    handleTagSelect,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedDocs,
    visibleCategories,
    allTags,
    sortedAndFilteredDocs,
    selectedRoleFilter,
    setSelectedRoleFilter,
    clearFilters,
  } = useDocumentManagement();

  const {
    handleUpdateContent,
    handleDeleteCategory,
    handleDeleteDocument
  } = useAdminActions();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('title');
  }, [lang, t]);

  const showAdminControls = currentUserRole === 'admin';

  return (
    <MainLayout onLoginClick={() => openModal('login')}>
        <Routes>
          <Route
            path="/"
            element={
              <DashboardView
                onSelectDoc={(docItem) => navigate(`/doc/${docItem.id}`)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                docs={paginatedDocs}
                totalDocsCount={sortedAndFilteredDocs.length}
                showAdminControls={showAdminControls}
                onEditDoc={(doc) => openModal('edit-doc', doc)}
                onDeleteDoc={handleDeleteDocument}
                onAddNewDoc={() => openModal('edit-doc', {})}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                visibleCategories={visibleCategories}
                allTags={allTags}
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                onRequireLogin={() => openModal('login', 'login', 'view')}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedRole={selectedRoleFilter}
                onRoleSelect={setSelectedRoleFilter}
                onClearFilters={clearFilters}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onEditCategory={(cat) => openModal('edit-category', cat)}
              />
            }
          />
          <Route 
            path="/doc/:id" 
            element={
              <DocumentPage 
                 documents={documents}
                 categories={categories}
                 onUpdateContent={handleUpdateContent}
                 onRequireLogin={() => openModal('login', 'login', 'download')}
                 onLoginClick={() => openModal('login', 'login', 'view')}
                 onRegisterClick={() => openModal('login', 'request', 'view')}
                 onCategorySelect={setSelectedCategory}
              />
            } 
          />
          <Route 
            path="/admin" 
            element={
              currentUserRole === 'admin' ? (
                <AdminPage 
                  isDocsLoading={isDocsLoading}
                  categories={categories}
                  documents={documents}
                  allTags={allTags}
                  onUpdateCategory={(cat) => openModal('edit-category', cat)}
                  onDeleteCategory={handleDeleteCategory}
                  onAddCategory={() => openModal('edit-category', {
                      id: `cat${Date.now()}`,
                      nameKey: '',
                      iconName: 'construction',
                      viewPermissions: ['admin'],
                    })}
                  onDeleteDocument={handleDeleteDocument}
                  onEditDocument={(doc) => openModal('edit-doc', doc)}
                  onAddDocument={() => openModal('edit-doc', {})}
                  onLoginClick={() => openModal('login')}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <GlobalModals />
    </MainLayout>
  );
};

export default AppContent;
