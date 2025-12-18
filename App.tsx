import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { Category, Document, DocumentContent, UserRole } from './types';
import { CATEGORIES as initialCategories, RECENT_DOCUMENTS as initialDocuments } from './constants';
import { useI18n, Language } from './i18n';
import { ThemeSwitcher, LanguageSwitcher } from './components/UI';
import { LoginModal, RegistrationRequestModal, DocumentEditorModal, CategoryEditorModal } from './components/Modals';
import { DashboardView, DocumentView } from './components/Views';
import { AdminPanel } from './components/AdminPanel';
import { useDocuments } from './hooks/useDocuments';
import { Icon } from './components/icons';
import { subscribeToAuthChanges, logoutUser } from './utils/auth';
import { User } from 'firebase/auth';

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
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                {user ? user.email : t('header.currentRole')}
            </span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
                    {t(`roles.${role}`)}
                </span>
                {user && (
                    <button onClick={() => logoutUser()} className="text-[10px] text-red-500 hover:underline font-bold uppercase tracking-tighter">
                        {t('header.logout')}
                    </button>
                )}
            </div>
        </div>
        {role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-blue-600 dark:text-blue-400" title={t('header.adminPanel')}>
                <Icon name="cog" className="w-5 h-5" />
            </button>
        )}
        {!user && (
            <button onClick={onLoginClick} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm uppercase tracking-wide">
                {t('header.login')}
            </button>
        )}
    </div>
)};

