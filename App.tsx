import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
  Navigate,
} from 'react-router-dom';

import { Category, Document, DocumentContent, UserRole } from './types';
import { useI18n, Language } from './i18n';
import { ThemeSwitcher } from './components/UI';
import {
  LoginModal,
  DocumentEditorModal,
  CategoryEditorModal,
} from './components/Modals';
import { DashboardView, DocumentView } from './components/Views';
import { AdminPanel } from './components/AdminPanel';
import { useDocuments } from './hooks/useDocuments';
import { Icon } from './components/icons';
import { subscribeToAuthChanges, logoutUser } from './utils/auth';
import { User } from 'firebase/auth';

import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Removes `undefined` deeply from objects/arrays.
 * Firestore does NOT allow `undefined` in nested data.
 */
const stripUndefinedDeep = (value: any): any => {
  if (Array.isArray(value)) {
    return value
      .map(stripUndefinedDeep)
      .filter((v) => v !== undefined);
  }
  if (value && typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = stripUndefinedDeep(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return out;
  }
  return value === undefined ? undefined : value;
};

// --- User Control Component ---
const UserAccessControl: React.FC<{
  user: User | null;
  role: UserRole;
  onLoginClick: () => void;
}> = ({ user, role, onLoginClick }) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col text-right">
        <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
          {user ? user.email : t('roles.guest')}
        </span>
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
            {t(`roles.${role}`)}
          </span>
          {user && (
            <button
              onClick={() => logoutUser()}
              className="text-[10px] text-red-500 hover:underline font-black uppercase tracking-tighter"
            >
              {t('header.logout')}
            </button>
          )}
        </div>
      </div>

      {role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
          title={t('header.adminPanel')}
        >
          <Icon name="cog" className="w-5 h-5" />
        </button>
      )}

      {!user && (
        <button
          onClick={onLoginClick}
          className="px-5 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20 uppercase tracking-widest"
        >
          {t('header.login')}
        </button>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('guest');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
  } = useDocuments(currentUserRole, t, lang);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginContext, setLoginContext] = useState<'view' | 'download' | 'login'>(
    'login'
  );
  const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (
      (saved as 'light' | 'dark') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user, role) => {
      setCurrentUser(user);
      setCurrentUserRole(role);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    theme === 'dark'
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('title');
  }, [lang, t]);

  /**
   * ✅ Save ONLY document metadata from Admin Panel (NEVER touch `content` here)
   */
  const handleSaveDocument = async (docToSave: Partial<Document>) => {
    const id = docToSave.id || `doc${Date.now()}`;
    const docRef = doc(db, 'documents', id);

    const cleanData: any = {
      id,
      title: docToSave.title || '',
      categoryKey: docToSave.categoryKey || '',
      tagIds: docToSave.tagIds || [],
      thumbnailUrl: (docToSave as any).thumbnailUrl || '',
      updatedAt: serverTimestamp(),
    };

    // 🔒 Hard protection: even if something passes content by mistake — ignore it.
    delete cleanData.content;

    try {
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        await updateDoc(docRef, cleanData);
      } else {
        // New document: initialize empty content object
        await setDoc(docRef, { ...cleanData, content: {} });
      }

      setEditingDoc(null);
    } catch (e) {
      console.error('Metadata save failed:', e);
      alert('Помилка збереження метаданих. Перевір консоль для деталей.');
    }
  };

  /**
   * ✅ Save HTML content (Quill) safely:
   * Transaction + Read-Modify-Write + deep sanitization
   */
  const handleUpdateContent = async (
    docId: string,
    langToUpdate: Language,
    newContent: DocumentContent
  ) => {
    const docRef = doc(db, 'documents', docId);
    const html = (newContent?.html ?? '').toString();

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(docRef);

        if (!snap.exists()) {
          // "Raw" doc: create minimal structure
          tx.set(
            docRef,
            stripUndefinedDeep({
              id: docId,
              content: { [langToUpdate]: { html } },
              updatedAt: serverTimestamp(),
            }),
            { merge: true }
          );
          return;
        }

        const data: any = snap.data() || {};
        const currentContent =
          data.content && typeof data.content === 'object' ? data.content : {};

        const nextContent = stripUndefinedDeep({
          ...currentContent,
          [langToUpdate]: { html },
        });

        tx.update(docRef, {
          content: nextContent,
          updatedAt: serverTimestamp(),
        });
      });

      console.log('Content saved successfully (transaction)');
    } catch (error: any) {
      console.error('CRITICAL: Update failed', error);
      alert(
        'Помилка збереження контенту. Відкрий консоль — там буде точна причина (Firebase/Firestore).'
      );
      throw error;
    }
  };

  const handleSaveCategory = async (catToSave: Category) => {
    await setDoc(doc(db, 'categories', catToSave.id), catToSave, { merge: true });
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Видалити категорію?')) {
      await deleteDoc(doc(db, 'categories', id));
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm(t('dashboard.confirmDelete'))) {
      await deleteDoc(doc(db, 'documents', id));
    }
  };

  const showAdminControls = currentUserRole === 'admin';

  // Route Components
  const DocPageRoute = () => {
    const { id } = useParams();
    const docItem = documents.find((d) => d.id === id);

    if (isAuthLoading || isDocsLoading) {
      return (
        <div className="flex items-center justify-center h-[80vh]">
          <Icon name="loading" className="w-10 h-10 text-blue-600" />
        </div>
      );
    }

    if (!docItem) return <Navigate to="/" />;

    const cat = categories.find((c) => c.nameKey === docItem.categoryKey);
    const isPublic = cat?.viewPermissions?.includes('guest');

    if (isPublic) {
      return (
        <DocumentView
          doc={docItem}
          allTags={allTags}
          onClose={() => navigate('/')}
          onRequireLogin={() => setIsLoginModalOpen(true)}
          currentUserRole={currentUserRole}
          onUpdateContent={handleUpdateContent}
          onCategoryClick={(key) => {
            setSelectedCategory(key);
            navigate('/');
          }}
        />
      );
    }

    if (!currentUser) {
      return (
        <div className="pt-32 text-center animate-fade-in">
          <Icon name="lock-closed" className="mx-auto mb-6 text-gray-300 w-16 h-16" />
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {t('loginModal.accessRequired')}
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Цей ресурс обмежений. Будь ласка, увійдіть, щоб підтвердити свій рівень
            доступу.
          </p>
          <button
            onClick={() => {
              setLoginContext('view');
              setIsLoginModalOpen(true);
            }}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            Увійти зараз
          </button>
        </div>
      );
    }

    if (!cat?.viewPermissions?.includes(currentUserRole)) {
      return (
        <div className="pt-40 text-center text-red-500 font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/10 p-20 rounded-3xl border border-red-100 dark:border-red-900/50 max-w-2xl mx-auto">
          <Icon name="lock-closed" className="mx-auto mb-4 w-12 h-12" />
          {t('docView.accessDenied')}
        </div>
      );
    }

    return (
      <DocumentView
        doc={docItem}
        allTags={allTags}
        onClose={() => navigate('/')}
        onRequireLogin={() => setIsLoginModalOpen(true)}
        currentUserRole={currentUserRole}
        onUpdateContent={handleUpdateContent}
        onCategoryClick={(key) => {
          setSelectedCategory(key);
          navigate('/');
        }}
      />
    );
  };

  const AdminPageRoute = () => {
    if (isAuthLoading || isDocsLoading) {
      return (
        <div className="flex items-center justify-center h-[80vh]">
          <Icon name="loading" className="w-10 h-10 text-blue-600" />
        </div>
      );
    }

    if (!showAdminControls) {
      return (
        <div className="pt-32 text-center animate-fade-in">
          <Icon name="cog" className="mx-auto mb-6 text-gray-300 w-16 h-16" />
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            Зона Адміністратора
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Будь ласка, авторизуйтесь з правами адміністратора для доступу до
            інструментів керування.
          </p>
          <button
            onClick={() => {
              setLoginContext('login');
              setIsLoginModalOpen(true);
            }}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            Вхід для Адміна
          </button>
        </div>
      );
    }

    return (
      <AdminPanel
        categories={categories}
        documents={documents}
        allTags={allTags}
        onUpdateCategory={setEditingCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={() =>
          setEditingCategory({
            id: `cat${Date.now()}`,
            nameKey: '',
            iconName: 'construction',
            viewPermissions: ['admin'],
          } as any)
        }
        onDeleteDocument={handleDeleteDocument}
        onEditDocument={setEditingDoc}
        onAddDocument={() => setEditingDoc({})}
        onClose={() => navigate('/')}
      />
    );
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${
        showAdminControls
          ? 'outline outline-4 outline-offset-[-4px] outline-blue-500/5'
          : ''
      }`}
    >
      <header className="fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="text-lg font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs">
              CE
            </div>
            <span className="hidden sm:block">ЦЕНТР ЗНАНЬ</span>
          </button>
        </div>

        <div className="flex items-center gap-6">
          <UserAccessControl
            user={currentUser}
            role={currentUserRole}
            onLoginClick={() => {
              setLoginContext('login');
              setIsLoginModalOpen(true);
            }}
          />
          <ThemeSwitcher
            theme={theme}
            toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
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
                visibleCategories={currentUserRole === 'guest' ? categories : visibleCategories}
                allTags={allTags}
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                onRequireLogin={() => setIsLoginModalOpen(true)}
                isGuest={currentUserRole === 'guest'}
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
          <Route path="/doc/:id" element={<DocPageRoute />} />
          <Route path="/admin" element={<AdminPageRoute />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <footer className="mt-20 text-center text-gray-400 dark:text-gray-600 font-mono text-[9px] uppercase tracking-widest pb-12">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} context={loginContext} />
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
