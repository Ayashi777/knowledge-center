
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { Document, UserRole, Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';
import { getCategoryName, formatTimestamp } from '@shared/lib/utils/format';
import { DocumentFileList } from '@/widgets/DocumentView/ui/DocumentFileList';

const QUILL_CONTENT_STYLES = `
    .modal-quill-content h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem; color: #111827; }
    .dark .modal-quill-content h1 { color: #f9fafb; }
    .modal-quill-content h2 { font-size: 1.5rem; font-weight: 700; margin: 2rem 0 1rem; color: #1f2937; }
    .dark .modal-quill-content h2 { color: #e5e7eb; }
    .modal-quill-content p { font-size: 1rem; line-height: 1.7; margin-bottom: 1.25rem; color: #374151; }
    .dark .modal-quill-content p { color: #d1d5db; }
    .modal-quill-content img { border-radius: 0.75rem; margin: 1.5rem 0; max-width: 100%; }
    .modal-quill-content a { color: #2563eb; text-decoration: underline; }
    .dark .modal-quill-content a { color: #3b82f6; }
`;

const AccessDenied: React.FC<{ doc: Document; onRequireLogin: () => void; onClose: () => void }> = ({ doc, onRequireLogin, onClose }) => {
    const { t } = useI18n();
    const requiredRoles = doc.viewPermissions?.map(role => t(`roles.${role}`)).join(', ') || t('roles.guest');

    return (
        <div className="text-center p-8">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-500 dark:text-yellow-400 rounded-full mx-auto flex items-center justify-center mb-6">
                <Icon name="lock-closed" className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">{t('docView.accessDenied')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
                {t('docView.accessRequiredForRoles', { roles: requiredRoles })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                    onClick={onClose} 
                    className="py-4 px-8 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                    {t('common.back')}
                </button>
                <button 
                    onClick={onRequireLogin} 
                    className="py-4 px-8 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">
                    {t('header.login')}
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

    const { viewHtml, title, categoryName, lastUpdated, tagList } = useMemo(() => {
        if (!doc) return { viewHtml: '', title: '', categoryName: '', lastUpdated: '', tagList: [] };

        const content = doc.content?.[lang]?.html || doc.content?.['uk']?.html || '';
        const sanitizedHtml = DOMPurify.sanitize(content);
        const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title;
        const catName = getCategoryName(doc.categoryKey, t);
        const updated = formatTimestamp(doc.updatedAt, t);

        const tagById = new Map<string, Tag>();
        allTags.forEach((tg) => tagById.set(tg.id, tg));
        const tags = (doc.tagIds || []).map(id => tagById.get(id)).filter(Boolean) as Tag[];

        return { viewHtml: sanitizedHtml, title: docTitle, categoryName: catName, lastUpdated: updated, tagList: tags };
    }, [doc, lang, t, allTags]);

    if (!doc) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[50] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <style>{QUILL_CONTENT_STYLES}</style>
            <div 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-gray-200/20 dark:border-gray-700/50"
                onClick={e => e.stopPropagation()}
            >
                 <header className="flex-shrink-0 p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                    <div className="flex-grow min-w-0">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{categoryName}</p>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white truncate pr-4">
                            {title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
                        <Icon name="x-mark" className="w-6 h-6 text-gray-400" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {!hasAccess ? (
                        <AccessDenied doc={doc} onRequireLogin={onRequireLogin} onClose={onClose} />
                    ) : (
                        <div className="p-6 sm:p-8 lg:p-10">
                            <main className="modal-quill-content" dangerouslySetInnerHTML={{ __html: viewHtml }} />
                        </div>
                    )}
                </div>

                {hasAccess && (
                     <footer className="flex-shrink-0 p-6 bg-gray-50/50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700">
                        <h4 className="font-black text-gray-900 dark:text-white mb-4 text-[10px] uppercase tracking-[0.2em]">{t('docView.downloadFiles')}</h4>
                        <DocumentFileList 
                            docId={doc.id} 
                            files={files} 
                            isLoading={isLoadingFiles} 
                            currentUserRole={currentUserRole} 
                            onRefresh={loadFiles} 
                            docThumbnail={doc.thumbnailUrl} 
                        />
                    </footer>
                )}
            </div>
        </div>
    );
};
