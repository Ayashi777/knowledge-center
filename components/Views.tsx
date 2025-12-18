import React, { useState, useRef, useEffect } from 'react';
import { Document, Category, UserRole, ViewMode, SortBy, DocumentContent, DownloadStatus, UploadStatus } from '../types';
import { useI18n, Language } from '../i18n';
import { Icon } from './icons';
import { Sidebar } from './Sidebar';
import { DocumentGridItem, DocumentListItem } from './DocumentComponents';
import { formatRelativeTime } from '../utils/format';
import { EditableField } from './UI';
import { listDocumentFiles } from '../utils/storage';

export const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useI18n();
    if (totalPages <= 1) return null;
    const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav className="flex items-center justify-center gap-2 sm:gap-4 mt-8" aria-label="Pagination">
            <button onClick={handlePrev} disabled={currentPage === 1} className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">{t('pagination.prev')}</button>
            <div className="hidden sm:flex items-center gap-2">{pageNumbers.map(number => (<button key={number} onClick={() => onPageChange(number)} aria-current={currentPage === number ? 'page' : undefined} className={`px-4 py-2 text-sm font-medium border rounded-md ${currentPage === number ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'}`}>{number}</button>))}</div>
            <span className="sm:hidden text-sm text-gray-600 dark:text-gray-400">{currentPage} / {totalPages}</span>
            <button onClick={handleNext} disabled={currentPage === totalPages} className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">{t('pagination.next')}</button>
        </nav>
    );
};

