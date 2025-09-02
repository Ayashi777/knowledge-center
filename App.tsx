import React, { useState, useRef, useEffect, forwardRef, createRef, useMemo } from 'react';
import { Category, Document, DocumentContent, IconName, UserRole } from './types';
import { CATEGORIES, RECENT_DOCUMENTS as initialDocuments } from './constants';
import { Icon } from './components/icons';
import { useI18n, Language } from './i18n';

const categoryPermissions = new Map(CATEGORIES.map(c => [c.nameKey, c.viewPermissions]));

type DownloadStatus = 'idle' | 'loading' | 'success';
type UploadStatus = 'idle' | 'loading' | 'success';
type ViewMode = 'grid' | 'list';
type SortBy = 'recent' | 'alpha';

// --- Utility Functions ---

function formatRelativeTime(date: Date, lang: Language, t: (key: string) => string): string {
    const now = new Date();
    const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) {
        return t('common.justNow');
    }
    
    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) {
        return rtf.format(diffMinutes, 'minute');
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
    }
    
    const diffDays = Math.round(diffHours / 24);
    if (Math.abs(diffDays) < 30) {
        return rtf.format(diffDays, 'day');
    }

    const diffMonths = Math.round(diffDays / 30);
    if(Math.abs(diffMonths) < 12) {
        return rtf.format(diffMonths, 'month');
    }
    
    const diffYears = Math.round(diffMonths/12);
    return rtf.format(diffYears, 'year');
}


// --- Reusable Child Components ---

const DocumentListItem = forwardRef<HTMLDivElement, { doc: Document, onClick: () => void, onEdit: () => void, onDelete: () => void, showAdminControls: boolean }>(({ doc, onClick, onEdit, onDelete, showAdminControls }, ref) => {
  const { t, lang } = useI18n();
  const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title;
  return (
    <div ref={ref} onClick={onClick} onKeyPress={(e) => e.key === 'Enter' && onClick()} className="flex items-start sm:items-center justify-between p-4 bg-white/80 dark:bg-gray-800/50 border-b border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-md group flex-col sm:flex-row gap-4" role="button" tabIndex={0}>
      <div className="flex-grow cursor-pointer">
        <p className='font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200'>
          {docTitle}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-blue-500 dark:text-blue-400 font-mono py-1 px-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">{t(doc.categoryKey)}</span>
            {doc.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                   <Icon name="tag" className="w-3 h-3"/> {tag}
                </div>
            ))}
        </div>
      </div>
      {showAdminControls ? (
        <div className="flex items-center gap-2 pl-0 sm:pl-4 self-end sm:self-center">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" aria-label={t('common.edit') + ' ' + docTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors" aria-label={t('common.delete') + ' ' + docTitle}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-500 font-mono whitespace-nowrap self-end sm:self-center">{formatRelativeTime(doc.updatedAt, lang, t)}</p>
      )}
    </div>
  );
});
DocumentListItem.displayName = 'DocumentListItem';

