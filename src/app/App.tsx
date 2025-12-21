import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from 'react-router-dom';

import { useI18n } from '@app/providers/i18n/i18n';
import { ThemeSwitcher } from '@shared/ui/ThemeSwitcher';
import { LanguageSwitcher } from '@shared/ui/LanguageSwitcher';
import { UserAccessControl } from '@shared/ui/UserAccessControl';
import { LoginModal } from '@widgets/modals/LoginModal';
import { DocumentEditorModal } from '@widgets/modals/DocumentEditorModal';
import { CategoryEditorModal } from '@widgets/modals/CategoryEditorModal';

import { DashboardView } from '@widgets/DashboardView';
import { DocumentPage } from '@pages/DocumentPage';
import { AdminPage } from '@pages/AdminPage';

import { useAuth } from './providers/AuthProvider';
import { useTheme } from '@/shared/hooks/useTheme';
import { useDocumentManagement } from '@/shared/hooks/useDocumentManagement';
import { useAdminActions } from '@/shared/hooks/useAdminActions';

const AppContent: React.FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { user: currentUser, role: currentUserRole } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    editingDoc,
    setEditingDoc,
    editingCategory,
    setEditingCategory,
    handleSaveDocument,
    handleUpdateContent,
    handleSaveCategory,
    handleDeleteCategory,
    handleDeleteDocument
  } = useAdminActions();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginContext, setLoginContext] = useState<'view' | 'download' | 'login'>('login');
  const [loginModalView, setLoginModalView] = useState<'login' | 'request'>('login');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('title');
  }, [lang, t]);

  const showAdminControls = currentUserRole === 'admin';

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${
        showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500/5' : ''
      }`}
    >
      <header className="fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="text-lg font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">CE</div>
            <span className="hidden sm:block">ЦЕНТР ЗНАНЬ</span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <UserAccessControl
            user={currentUser}
            role={currentUserRole}
            onLoginClick={() => {
              setLoginContext('login');
              setLoginModalView('login');
              setIsLoginModalOpen(true);
            }}
          />
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative min-h-screen">
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
                onEditDoc={setEditingDoc}
                onDeleteDoc={handleDeleteDocument}
                onAddNewDoc={() => setEditingDoc({})}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                visibleCategories={visibleCategories}
                allTags={allTags}
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                onRequireLogin={() => {
                  setLoginContext('view');
                  setLoginModalView('login');
                  setIsLoginModalOpen(true);
                }}
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
                onEditCategory={setEditingCategory}
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
                 onRequireLogin={() => {
                    setLoginContext('download');
                    setLoginModalView('login');
                    setIsLoginModalOpen(true);
                 }}
                 onLoginClick={() => {
                    setLoginContext('view');
                    setLoginModalView('login');
                    setIsLoginModalOpen(true);
                 }}
                 onRegisterClick={() => {
                    setLoginContext('view');
                    setLoginModalView('request');
                    setIsLoginModalOpen(true);
                 }}
                 onCategorySelect={setSelectedCategory}
              />
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminPage 
                 isDocsLoading={isDocsLoading}
                 categories={categories}
                 documents={documents}
                 allTags={allTags}
                 onUpdateCategory={setEditingCategory}
                 onDeleteCategory={handleDeleteCategory}
                 onAddCategory={() => setEditingCategory({
                    id: `cat${Date.now()}`,
                    nameKey: '',
                    iconName: 'construction',
                    viewPermissions: ['admin'],
                  } as any)}
                 onDeleteDocument={handleDeleteDocument}
                 onEditDocument={setEditingDoc}
                 onAddDocument={() => setEditingDoc({})}
                 onLoginClick={() => {
                   setLoginContext('login');
                   setLoginModalView('login');
                   setIsLoginModalOpen(true);
                 }}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <footer className="mt-20 text-center text-gray-400 dark:text-gray-600 font-mono text-[9px] uppercase tracking-widest pb-12">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          context={loginContext} 
          initialView={loginModalView} 
        />
      )}
      {editingDoc !== null && (
        <DocumentEditorModal
          doc={editingDoc}
          onSave={handleSaveDocument}
          onClose={() => setEditingDoc(null)}
          availableCategories={categories}
          availableTags={allTags}
        />
      )}
      {editingCategory !== null && (
        <CategoryEditorModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
