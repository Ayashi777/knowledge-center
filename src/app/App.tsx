import React, { useEffect, useCallback, useState } from 'react';
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
import { LandingPage } from '@pages/LandingPage/LandingPage';
import { ServicesPage } from '@pages/ServicesPage/ServicesPage';
import { MainLayout } from './layouts/MainLayout';

import { useAuth } from './providers/AuthProvider';
import { useDocumentManagement } from '@/shared/hooks/useDocumentManagement';
import { useAdminActions } from '@/shared/hooks/useAdminActions';
import { Document, Category } from '@shared/types';

const AppContent: React.FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { role: currentUserRole, user } = useAuth();
  const { openModal } = useModal();
  const [showLandingManually, setShowLandingManually] = useState(true);

  // If user is logged in and not a guest, or if they explicitly chose to explore
  const isAuthorized = user && currentUserRole !== 'guest';

  const {
    allDocuments,
    categories,
    isLoading: isDocsLoading,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    handleCategoryToggle,
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
    selectedRoles,
    handleRoleToggle,
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

  // -- Memoized Callbacks --
  const handleSelectDoc = useCallback((docItem: Document) => {
    navigate(`/doc/${docItem.id}`);
  }, [navigate]);

  const handleEditDoc = useCallback((doc: Document) => {
    openModal('edit-doc', doc);
  }, [openModal]);

  const handleAddNewDoc = useCallback(() => {
    const newId = `doc_${Date.now()}`;
    openModal('edit-doc', { id: newId });
  }, [openModal]);

  const handleRequireLogin = useCallback(() => {
    openModal('login', 'login', 'view');
  }, [openModal]);

  const handleRequireLoginDownload = useCallback(() => {
    openModal('login', 'login', 'download');
  }, [openModal]);

  const handleRegisterClick = useCallback(() => {
    openModal('login', 'request', 'view');
  }, [openModal]);

  const handleLoginClick = useCallback(() => {
    openModal('login');
  }, [openModal]);

  const handleEditCategory = useCallback((cat: Category) => {
    openModal('edit-category', cat);
  }, [openModal]);

  const handleAddCategory = useCallback(() => {
    openModal('edit-category', {
        id: `cat_${Date.now()}`,
        nameKey: '',
        iconName: 'construction',
        viewPermissions: ['admin'],
      });
  }, [openModal]);

  const handleExploreClick = useCallback(() => {
    setShowLandingManually(false);
    navigate('/database');
  }, [navigate]);

  const showAdminControls = currentUserRole === 'admin';

  return (
    <MainLayout onLoginClick={handleLoginClick}>
        <Routes>
          <Route
            path="/"
            element={
              (!isAuthorized && showLandingManually) ? (
                <LandingPage 
                  onLoginClick={handleLoginClick}
                  onRegisterClick={handleRegisterClick}
                  onExploreClick={handleExploreClick}
                />
              ) : (
                <Navigate to="/database" replace />
              )
            }
          />
          <Route 
            path="/database"
            element={
                <DashboardView
                  onSelectDoc={handleSelectDoc}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  docs={paginatedDocs}
                  totalDocsCount={sortedAndFilteredDocs.length}
                  showAdminControls={showAdminControls}
                  onEditDoc={handleEditDoc}
                  onDeleteDoc={handleDeleteDocument}
                  onAddNewDoc={handleAddNewDoc}
                  selectedCategories={selectedCategories}
                  handleCategoryToggle={handleCategoryToggle}
                  visibleCategories={visibleCategories}
                  allTags={allTags}
                  selectedTags={selectedTags}
                  onTagSelect={handleTagSelect}
                  onRequireLogin={handleRequireLogin}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedRoles={selectedRoles}
                  handleRoleToggle={handleRoleToggle}
                  onClearFilters={clearFilters}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  onEditCategory={handleEditCategory}
                />
            }
          />
          <Route path="/services" element={<ServicesPage />} />
          <Route 
            path="/doc/:id" 
            element={
              <DocumentPage 
                 documents={allDocuments} 
                 categories={categories}
                 onUpdateContent={handleUpdateContent}
                 onRequireLogin={handleRequireLoginDownload}
                 onLoginClick={handleLoginClick}
                 onRegisterClick={handleRegisterClick}
                 onCategorySelect={handleCategoryToggle}
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
                  documents={allDocuments} 
                  allTags={allTags}
                  onUpdateCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onAddCategory={handleAddCategory}
                  onDeleteDocument={handleDeleteDocument}
                  onEditDocument={handleEditDoc}
                  onAddDocument={handleAddNewDoc}
                  onLoginClick={handleLoginClick}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <GlobalModals 
            availableCategories={categories}
            availableTags={allTags}
        />
    </MainLayout>
  );
};

export default AppContent;
