import React, { useState, useEffect } from 'react';
import { Category, Document, DocumentContent, UserRole } from './types';
import { CATEGORIES as initialCategories, RECENT_DOCUMENTS as initialDocuments } from './constants';
import { useI18n, Language } from './i18n';
import { ThemeSwitcher, LanguageSwitcher } from './components/UI';
import { LoginModal, RegistrationRequestModal, DocumentEditorModal, CategoryEditorModal } from './components/Modals';
import { DashboardView, DocumentView } from './components/Views';
import { AdminPanel } from './components/AdminPanel';
import { useDocuments } from './hooks/useDocuments';
import { Icon } from './components/icons';

const UserAccessControl: React.FC<{ 
    role: UserRole; 
    onLoginClick: () => void; 
    onLogout: () => void; 
    onAdminClick: () => void;
}> = ({ role, onLoginClick, onLogout, onAdminClick }) => {
    const { t } = useI18n();
    return (
    <div className="flex items-center gap-3">
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {t('header.currentRole')}
            </span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
                    {t(`roles.${role}`)}
                </span>
                {role !== 'guest' && (
                    <button onClick={onLogout} className="text-[10px] text-red-500 hover:underline font-bold uppercase tracking-tighter">
                        {t('header.logout')}
                    </button>
                )}
            </div>
        </div>
        
        {role === 'admin' && (
            <button 
                onClick={onAdminClick}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                title={t('header.adminPanel')}
            >
                <Icon name="cog" className="w-5 h-5" />
            </button>
        )}

        {role === 'guest' && (
            <button onClick={onLoginClick} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm uppercase tracking-wide">
                {t('header.login')}
            </button>
        )}
    </div>
)};

const App: React.FC = () => {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('guest');
  
  const {
      documents, setDocuments, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory,
      selectedTags, handleTagSelect, sortBy, setSortBy, viewMode, setViewMode, currentPage, setCurrentPage,
      totalPages, paginatedDocs, visibleCategories, allTags, sortedAndFilteredDocs, clearFilters
  } = useDocuments(initialDocuments, categories, currentUserRole, t, lang);

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginContext, setLoginContext] = useState<'view' | 'download' | 'login'>('login');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('title');
  }, [lang, t]);

  const handleSelectDoc = (doc: Document) => {
    if (currentUserRole === 'guest') { setIsRegistrationModalOpen(true); return; }
    const cat = categories.find(c => c.nameKey === doc.categoryKey);
    if (!cat?.viewPermissions.includes(currentUserRole)) {
        setLoginContext('view');
        setIsLoginModalOpen(true);
        return;
    }
    setSelectedDoc(doc);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setSelectedDoc(null);
    setSelectedCategory(null);
    setCurrentUserRole('guest');
    clearFilters();
  };

  const handleSaveDocument = (docToSave: Partial<Document>) => {
    const exists = documents.some(d => d.id === docToSave.id);
    if (exists) {
        setDocuments(documents.map(d => d.id === docToSave.id ? { ...d, ...docToSave, updatedAt: new Date() } as Document : d));
    } else {
        const newDoc: Document = {
            id: `doc${Date.now()}`,
            title: docToSave.title,
            categoryKey: docToSave.categoryKey!,
            updatedAt: new Date(),
            tags: docToSave.tags || [],
            content: { en: {}, uk: {} }
        };
        setDocuments([newDoc, ...documents]);
    }
    setEditingDoc(null);
  };

  const handleUpdateDocumentContent = (docId: string, lang: Language, newContent: DocumentContent) => {
      setDocuments(prevDocs => prevDocs.map(doc => {
          if (doc.id === docId) {
              const updatedDoc = { ...doc, updatedAt: new Date(), content: { ...doc.content, [lang]: newContent } };
              if(selectedDoc?.id === docId) setSelectedDoc(updatedDoc);
              return updatedDoc;
          }
          return doc;
      }));
  };

  const handleSaveCategory = (catToSave: Category) => {
      setCategories(prev => prev.map(c => c.id === catToSave.id ? catToSave : c));
      setEditingCategory(null);
  };

  const showAdminControls = currentUserRole === 'admin';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500/30' : ''}`}>
      <header className="fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-slate-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-gray-800/50">
          <UserAccessControl 
            role={currentUserRole} 
            onLoginClick={() => { setLoginContext('login'); setIsLoginModalOpen(true); }} 
            onLogout={handleLogout}
            onAdminClick={() => setIsAdminPanelOpen(true)}
          />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
          </div>
      </header>

      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative">
        {selectedDoc ? (
          <DocumentView doc={selectedDoc} onClose={() => setSelectedDoc(null)} onRequireLogin={() => setIsRegistrationModalOpen(true)} currentUserRole={currentUserRole} onUpdateContent={handleUpdateDocumentContent} onCategoryClick={(key) => { setSelectedDoc(null); setSelectedCategory(key); }} />
        ) : (
          <DashboardView 
            onSelectDoc={handleSelectDoc} searchTerm={searchTerm} onSearchChange={setSearchTerm} docs={paginatedDocs} totalDocsCount={sortedAndFilteredDocs.length} showAdminControls={showAdminControls} onEditDoc={setEditingDoc} onDeleteDoc={(id) => window.confirm(t('dashboard.confirmDelete')) && setDocuments(documents.filter(d => d.id !== id))} onAddNewDoc={() => setEditingDoc({})} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} visibleCategories={currentUserRole === 'guest' ? categories : visibleCategories} allTags={allTags} selectedTags={selectedTags} onTagSelect={handleTagSelect} onRequireLogin={() => setIsRegistrationModalOpen(true)} isGuest={currentUserRole==='guest'} viewMode={viewMode} setViewMode={setViewMode} sortBy={sortBy} setSortBy={setSortBy} onClearFilters={clearFilters} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} onEditCategory={setEditingCategory}
          />
        )}
        <footer className="mt-16 text-center text-gray-400 dark:text-gray-600 font-mono text-[10px] uppercase tracking-widest pb-8">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
      
      {isAdminPanelOpen && (
          <AdminPanel 
            categories={categories} 
            onUpdateCategory={handleSaveCategory} 
            onClose={() => setIsAdminPanelOpen(false)} 
          />
      )}

      {isRegistrationModalOpen && <RegistrationRequestModal onClose={() => setIsRegistrationModalOpen(false)} />}
      {isLoginModalOpen && <LoginModal onLogin={(role) => { setCurrentUserRole(role); setIsLoginModalOpen(false); }} onClose={() => setIsLoginModalOpen(false)} context={loginContext} />}
      {editingDoc !== null && <DocumentEditorModal doc={editingDoc} onSave={handleSaveDocument} onClose={() => setEditingDoc(null)} availableCategories={visibleCategories} />}
      {editingCategory !== null && <CategoryEditorModal category={editingCategory} onSave={handleSaveCategory} onClose={() => setEditingCategory(null)} />}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .prose {
          --tw-prose-body: #374151; --tw-prose-headings: #111827; --tw-prose-links: #1d4ed8; --tw-prose-bold: #111827; --tw-prose-bullets: #d1d5db; --tw-prose-hr: #e5e7eb; --tw-prose-quote-borders: #e5e7eb; --tw-prose-invert-body: #d1d5db; --tw-prose-invert-headings: #fff; --tw-prose-invert-links: #60a5fa; --tw-prose-invert-bold: #fff; --tw-prose-invert-bullets: #4b5563; --tw-prose-invert-hr: #374151;
        }
      `}</style>
    </div>
  );
};

export default App;