const DocumentThumbnail: React.FC<{ docTitle: string }> = ({ docTitle }) => (
    <div className="aspect-[3/4] bg-white dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-4 flex flex-col overflow-hidden">
        {/* Header with logos */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="text-lg font-black text-gray-700 dark:text-gray-300">CE</div>
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-600"></div>
                <p className="font-bold text-xs text-gray-600 dark:text-gray-400">ACME CORP</p>
            </div>
        </div>
        
        {/* Title */}
        <h3 className="text-[10px] leading-tight font-bold text-gray-800 dark:text-gray-100 mb-3 flex-shrink-0">{docTitle}</h3>
        
        {/* Fake content blocks */}
        <div className="space-y-1.5 flex-grow">
          {/* A block of text */}
          {[...Array(4)].map((_, i) => (
             <div key={`p1-${i}`} style={{width: `${[95, 100, 98, 90][i]}%`}} className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm"></div>
          ))}

          {/* A table-like structure */}
          <div className="!mt-4 space-y-1">
              {[...Array(5)].map((_, i) => (
                  <div key={`tbl-${i}`} className="flex gap-1.5">
                      <div className="h-1.5 bg-gray-300 dark:bg-gray-500 rounded-sm w-1/4"></div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm w-3/4"></div>
                  </div>
              ))}
          </div>

          {/* Another block of text */}
          <div className="!mt-4 space-y-1">
          {[...Array(3)].map((_, i) => (
             <div key={`p2-${i}`} style={{width: `${[100, 95, 50][i]}%`}} className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-sm"></div>
          ))}
          </div>
        </div>
    </div>
);


const DocumentGridItem: React.FC<{ doc: Document; onClick: () => void; onRequireLogin: () => void; isGuest: boolean }> = ({ doc, onClick, onRequireLogin, isGuest }) => {
  const { t } = useI18n();
  const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
        onRequireLogin();
    } else {
        alert('Downloading...');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
        navigator.share({
            title: docTitle,
            text: `Check out this document: ${docTitle}`,
            url: window.location.href,
        }).catch(console.error);
    } else {
        alert('Share functionality not available.');
    }
  };

  return (
    <div className="group cursor-pointer" onClick={onClick} onKeyPress={(e) => e.key === 'Enter' && onClick()} role="button" tabIndex={0}>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 group-hover:shadow-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 border border-gray-200 dark:border-gray-700/80 group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:-translate-y-1">
        <DocumentThumbnail docTitle={docTitle} />
      </div>
      <div className="pt-4 pb-2 px-1">
        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-3 truncate group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">{docTitle}</p>
        <div className="flex items-center gap-6 text-sm">
          <button onClick={handleDownload} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
            <Icon name="download" className="w-5 h-5" />
            <span className="font-medium">{t('common.download')}</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
            <Icon name="share" className="w-5 h-5" />
            <span className="font-medium">{t('common.share')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Admin & Access Control Components ---
const UserAccessControl: React.FC<{ role: UserRole; onLoginClick: () => void; onLogout: () => void; }> = ({ role, onLoginClick, onLogout }) => {
    const { t } = useI18n();
    return (
    <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('header.currentRole')}: <span className="font-bold text-blue-600 dark:text-blue-400 capitalize">{t(`roles.${role}`)}</span>
        </span>
        {role !== 'guest' ? (
            <button onClick={onLogout} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">{t('header.logout')}</button>
        ) : (
            <button onClick={onLoginClick} className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow">
                {t('header.login')}
            </button>
        )}
    </div>
)};

const LoginModal: React.FC<{ onLogin: (role: UserRole) => void; onClose: () => void; context: 'view' | 'download' | 'login' }> = ({ onLogin, onClose, context }) => {
    const { t } = useI18n();
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const roles: { role: UserRole, label: string, description: string }[] = [
        { role: 'foreman', label: t('loginModal.roles.foreman'), description: t('loginModal.roles.foremanDesc') },
        { role: 'designer', label: t('loginModal.roles.designer'), description: t('loginModal.roles.designerDesc') },
        { role: 'admin', label: t('loginModal.roles.admin'), description: t('loginModal.roles.adminDesc') },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-600/20 mb-4">
                        <Icon name="lock-closed" className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('loginModal.accessRequired')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t(`loginModal.context.${context}`)}</p>
                </div>
                <div className="space-y-3">
                    {roles.map(({ role, label, description }) => (
                        <button key={role} type="button" onClick={() => onLogin(role as UserRole)} className="w-full text-left p-4 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                            <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        </button>
                    ))}
                </div>
                 <div className="mt-6 text-center">
                    <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">{t('common.cancel')}</button>
                </div>
            </div>
        </div>
    );
};


const DocumentEditorModal: React.FC<{ doc: Partial<Document> | null, onSave: (doc: Partial<Document>) => void, onClose: () => void, availableCategories: Category[] }> = ({ doc, onSave, onClose, availableCategories }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState((doc?.titleKey ? t(doc.titleKey) : doc?.title) || '');
    const [category, setCategory] = useState(doc?.categoryKey || availableCategories[0]?.nameKey || '');
    const [tags, setTags] = useState(doc?.tags?.join(', ') || '');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const docToSave: Partial<Document> = {
            id: doc?.id,
            title: title, // Always save to raw title
            categoryKey: category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        onSave(docToSave);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="doc-title" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelTitle')}</label>
                        <input id="doc-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                     <div className="mb-4">
                        <label htmlFor="doc-category" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelCategory')}</label>
                        <select id="doc-category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                            {availableCategories.map(cat => <option key={cat.id} value={cat.nameKey}>{t(cat.nameKey)}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="doc-tags" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelTags')}</label>
                        <input id="doc-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('editorModal.placeholderTags')}/>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ThemeSwitcher: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const { t } = useI18n();
    return (
    <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('header.toggleTheme')}
    >
        {theme === 'light' ? <Icon name="moon" className="w-6 h-6" /> : <Icon name="sun" className="w-6 h-6" />}
    </button>
)};