export const DashboardView: React.FC<{ 
  onSelectDoc: (doc: Document) => void, onRequireLogin: () => void, isGuest: boolean, searchTerm: string, onSearchChange: (term: string) => void, docs: Document[], totalDocsCount: number, showAdminControls: boolean, onEditDoc: (doc: Document) => void, onDeleteDoc: (id: string) => void, onAddNewDoc: () => void, selectedCategory: string | null, onCategorySelect: (categoryName: string | null) => void, visibleCategories: Category[], allTags: string[], selectedTags: Set<string>, onTagSelect: (tagName: string) => void, viewMode: ViewMode, setViewMode: (mode: ViewMode) => void, sortBy: SortBy, setSortBy: (sort: SortBy) => void, onClearFilters: () => void; currentPage: number; totalPages: number; onPageChange: (page: number) => void; onEditCategory: (cat: Category) => void;
}> = ({ onSelectDoc, onRequireLogin, isGuest, searchTerm, onSearchChange, docs, totalDocsCount, showAdminControls, onEditDoc, onDeleteDoc, onAddNewDoc, selectedCategory, onCategorySelect, visibleCategories, allTags, selectedTags, onTagSelect, viewMode, setViewMode, sortBy, setSortBy, onClearFilters, currentPage, totalPages, onPageChange, onEditCategory }) => {
    const { t } = useI18n();
    return (
  <>
    <header className="mb-8 text-center pt-16 sm:pt-12"><h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">{t('dashboard.title')}</h1><p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('dashboard.description')}</p></header>
    <div className="flex flex-col lg:flex-row gap-8">
        <Sidebar visibleCategories={visibleCategories} selectedCategory={selectedCategory} onCategorySelect={onCategorySelect} allTags={allTags} selectedTags={selectedTags} onTagSelect={onTagSelect} showAdminControls={showAdminControls} onEditCategory={onEditCategory} />
        <main className="flex-grow">
            <div className="relative mb-6"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><svg className="h-5 w-5 text-gray-400 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /></svg></div><input type="search" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="block w-full rounded-md border-0 bg-gray-100 dark:bg-gray-800 py-3 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-all" placeholder={t('dashboard.searchPlaceholder')} /></div>
            <div className="flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 gap-4"><div className="flex items-center gap-4"><span className="text-sm font-medium">{t('dashboard.sortBy')}</span><div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md"><button onClick={() => setSortBy('recent')} className={`px-2 py-0.5 text-xs font-semibold rounded ${sortBy === 'recent' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>{t('dashboard.mostRecent')}</button><button onClick={() => setSortBy('alpha')} className={`px-2 py-0.5 text-xs font-semibold rounded ${sortBy === 'alpha' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>{t('dashboard.alphabetical')}</button></div></div><div className="flex items-center gap-2"><span className="text-sm font-medium">{t('dashboard.viewAs')}</span><div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md"><button onClick={() => setViewMode('grid')} aria-label="Grid view" className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}><Icon name="view-grid" className="w-5 h-5"/></button><button onClick={() => setViewMode('list')} aria-label="List view" className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}><Icon name="view-list" className="w-5 h-5"/></button></div></div></div>
            <div className="flex justify-between items-baseline mb-4"><p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('dashboard.results', { count: totalDocsCount })}</p>{(selectedCategory || selectedTags.size > 0) && <button onClick={onClearFilters} className="text-sm text-red-500 hover:underline">{t('common.resetFilters')}</button>}</div>
            {showAdminControls && (<div className="mb-4 text-right"><button onClick={onAddNewDoc} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"><Icon name="plus" className="h-5 w-5" /><span>{t('common.add')}</span></button></div>)}
            {docs.length > 0 ? (viewMode === 'grid' ? (<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">{docs.map((doc) => <DocumentGridItem key={doc.id} doc={doc} onClick={() => onSelectDoc(doc)} onRequireLogin={onRequireLogin} isGuest={isGuest} />)}</div>) : (<div className="space-y-3">{docs.map((doc) => <DocumentListItem key={doc.id} doc={doc} onClick={() => onSelectDoc(doc)} onEdit={() => onEditDoc(doc)} onDelete={() => onDeleteDoc(doc.id)} showAdminControls={showAdminControls} />)}</div>)) : (<div className="text-center py-10 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg"><p className="text-gray-500 dark:text-gray-400">{t('dashboard.noResults')}</p><p className="text-gray-600 dark:text-gray-500 text-sm mt-1">{t('dashboard.noResultsDescription')}</p></div>)}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </main>
    </div>
  </>
)};

const emptyContentTemplate: DocumentContent = { intro: '', section1Title: '', section1Body: '', section1List: '', section2Title: '', section2Body: '', importantNote: '', section3Title: '', section3Body: '' };

export const DocumentView: React.FC<{ doc: Document, onClose: () => void, onRequireLogin: () => void, currentUserRole: UserRole, onUpdateContent: (docId: string, lang: Language, newContent: DocumentContent) => void, onCategoryClick: (categoryKey: string) => void }> = ({ doc, onClose, onRequireLogin, currentUserRole, onUpdateContent, onCategoryClick }) => {
    const { t, lang } = useI18n();
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState<DocumentContent>(doc.content[lang] as DocumentContent || emptyContentTemplate);
    const [files, setFiles] = useState<{name: string, url: string, extension?: string}[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);

    useEffect(() => { setEditableContent(doc.content[lang] as DocumentContent || emptyContentTemplate) }, [doc, lang]);

    useEffect(() => {
        const loadFiles = async () => {
            setIsLoadingFiles(true);
            const docFiles = await listDocumentFiles(doc.id);
            setFiles(docFiles);
            setIsLoadingFiles(false);
        };
        loadFiles();
    }, [doc.id]);

    const handleSaveContent = () => { onUpdateContent(doc.id, lang, editableContent); setIsEditingContent(false); }
    
    const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';
    const currentContent = doc.content[lang] || emptyContentTemplate;

    return (
        <div className="animate-fade-in pt-16 sm:pt-12">
            <header className="mb-4">
                <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex flex-wrap items-center">
                    <button onClick={onClose} className="hover:text-blue-600">{t('dashboard.title')}</button>
                    <span className="mx-2">/</span>
                    <button onClick={() => onCategoryClick(doc.categoryKey)} className="hover:text-blue-600">{t(doc.categoryKey)}</button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 dark:text-gray-200">{docTitle}</span>
                </nav>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                <main className="lg:w-2/3 order-1">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">{docTitle}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8">
                        <p className="text-xs text-gray-500 font-mono">{t('docView.lastUpdated')}: {formatRelativeTime(doc.updatedAt, lang, t)}</p>
                        <div className="flex flex-wrap gap-2">{doc.tags?.map(tag => (<div key={tag} className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md"><Icon name="tag" className="w-3 h-3"/> {tag}</div>))}</div>
                    </div>

                    { isEditingContent ? (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-500/50">
                            <EditableField label={t('docView.content.toc.intro')} value={editableContent.intro || ''} onChange={val => setEditableContent(p => ({...p, intro: val}))} multiline />
                            <EditableField label={t('docView.content.toc.s1')} value={editableContent.section1Title || ''} onChange={val => setEditingContent && setEditableContent(p => ({...p, section1Title: val}))} />
                            <EditableField label="Body" value={editableContent.section1Body || ''} onChange={val => setEditableContent(p => ({...p, section1Body: val}))} multiline />
                            <EditableField label="List" value={editableContent.section1List || ''} onChange={val => setEditableContent(p => ({...p, section1List: val}))} multiline rows={3} />
                             <EditableField label={t('docView.content.toc.s2')} value={editableContent.section2Title || ''} onChange={val => setEditableContent(p => ({...p, section2Title: val}))} />
                            <EditableField label="Body" value={editableContent.section2Body || ''} onChange={val => setEditableContent(p => ({...p, section2Body: val}))} multiline />
                             <EditableField label={t('docView.content.importantNoteLabel')} value={editableContent.importantNote || ''} onChange={val => setEditableContent(p => ({...p, importantNote: val}))} multiline />
                            <EditableField label={t('docView.content.toc.s3')} value={editableContent.section3Title || ''} onChange={val => setEditableContent(p => ({...p, section3Title: val}))} />
                            <EditableField label="Body" value={editableContent.section3Body || ''} onChange={val => setEditableContent(p => ({...p, section3Body: val}))} multiline />
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                            <p>{currentContent.intro}</p>
                            <h3>{currentContent.section1Title}</h3>
                            <p>{currentContent.section1Body}</p>
                            <ul className="list-disc pl-5 space-y-1">{(currentContent.section1List || '').split('\n').map((item, i) => item && <li key={i}>{item}</li>)}</ul>
                            <h3>{currentContent.section2Title}</h3>
                            <p>{currentContent.section2Body}</p>
                            {currentContent.importantNote && (<blockquote className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-md my-6"><div className="flex items-start gap-3"><Icon name="information-circle" className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" /><p className="m-0 text-blue-800 dark:text-blue-200 font-bold">{currentContent.importantNote}</p></div></blockquote>)}
                            <h3>{currentContent.section3Title}</h3>
                            <p>{currentContent.section3Body}</p>
                        </div>
                    )}
                </main>
                <aside className="lg:w-1/3 order-2 lg:order-none">
                     <div className="sticky top-24 space-y-8">
                        <div>
                           <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-sm uppercase tracking-wider">{t('docView.downloadFiles')}</h4>
                           <div className="space-y-3">
                                {isLoadingFiles ? (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm"><Icon name="loading" className="w-4 h-4" /> Loading files...</div>
                                ) : (
                                    files.map(file => (
                                        <div key={file.name} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700/80 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <Icon name={file.extension === 'pdf' ? 'pdf' : 'hr'} className="w-7 h-7 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs truncate max-w-[120px] dark:text-white" title={file.name}>{file.name}</p>
                                                    <p className="text-[9px] text-gray-500 uppercase font-black">{file.extension}</p>
                                                </div>
                                            </div>
                                            <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors">
                                                <Icon name="download" className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))
                                )}
                                {!isLoadingFiles && files.length === 0 && <p className="text-xs text-gray-400 italic">No files available for this document.</p>}
                           </div>
                        </div>
                        {currentUserRole === 'admin' && (<div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700/50">{!isEditingContent ? (<button onClick={() => setIsEditingContent(true)} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-500/20">{t('docView.editContent')}</button>) : (<div className="flex gap-2"><button onClick={() => setIsEditingContent(false)} className="w-full px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-bold">{t('common.cancel')}</button><button onClick={handleSaveContent} className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-bold shadow-lg shadow-green-500/20">{t('common.save')}</button></div>)}</div>)}
                    </div>
                </aside>
            </div>
        </div>
    );
};
