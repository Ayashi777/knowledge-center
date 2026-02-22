
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Document } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';

const PREVIEW_STYLES = `
    .doc-preview {
        background: #f8fafc;
        border-radius: 24px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        aspect-ratio: 3 / 4;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dark .doc-preview {
        background: rgba(15, 23, 42, 0.5);
        border-color: rgba(148, 163, 184, 0.15);
    }
    .doc-preview iframe {
        width: 100%;
        height: 100%;
        border: 0;
    }
    .doc-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
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
    hasAccess: boolean;
}> = ({ doc, onClose, onRequireLogin, hasAccess }) => {
    const { t } = useI18n();
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

    const { title, primaryFile } = useMemo(() => {
        if (!doc) return { title: '', primaryFile: null as { name: string; url: string; extension?: string } | null };
        const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title;
        const file = files[0] || null;
        return { title: docTitle || '', primaryFile: file };
    }, [doc, files, t]);

    if (!doc) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-[50] flex items-center justify-center p-4 sm:p-6 lg:p-10 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <style>{PREVIEW_STYLES}</style>
            <div 
                className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl w-full max-w-5xl h-full max-h-[90vh] flex flex-col overflow-hidden border border-white/10 relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Title and Category */}
                 <header className="flex-shrink-0 px-10 py-8 flex justify-between items-start border-b border-gray-100 dark:border-gray-800">
                    <div className="flex-grow min-w-0 pr-12">
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
                        <div className="max-w-3xl mx-auto px-10 py-12">
                            <div className="doc-preview shadow-2xl">
                                {doc.thumbnailUrl ? (
                                    <img src={doc.thumbnailUrl} alt={title || 'Document preview'} />
                                ) : primaryFile?.extension === 'pdf' ? (
                                    <iframe title={title || 'Document preview'} src={`${primaryFile.url}#view=FitH`} />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <Icon name="document-text" className="w-12 h-12" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {hasAccess && (
                     <footer className="flex-shrink-0 px-10 py-8 bg-slate-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-widest mb-1">{t('docView.downloadFiles')}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                    {files.length > 0 ? `${files.length} файл(и)` : t('docView.filesEmpty')}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                {primaryFile ? (
                                    <a
                                        href={primaryFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                                    >
                                        <Icon name="download" className="w-4 h-4" />
                                        <span>{t('common.download') || 'Download'}</span>
                                    </a>
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
