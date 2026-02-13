
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Document, UserRole, Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';
import { getCategoryName, formatRelativeTime } from '@shared/lib/utils/format';

const QUILL_CONTENT_STYLES = `
    .modal-quill-content {
        color: #1a1a1a;
        line-height: 1.6;
    }
    .dark .modal-quill-content {
        color: #f1f5f9;
    }
    .modal-quill-content h1 { font-size: 2.5rem; font-weight: 900; margin: 3rem 0 1.5rem; color: #111827; line-height: 1.1; letter-spacing: -0.03em; }
    .modal-quill-content h2 { font-size: 1.75rem; font-weight: 800; margin: 2.5rem 0 1.25rem; color: #111827; letter-spacing: -0.02em; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; display: inline-block; }
    .modal-quill-content h3 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #1f2937; }
    .modal-quill-content p { font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.5rem; color: #374151; }
    .modal-quill-content ul, .modal-quill-content ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
    .modal-quill-content li { margin-bottom: 0.5rem; color: #374151; }
    .modal-quill-content img { border-radius: 1.5rem; margin: 2.5rem 0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15); max-width: 100%; height: auto; }
    .dark .modal-quill-content h1, .dark .modal-quill-content h2, .dark .modal-quill-content h3 { color: #f9fafb; }
    .dark .modal-quill-content p, .dark .modal-quill-content li { color: #d1d5db; }
    .modal-quill-content { overflow-x: hidden; overflow-wrap: anywhere; word-break: break-word; }
`;

const AccessDenied: React.FC<{ doc: Document; onRequireLogin: () => void; onClose: () => void }> = ({ doc, onRequireLogin, onClose }) => {
    const { t } = useI18n();
    const requiredRoles = doc.viewPermissions?.map(role => t(`roles.${role}`)).join(', ') || t('roles.guest');

    return (
        <div className="text-center py-20 px-8">
            <div className="w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 dark:text-yellow-400 rounded-[2rem] mx-auto flex items-center justify-center mb-8 shadow-xl shadow-yellow-500/10">
                <Icon name="lock-closed" className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-4">{t('docView.accessDenied')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-10 font-bold max-w-md mx-auto leading-relaxed">
                {t('docView.accessRequiredForRoles', { roles: requiredRoles })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                    onClick={onRequireLogin} 
                    className="w-full sm:w-auto py-5 px-10 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/40 hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95">
                    {t('header.login')}
                </button>
                <button 
                    onClick={onClose} 
                    className="w-full sm:w-auto py-5 px-10 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                    {t('common.back')}
                </button>
            </div>
        </div>
    )
}

export const DocumentModal: React.FC<{
    doc: Document | null;
    onClose: () => void;
    onRequireLogin: () => void;
    currentUserRole: UserRole;
    allTags?: Tag[];
    hasAccess: boolean;
}> = ({ doc, onClose, onRequireLogin, currentUserRole, allTags = [], hasAccess }) => {
    const { t, lang } = useI18n();
    const [files, setFiles] = useState<{ name: string; url: string; extension?: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const loadFiles = useCallback(async () => {
        if (!doc || !hasAccess) {
            setIsLoadingFiles(false);
            return;
        }
        setIsLoadingFiles(true);
        try {
            const docFiles = await StorageApi.listDocumentFiles(doc.id);
            setFiles(docFiles);
        } finally { setIsLoadingFiles(false); }
    }, [doc, hasAccess]);

    useEffect(() => { 
        loadFiles();
    }, [loadFiles]);

    const { viewHtml, title, categoryName, lastUpdated } = useMemo(() => {
        if (!doc) return { viewHtml: '', title: '', categoryName: '', lastUpdated: '' };

        const content = doc.content?.[lang]?.html || doc.content?.['uk']?.html || '';
        const sanitizedHtml = DOMPurify.sanitize(content);
        const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title;
        const catName = getCategoryName(doc.categoryKey, t);
        const updated = formatRelativeTime(doc.updatedAt, lang);

        return { viewHtml: sanitizedHtml, title: docTitle, categoryName: catName, lastUpdated: updated };
    }, [doc, lang, t]);

    if (!doc) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[50] flex items-center justify-center p-4 sm:p-6 lg:p-10 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <style>{QUILL_CONTENT_STYLES}</style>
            <div 
                className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden border border-white/10 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Title and Category */}
                 <header className="flex-shrink-0 px-10 py-8 flex justify-between items-start border-b border-gray-100 dark:border-gray-800">
                    <div className="flex-grow min-w-0 pr-12">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                                {categoryName}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {t('docView.lastUpdated')}: {lastUpdated}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                            {title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-2xl transition-all active:scale-90">
                        <Icon name="x-mark" className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900">
                    {!hasAccess ? (
                        <AccessDenied doc={doc} onRequireLogin={onRequireLogin} onClose={onClose} />
                    ) : (
                        <div className="max-w-4xl mx-auto px-10 py-12">
                            <article className="modal-quill-content animate-fade-in" dangerouslySetInnerHTML={{ __html: viewHtml }} />
                        </div>
                    )}
                </div>

                {hasAccess && (
                     <footer className="flex-shrink-0 px-10 py-8 bg-slate-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest mb-1">{t('docView.downloadFiles')}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Доступно для завантаження: {files.length} шт.</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                {files.length > 0 ? (
                                    files.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                                        >
                                            <Icon name="download" className="w-4 h-4" />
                                            <span>{file.name.split('.').pop() || 'File'}</span>
                                        </a>
                                    ))
                                ) : (
                                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-2 border-dashed border-gray-100 dark:border-gray-800 px-6 py-3 rounded-2xl">
                                        {isLoadingFiles ? 'Loading...' : t('docView.filesEmpty')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};