const AppContent: React.FC = () => {
    const { t, lang } = useI18n();
    const navigate = useNavigate();
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<UserRole>('guest');
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const [categories, setCategories] = useState<Category[]>(initialCategories);
    
    const {
        documents, setDocuments, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory,
        selectedTags, handleTagSelect, sortBy, setSortBy, viewMode, setViewMode, currentPage, setCurrentPage,
        totalPages, paginatedDocs, visibleCategories, allTags, sortedAndFilteredDocs, clearFilters
    } = useDocuments(initialDocuments, categories, currentUserRole, t, lang);

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [loginContext, setLoginContext] = useState<'view' | 'download' | 'login'>('login');
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    });

    // Real Firebase Auth Subscription
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
        theme === 'dark' ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark');
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.title = t('title');
    }, [lang, t]);

    const handleSaveDocument = (docToSave: Partial<Document>) => {
        const exists = documents.some(d => d.id === docToSave.id);
        if (exists) {
            setDocuments(documents.map(d => d.id === docToSave.id ? { ...d, ...docToSave, updatedAt: new Date() } as Document : d));
        } else {
            const newDoc: Document = {
                id: `doc${Date.now()}`, title: docToSave.title, categoryKey: docToSave.categoryKey!,
                updatedAt: new Date(), tags: docToSave.tags || [], content: { en: {}, uk: {} }
            };
            setDocuments([newDoc, ...documents]);
        }
        setEditingDoc(null);
    };

    const handleUpdateContent = (docId: string, lang: Language, newContent: DocumentContent) => {
        setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, updatedAt: new Date(), content: { ...doc.content, [lang]: newContent } } : doc));
    };

    const handleSaveCategory = (catToSave: Category) => {
        setCategories(prev => prev.map(c => c.id === catToSave.id ? catToSave : c));
        setEditingCategory(null);
    };

    const handleDeleteCategory = (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    const showAdminControls = currentUserRole === 'admin';

    // Route Components
    const DocPageRoute = () => {
        const { id } = useParams();
        const doc = documents.find(d => d.id === id);
        if (isAuthLoading) return <div className="pt-32 text-center text-gray-400">Loading...</div>;
        if (!doc) return <Navigate to="/" />;
        if (!currentUser) {
            return <div className="pt-32 text-center"><Icon name="lock-closed" className="mx-auto mb-4 text-gray-400 w-12 h-12" /><h2 className="text-xl font-bold mb-4">{t('loginModal.accessRequired')}</h2><button onClick={() => setIsLoginModalOpen(true)} className="bg-blue-600 text-white px-6 py-2 rounded-md font-bold">Log in for full access</button></div>;
        }
        const cat = categories.find(c => c.nameKey === doc.categoryKey);
        if (!cat?.viewPermissions.includes(currentUserRole)) return <div className="pt-32 text-center text-red-500 font-bold">{t('docView.accessDenied')}</div>;

        return <DocumentView doc={doc} onClose={() => navigate('/')} onRequireLogin={() => setIsLoginModalOpen(true)} currentUserRole={currentUserRole} onUpdateContent={handleUpdateContent} onCategoryClick={(key) => { setSelectedCategory(key); navigate('/'); }} />;
    };

    const AdminPageRoute = () => {
        if (isAuthLoading) return <div className="pt-32 text-center text-gray-400">Loading...</div>;
        if (!showAdminControls) return <div className="pt-32 text-center"><Icon name="lock-closed" className="mx-auto mb-4 text-gray-400 w-12 h-12" /><h2 className="text-2xl font-bold mb-2">Admin Access Required</h2><button onClick={() => setIsLoginModalOpen(true)} className="bg-blue-600 text-white px-8 py-3 rounded-md font-bold mt-4">Login as Admin</button></div>;
        return (
            <AdminPanel categories={categories} documents={documents} onUpdateCategory={setEditingCategory} onDeleteCategory={handleDeleteCategory}
                onAddCategory={() => setEditingCategory({ id: `cat${Date.now()}`, nameKey: '', iconName: 'construction', viewPermissions: ['admin'] })}
                onDeleteDocument={(id) => window.confirm(t('dashboard.confirmDelete')) && setDocuments(documents.filter(d => d.id !== id))}
                onEditDocument={setEditingDoc} onAddDocument={() => setEditingDoc({})} onClose={() => navigate('/')} 
            />
        );
    };

    return (
        <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500/10' : ''}`}>
            <header className="fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-slate-50/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-gray-800/50">
                <UserAccessControl user={currentUser} role={currentUserRole} onLoginClick={() => { setLoginContext('login'); setIsLoginModalOpen(true); }} />
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ThemeSwitcher theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
                </div>
            </header>

            <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative min-h-screen">
                {isAuthLoading ? (
                    <div className="flex items-center justify-center h-screen"><Icon name="loading" className="w-10 h-10 text-blue-600" /></div>
                ) : (
                    <Routes>
                        <Route path="/" element={
                            <DashboardView 
                                onSelectDoc={(doc) => navigate(`/doc/${doc.id}`)} 
                                searchTerm={searchTerm} onSearchChange={setSearchTerm} docs={paginatedDocs} totalDocsCount={sortedAndFilteredDocs.length} 
                                showAdminControls={showAdminControls} onEditDoc={setEditingDoc} onDeleteDoc={(id) => window.confirm(t('dashboard.confirmDelete')) && setDocuments(documents.filter(d => d.id !== id))} 
                                onAddNewDoc={() => setEditingDoc({})} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} 
                                visibleCategories={currentUserRole === 'guest' ? categories : visibleCategories} allTags={allTags} selectedTags={selectedTags} onTagSelect={handleTagSelect} 
                                onRequireLogin={() => setIsLoginModalOpen(true)} isGuest={currentUserRole==='guest'} viewMode={viewMode} setViewMode={setViewMode} 
                                sortBy={sortBy} setSortBy={setSortBy} onClearFilters={clearFilters} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} onEditCategory={setEditingCategory} 
                            />
                        } />
                        <Route path="/doc/:id" element={<DocPageRoute />} />
                        <Route path="/admin" element={<AdminPageRoute />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                )}
                
                <footer className="mt-16 text-center text-gray-400 dark:text-gray-600 font-mono text-[10px] uppercase tracking-widest pb-8">
                    <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
                </footer>
            </div>
            
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} context={loginContext} />}
            {editingDoc !== null && <DocumentEditorModal doc={editingDoc} onSave={handleSaveDocument} onClose={() => setEditingDoc(null)} availableCategories={categories} />}
            {editingCategory !== null && <CategoryEditorModal category={editingCategory} onSave={(cat) => {
                const exists = categories.find(c => c.id === cat.id);
                if (exists) setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
                else setCategories(prev => [...prev, cat]);
                setEditingCategory(null);
            }} onClose={() => setEditingCategory(null)} />}
        </div>
    );
};

const App: React.FC = () => ( <Router> <AppContent /> </Router> );
export default App;