const LanguageSwitcher: React.FC = () => {
    const { lang, setLang } = useI18n();
    
    return (
        <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full">
            <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${lang === 'en' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
                EN
            </button>
            <button
                onClick={() => setLang('uk')}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${lang === 'uk' ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}
            >
                UA
            </button>
        </div>
    );
};

// --- Page Views ---

const FilterSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="py-4 border-b border-gray-200 dark:border-gray-700">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left" aria-expanded={isOpen}>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <Icon name={isOpen ? 'minus' : 'plus'} className="w-4 h-4 text-gray-500" />
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
};

const Sidebar: React.FC<{
  visibleCategories: Category[],
  selectedCategory: string | null,
  onCategorySelect: (key: string | null) => void,
  allTags: string[],
  selectedTags: Set<string>,
  onTagSelect: (tag: string) => void
}> = ({ visibleCategories, selectedCategory, onCategorySelect, allTags, selectedTags, onTagSelect }) => {
    const { t } = useI18n();
    return (
        <aside className="w-full lg:w-64 lg:pr-8 flex-shrink-0">
            <h2 className="text-lg font-bold mb-2">{t('sidebar.filterBy')}</h2>
            <FilterSection title={t('sidebar.resourceType')}>
                <ul className="space-y-2 text-sm">
                    <li>
                        <button onClick={() => onCategorySelect(null)} className={`w-full text-left ${!selectedCategory ? 'font-bold text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>
                            {t('sidebar.allTypes')}
                        </button>
                    </li>
                    {visibleCategories.map(cat => (
                         <li key={cat.id}>
                            <button onClick={() => onCategorySelect(cat.nameKey)} className={`w-full text-left ${selectedCategory === cat.nameKey ? 'font-bold text-blue-600 dark:text-blue-400' : 'hover:text-blue-600 dark:hover:text-blue-400'}`}>
                                {t(cat.nameKey)}
                            </button>
                        </li>
                    ))}
                </ul>
            </FilterSection>
             <FilterSection title={t('sidebar.tags')}>
                <div className="space-y-2">
                    {allTags.map(tag => (
                        <label key={tag} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={selectedTags.has(tag)} onChange={() => onTagSelect(tag)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span>{tag}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </aside>
    );
}

const DashboardView: React.FC<{ 
  onSelectDoc: (doc: Document) => void, 
  onRequireLogin: () => void,
  isGuest: boolean,
  docRefs: React.RefObject<HTMLDivElement>[],
  searchTerm: string,
  onSearchChange: (term: string) => void,
  sortedDocs: Document[],
  showAdminControls: boolean,
  onEditDoc: (doc: Document) => void,
  onDeleteDoc: (id: string) => void,
  onAddNewDoc: () => void,
  selectedCategory: string | null,
  onCategorySelect: (categoryName: string | null) => void,
  visibleCategories: Category[],
  allTags: string[],
  selectedTags: Set<string>,
  onTagSelect: (tagName: string) => void,
  viewMode: ViewMode,
  setViewMode: (mode: ViewMode) => void,
  sortBy: SortBy,
  setSortBy: (sort: SortBy) => void,
  onClearFilters: () => void;
}> = ({ 
    onSelectDoc, onRequireLogin, isGuest, docRefs, searchTerm, onSearchChange, sortedDocs, showAdminControls, 
    onEditDoc, onDeleteDoc, onAddNewDoc, selectedCategory, onCategorySelect, visibleCategories,
    allTags, selectedTags, onTagSelect, viewMode, setViewMode, sortBy, setSortBy, onClearFilters
}) => {
    const { t } = useI18n();
    const hasActiveFilters = selectedCategory || selectedTags.size > 0;
    
    return (
  <>
    <header className="mb-8 text-center pt-16 sm:pt-12">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
      <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('dashboard.description')}</p>
    </header>
    <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar 
            visibleCategories={visibleCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagSelect={onTagSelect}
        />
        <main className="flex-grow">
            <div className="relative mb-6">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg>
              </div>
              <input 
                type="search" 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full rounded-md border-0 bg-gray-100 dark:bg-gray-800 py-3 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all" 
                placeholder={t('dashboard.searchPlaceholder')}
              />
            </div>

            <div className="flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{t('dashboard.sortBy')}</span>
                    <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                        <button onClick={() => setSortBy('recent')} className={`px-2 py-0.5 text-xs font-semibold rounded ${sortBy === 'recent' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>{t('dashboard.mostRecent')}</button>
                        <button onClick={() => setSortBy('alpha')} className={`px-2 py-0.5 text-xs font-semibold rounded ${sortBy === 'alpha' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>{t('dashboard.alphabetical')}</button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{t('dashboard.viewAs')}</span>
                     <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                        <button onClick={() => setViewMode('grid')} aria-label="Grid view" className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}><Icon name="view-grid" className="w-5 h-5"/></button>
                        <button onClick={() => setViewMode('list')} aria-label="List view" className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}><Icon name="view-list" className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-baseline mb-4">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('dashboard.results', { count: sortedDocs.length })}</p>
                {hasActiveFilters && <button onClick={onClearFilters} className="text-sm text-red-500 hover:underline">{t('common.resetFilters')}</button>}
            </div>

             {showAdminControls && (
                <div className="mb-4 text-right">
                    <button onClick={onAddNewDoc} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110 2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        <span>{t('common.add')}</span>
                    </button>
                </div>
            )}

            {sortedDocs.length > 0 ? (
                viewMode === 'grid' ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                        {sortedDocs.map((doc) => <DocumentGridItem key={doc.id} doc={doc} onClick={() => onSelectDoc(doc)} onRequireLogin={onRequireLogin} isGuest={isGuest} />)}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedDocs.map((doc, index) => <DocumentListItem key={doc.id} doc={doc} onClick={() => onSelectDoc(doc)} ref={docRefs[index]} onEdit={() => onEditDoc(doc)} onDelete={() => onDeleteDoc(doc.id)} showAdminControls={showAdminControls} />)}
                    </div>
                )
            ) : (
                <div className="text-center py-10 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noResults')}</p>
                <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">{t('dashboard.noResultsDescription')}</p>
                </div>
            )}

        </main>
    </div>
  </>
)};

const EditableField: React.FC<{ label: string; value: string; onChange: (value: string) => void; multiline?: boolean; rows?: number; }> = ({ label, value, onChange, multiline = false, rows = 4 }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
        rows={rows}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
      />
    )}
  </div>
);

const emptyContentTemplate: DocumentContent = {
    intro: '', section1Title: '', section1Body: '', section1List: '',
    section2Title: '', section2Body: '', importantNote: '',
    section3Title: '', section3Body: ''
};


const DocumentView: React.FC<{ doc: Document, onClose: () => void, onRequireLogin: () => void, currentUserRole: UserRole, onUpdateContent: (docId: string, lang: Language, newContent: DocumentContent) => void, onCategoryClick: (categoryKey: string) => void }> = ({ doc, onClose, onRequireLogin, currentUserRole, onUpdateContent, onCategoryClick }) => {
    const { t, lang } = useI18n();
    const [downloadStatuses, setDownloadStatuses] = useState<{ pdf: DownloadStatus; dwg: DownloadStatus }>({ pdf: 'idle', dwg: 'idle' });
    const [uploadStatuses, setUploadStatuses] = useState<{ pdf: UploadStatus; dwg: UploadStatus }>({ pdf: 'idle', dwg: 'idle' });
    
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState<DocumentContent>(doc.content[lang] as DocumentContent || emptyContentTemplate);

    useEffect(() => {
        setEditableContent(doc.content[lang] as DocumentContent || emptyContentTemplate)
    }, [doc, lang]);


    const handleDownload = (fileType: 'pdf' | 'dwg') => {
        if (currentUserRole === 'guest') {
            onRequireLogin();
            return;
        }

        setDownloadStatuses(prev => ({ ...prev, [fileType]: 'loading' }));
        setTimeout(() => setDownloadStatuses(prev => ({ ...prev, [fileType]: 'success' })), 1500);
        setTimeout(() => setDownloadStatuses(prev => ({ ...prev, [fileType]: 'idle' })), 3500);
    };

    const handleFileUpload = (fileType: 'pdf' | 'dwg', file: File) => {
        console.log(`Uploading ${file.name} for ${fileType}`);
        setUploadStatuses(prev => ({...prev, [fileType]: 'loading'}));
        setTimeout(() => setUploadStatuses(prev => ({...prev, [fileType]: 'success'})), 1500);
        setTimeout(() => setUploadStatuses(prev => ({...prev, [fileType]: 'idle'})), 3500);
    };

    const handleSaveContent = () => {
        onUpdateContent(doc.id, lang, editableContent);
        setIsEditingContent(false);
    }
    
    const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';
    const currentContent = doc.content[lang] || emptyContentTemplate;
    
    const MiniUploadButton: React.FC<{ onFileSelect: (file: File) => void; status: UploadStatus; }> = ({ onFileSelect, status }) => {
        const inputRef = useRef<HTMLInputElement>(null);
        if (status !== 'idle') {
            const statusText = status === 'loading' ? t('common.uploading') : t('common.completed');
            return <span className={`text-xs ${status === 'success' ? 'text-green-600' : 'text-gray-500'}`}>{statusText}</span>;
        }
        return (
            <>
                <input type="file" ref={inputRef} className="hidden" onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
                <button onClick={() => inputRef.current?.click()} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    {t('docView.uploadNewLabel')}
                </button>
            </>
        )
    }

    const renderFileAction = (fileType: 'pdf' | 'dwg') => {
        const textKey = fileType === 'pdf' ? 'docView.downloadPdf' : 'docView.downloadDwg';
        const iconName = fileType;
        const status = downloadStatuses[fileType];

        const statusContent = {
            loading: <><Icon name="loading" className="w-4 h-4"/><span>{t('common.loading')}</span></>,
            success: <><Icon name="check-circle" className="w-4 h-4 text-green-500"/><span>{t('common.completed')}</span></>,
            idle: <>{t('common.download')}</>
        };

        return (
            <div key={fileType} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700/80 transition-shadow hover:shadow-md dark:hover:shadow-black/20">
                <div className="flex items-center gap-3">
                    <Icon name={iconName} className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{doc.id}-{fileType}.{fileType}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">1.2 MB</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <button
                        onClick={() => handleDownload(fileType)}
                        disabled={status !== 'idle'}
                        className="flex items-center justify-center gap-1.5 px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md transition-colors w-28 text-center disabled:opacity-70 disabled:cursor-wait"
                    >
                        {statusContent[status]}
                    </button>
                    {currentUserRole === 'admin' && <MiniUploadButton onFileSelect={(file) => handleFileUpload(fileType, file)} status={uploadStatuses[fileType]} />}
                </div>
            </div>
        );
    };

    return (
        <div className="animate-fade-in pt-16 sm:pt-12">
            <header className="mb-4">
                <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex flex-wrap items-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="hover:text-blue-600 dark:hover:text-blue-400">{t('dashboard.title')}</a>
                    <span className="mx-2">/</span>
                    <button onClick={() => onCategoryClick(doc.categoryKey)} className="hover:text-blue-600 dark:hover:text-blue-400 text-left">
                        {t(doc.categoryKey)}
                    </button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 dark:text-gray-200">{docTitle}</span>
                </nav>
                <button onClick={onClose} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                    {t('docView.backToList')}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                <main className="lg:w-2/3 order-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">{docTitle}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
                        <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">{t('docView.lastUpdated')}: {formatRelativeTime(doc.updatedAt, lang, t)}</p>
                        <div className="flex flex-wrap gap-2">
                             {doc.tags.map(tag => (
                                <div key={tag} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                    <Icon name="tag" className="w-3 h-3"/> {tag}
                                </div>
                            ))}
                        </div>
                    </div>

                    { isEditingContent ? (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-500/50">
                            <EditableField label={t('docView.content.toc.intro')} value={editableContent.intro || ''} onChange={val => setEditableContent(p => ({...p, intro: val}))} multiline />
                            <EditableField label={t('docView.content.toc.s1')} value={editableContent.section1Title || ''} onChange={val => setEditableContent(p => ({...p, section1Title: val}))} />
                            <EditableField label={`${t('docView.content.toc.s1')} Body`} value={editableContent.section1Body || ''} onChange={val => setEditableContent(p => ({...p, section1Body: val}))} multiline />
                            <EditableField label={`${t('docView.content.toc.s1')} List`} value={editableContent.section1List || ''} onChange={val => setEditableContent(p => ({...p, section1List: val}))} multiline rows={3} />
                             <EditableField label={t('docView.content.toc.s2')} value={editableContent.section2Title || ''} onChange={val => setEditableContent(p => ({...p, section2Title: val}))} />
                            <EditableField label={`${t('docView.content.toc.s2')} Body`} value={editableContent.section2Body || ''} onChange={val => setEditableContent(p => ({...p, section2Body: val}))} multiline />
                             <EditableField label={t('docView.content.importantNoteLabel')} value={editableContent.importantNote || ''} onChange={val => setEditableContent(p => ({...p, importantNote: val}))} multiline />
                            <EditableField label={t('docView.content.toc.s3')} value={editableContent.section3Title || ''} onChange={val => setEditableContent(p => ({...p, section3Title: val}))} />
                            <EditableField label={`${t('docView.content.toc.s3')} Body`} value={editableContent.section3Body || ''} onChange={val => setEditableContent(p => ({...p, section3Body: val}))} multiline />
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                            <p id="intro">{currentContent.intro}</p>
                            <h3 id="section1">{currentContent.section1Title}</h3>
                            <p>{currentContent.section1Body}</p>
                            <ul className="list-disc pl-5 space-y-1">
                                {(currentContent.section1List || '').split('\n').map((item, i) => item && <li key={i}>{item}</li>)}
                            </ul>
                            <h3 id="section2">{currentContent.section2Title}</h3>
                            <p>{currentContent.section2Body}</p>
                            {currentContent.importantNote && (
                                <blockquote className="note">
                                    <div className="flex items-start gap-3">
                                        <Icon name="information-circle" className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-1" />
                                        <p><strong>{currentContent.importantNote}</strong></p>
                                    </div>
                                </blockquote>
                            )}
                            <h3 id="section3">{currentContent.section3Title}</h3>
                            <p>{currentContent.section3Body}</p>
                        </div>
                    )}
                </main>
                <aside className="lg:w-1/3 order-2 lg:order-none">
                     <div className="sticky top-24 space-y-8">
                        <div className="p-5 bg-slate-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">{t('docView.tableOfContents')}</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#intro" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('docView.content.toc.intro')}</a></li>
                                <li><a href="#section1" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('docView.content.toc.s1')}</a></li>
                                <li><a href="#section2" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('docView.content.toc.s2')}</a></li>
                                <li><a href="#section3" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('docView.content.toc.s3')}</a></li>
                                <li><a href="#appendix" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">{t('docView.content.toc.appendix')}</a></li>
                            </ul>
                        </div>
                        <div>
                           <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3" id="appendix">{t('docView.downloadFiles')}</h4>
                           <div className="space-y-3">
                                {renderFileAction('pdf')}
                                {renderFileAction('dwg')}
                           </div>
                        </div>
                         {currentUserRole === 'admin' && (
                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                                {!isEditingContent ? (
                                    <button onClick={() => setIsEditingContent(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
                                        {t('docView.editContent')}
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingContent(false)} className="w-full px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors text-sm">{t('common.cancel')}</button>
                                        <button onClick={handleSaveContent} className="w-full px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors text-sm">{t('common.save')}</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
             <style>{`
                .note {
                    background-color: #EFF6FF; /* blue-50 */
                    border-left-color: #3B82F6; /* blue-500 */
                    border-left-width: 4px;
                    padding: 1rem;
                    margin-top: 1.5em;
                    margin-bottom: 1.5em;
                    border-radius: 0.25rem;
                }
                .dark .note {
                    background-color: rgba(37, 99, 235, 0.1); /* blue-600 with alpha */
                    border-left-color: #60A5FA; /* blue-400 */
                }
                .note p {
                    margin: 0 !important;
                    color: #1E40AF !important; /* blue-800 */
                }
                .dark .note p {
                    color: #BFDBFE !important; /* blue-200 */
                }
                .prose blockquote {
                    font-style: normal;
                    color: inherit;
                }
                .dark .prose blockquote {
                    color: inherit;
                }
            `}</style>
        </div>
    );
};


// --- Main App Component ---

const App: React.FC = () => {
  const { t, lang } = useI18n();
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('guest');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginContext, setLoginContext] = useState<'view' | 'download' | 'login'>('login');

  const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light'
  );
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  
  const docListRefs = useRef(documents.map(() => createRef<HTMLDivElement>()));

  const visibleCategories = useMemo(() => {
    return CATEGORIES.filter(cat => cat.viewPermissions.includes(currentUserRole));
  }, [currentUserRole]);
  
  const visibleCategoryKeys = useMemo(() => new Set(visibleCategories.map(c => c.nameKey)), [visibleCategories]);
  
  const visibleDocuments = useMemo(() => {
      return documents.filter(doc => visibleCategoryKeys.has(doc.categoryKey));
  }, [documents, visibleCategoryKeys]);

  const allTags = useMemo(() => {
      const tags = new Set<string>();
      visibleDocuments.forEach(doc => {
          doc.tags.forEach(tag => tags.add(tag));
      });
      return Array.from(tags).sort();
  }, [visibleDocuments]);

  const sortedAndFilteredDocs = useMemo(() => {
    let docs = visibleDocuments;

    if (selectedCategory) {
      docs = docs.filter(doc => doc.categoryKey === selectedCategory);
    }

    if (selectedTags.size > 0) {
      docs = docs.filter(doc => doc.tags.some(tag => selectedTags.has(tag)));
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      docs = docs.filter(doc => {
        const title = doc.titleKey ? t(doc.titleKey) : doc.title;
        return title?.toLowerCase().includes(lowerSearchTerm) ||
        t(doc.categoryKey).toLowerCase().includes(lowerSearchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
      });
    }

    const sorted = [...docs];
    if (sortBy === 'alpha') {
        sorted.sort((a, b) => {
            const titleA = a.titleKey ? t(a.titleKey) : a.title || '';
            const titleB = b.titleKey ? t(b.titleKey) : b.title || '';
            return titleA.localeCompare(titleB, lang);
        });
    } else { // 'recent'
        sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    return sorted;
  }, [searchTerm, visibleDocuments, selectedCategory, selectedTags, t, sortBy, lang]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t('title');
  }, [lang, t]);


  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleSelectDoc = (doc: Document) => {
    const permissions = categoryPermissions.get(doc.categoryKey) || [];
    if (!permissions.includes(currentUserRole)) {
        setLoginContext('view');
        setIsLoginModalOpen(true);
        return;
    }

    setSelectedDoc(doc);
    window.scrollTo(0, 0);
  };
  
  const handleCloseDoc = () => {
    setSelectedDoc(null);
  };

  const handleBreadcrumbCategoryClick = (categoryKey: string) => {
    setSelectedDoc(null);
    setSelectedCategory(categoryKey);
  };
  
  const handleRequireLogin = () => {
      setLoginContext('download');
      setIsLoginModalOpen(true);
  };

  const handleLogin = (role: UserRole) => {
    setCurrentUserRole(role);
    setIsLoginModalOpen(false);
    setSelectedTags(new Set()); // Reset tags on role change
  };

  const handleLogout = () => {
    if (selectedDoc && !categoryPermissions.get(selectedDoc.categoryKey)?.includes('guest')) {
      setSelectedDoc(null);
    }
    if (selectedCategory && !CATEGORIES.find(c => c.nameKey === selectedCategory)?.viewPermissions.includes('guest')) {
      setSelectedCategory(null);
    }
    setCurrentUserRole('guest');
    setSelectedTags(new Set());
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
            content: {
                en: { ...emptyContentTemplate },
                uk: { ...emptyContentTemplate },
            }
        };
        setDocuments([newDoc, ...documents]);
    }
    setEditingDoc(null);
  };
  
  const handleUpdateDocumentContent = (docId: string, lang: Language, newContent: DocumentContent) => {
      setDocuments(prevDocs => prevDocs.map(doc => {
          if (doc.id === docId) {
              const updatedDoc = {
                  ...doc,
                  updatedAt: new Date(),
                  content: {
                      ...doc.content,
                      [lang]: newContent,
                  }
              };
              // if we are on the page of the selected doc, update it
              if(selectedDoc?.id === docId) {
                  setSelectedDoc(updatedDoc);
              }
              return updatedDoc;
          }
          return doc;
      }));
  };

  const handleDeleteDocument = (id: string) => {
    if (window.confirm(t('dashboard.confirmDelete'))) {
        setDocuments(documents.filter(d => d.id !== id));
    }
  };
  
  const handleCategorySelect = (categoryKey: string | null) => {
    setSelectedCategory(categoryKey);
  };
  
  const handleTagSelect = (tagName: string) => {
    setSelectedTags(prev => {
      const newTags = new Set(prev);
      if (newTags.has(tagName)) {
        newTags.delete(tagName);
      } else {
        newTags.add(tagName);
      }
      return newTags;
    });
  };
  
  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSelectedTags(new Set());
    setSearchTerm('');
  };

  const showAdminControls = currentUserRole === 'admin';


  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 dark:bg-gray-900 dark:text-gray-200 font-sans antialiased transition-colors duration-300 ${showAdminControls ? 'outline outline-4 outline-offset-[-4px] outline-blue-500' : ''}`}>
      <header className="fixed top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-slate-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-gray-800/50">
          <UserAccessControl 
              role={currentUserRole}
              onLoginClick={() => { setLoginContext('login'); setIsLoginModalOpen(true); }}
              onLogout={handleLogout}
          />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
          </div>
      </header>

      <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 relative">
        {selectedDoc ? (
          <DocumentView 
            doc={selectedDoc} 
            onClose={handleCloseDoc} 
            onRequireLogin={handleRequireLogin}
            currentUserRole={currentUserRole}
            onUpdateContent={handleUpdateDocumentContent}
            onCategoryClick={handleBreadcrumbCategoryClick}
          />
        ) : (
          <DashboardView 
            onSelectDoc={handleSelectDoc} 
            docRefs={docListRefs.current}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortedDocs={sortedAndFilteredDocs}
            showAdminControls={showAdminControls}
            onEditDoc={(doc) => setEditingDoc(doc)}
            onDeleteDoc={handleDeleteDocument}
            onAddNewDoc={() => setEditingDoc({})}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            visibleCategories={visibleCategories}
            allTags={allTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onRequireLogin={handleRequireLogin}
            isGuest={currentUserRole==='guest'}
            viewMode={viewMode}
            setViewMode={setViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onClearFilters={handleClearFilters}
          />
        )}
        
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-600 font-mono text-sm">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </footer>
      </div>
      
      {isLoginModalOpen && <LoginModal onLogin={handleLogin} onClose={() => setIsLoginModalOpen(false)} context={loginContext} />}
      
      {editingDoc !== null && (
          <DocumentEditorModal 
              doc={editingDoc}
              onSave={handleSaveDocument}
              onClose={() => setEditingDoc(null)}
              availableCategories={visibleCategories}
          />
      )}

      <style>{`
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .prose {
          --tw-prose-body: #374151;
          --tw-prose-headings: #111827;
          --tw-prose-lead: #4b5563;
          --tw-prose-links: #1d4ed8;
          --tw-prose-bold: #111827;
          --tw-prose-counters: #6b7280;
          --tw-prose-bullets: #d1d5db;
          --tw-prose-hr: #e5e7eb;
          --tw-prose-quotes: #111827;
          --tw-prose-quote-borders: #e5e7eb;
          --tw-prose-captions: #6b7280;
          --tw-prose-code: #111827;
          --tw-prose-pre-code: #e5e7eb;
          --tw-prose-pre-bg: #1f2937;
          --tw-prose-td-borders: #e5e7eb;
          --tw-prose-invert-body: #d1d5db;
          --tw-prose-invert-headings: #fff;
          --tw-prose-invert-lead: #9ca3af;
          --tw-prose-invert-links: #60a5fa;
          --tw-prose-invert-bold: #fff;
          --tw-prose-invert-counters: #9ca3af;
          --tw-prose-invert-bullets: #4b5563;
          --tw-prose-invert-hr: #374151;
          --tw-prose-invert-quotes: #f3f4f6;
          --tw-prose-invert-quote-borders: #374151;
          --tw-prose-invert-captions: #9ca3af;
          --tw-prose-invert-code: #fff;
          --tw-prose-invert-pre-code: #d1d5db;
          --tw-prose-invert-pre-bg: rgb(0 0 0 / 50%);
          --tw-prose-invert-th-borders: #4b5563;
          --tw-prose-invert-td-borders: #374151;
        }
      `}</style>
    </div>
  );
};

export default App;