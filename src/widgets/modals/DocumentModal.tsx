
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Document } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';
import { Button, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

const PREVIEW_STYLES = `
    .doc-preview {
        background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        border-radius: 20px;
        border: 1px solid rgba(15, 23, 42, 0.08);
        width: 100%;
        min-height: 52vh;
        max-height: 68vh;
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
    @media (max-width: 640px) {
        .doc-preview {
            border-radius: 14px;
            min-height: 40vh;
            max-height: 52vh;
        }
    }
`;

const AccessDenied: React.FC<{ doc: Document; onRequireLogin: () => void; onClose: () => void }> = ({ doc, onRequireLogin, onClose }) => {
    const { t } = useI18n();
    const requiredRoles = doc.viewPermissions?.map(role => t(`roles.${role}`)).join(', ') || t('roles.guest');

    return (
        <div className="px-4 py-12 text-center sm:px-8 sm:py-20">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-500 shadow-xl shadow-yellow-500/10 dark:bg-yellow-900/20 dark:text-yellow-400 sm:mb-8 sm:h-24 sm:w-24 sm:rounded-[2rem]">
                <Icon name="lock-closed" className="w-12 h-12" />
            </div>
            <h3 className="mb-3 text-xl font-black uppercase tracking-tight text-fg sm:mb-4 sm:text-3xl">{t('docView.accessDenied')}</h3>
            <p className="mx-auto mb-8 max-w-md text-sm font-bold leading-relaxed text-muted-fg sm:mb-10 sm:text-base">
                {t('docView.accessRequiredForRoles', { roles: requiredRoles })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                    onClick={onRequireLogin} 
                    className="h-12 w-full rounded-xl px-8 text-xs font-black uppercase tracking-widest sm:w-auto"
                >
                    {t('header.login')}
                </Button>
                <Button
                    onClick={onClose} 
                    variant="outline"
                    className="h-12 w-full rounded-xl px-8 text-xs font-black uppercase tracking-widest sm:w-auto"
                >
                    {t('common.back')}
                </Button>
            </div>
        </div>
    )
}

export const DocumentModal: React.FC<{
    doc: Document | null;
    onClose: () => void;
    onRequireLogin: () => void;
    hasViewAccess: boolean;
    hasDownloadAccess: boolean;
}> = ({ doc, onClose, onRequireLogin, hasViewAccess, hasDownloadAccess }) => {
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
        if (!doc || !hasDownloadAccess) {
            setIsLoadingFiles(false);
            return;
        }
        setIsLoadingFiles(true);
        try {
            const docFiles = await StorageApi.listDocumentFiles(doc.id);
            setFiles(docFiles);
        } finally { setIsLoadingFiles(false); }
    }, [doc, hasDownloadAccess]);

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
        <ModalOverlay className="z-[50] bg-black/80 p-2 backdrop-blur-md sm:p-6 lg:p-10" onClick={onClose}>
            <style>{PREVIEW_STYLES}</style>
            <ModalPanel
                className="relative flex h-full max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border-border bg-surface sm:max-h-[90vh] sm:rounded-[3rem]"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex flex-shrink-0 items-start justify-between border-b border-border px-4 py-4 sm:px-8 sm:py-6">
                    <div className="min-w-0 flex-grow pr-4 sm:pr-12">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">Knowledge base document</p>
                        <h2 className="text-lg font-black leading-tight tracking-tight text-fg sm:text-2xl sm:tracking-tighter">
                            {title}
                        </h2>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-fg hover:text-danger sm:h-12 sm:w-12 sm:rounded-2xl">
                        <Icon name="x-mark" className="w-6 h-6" />
                    </Button>
                </header>

                <div className="custom-scrollbar flex-grow overflow-y-auto bg-surface">
                    {!hasViewAccess ? (
                        <AccessDenied doc={doc} onRequireLogin={onRequireLogin} onClose={onClose} />
                    ) : (
                        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-8 sm:py-6">
                            <div className="rounded-2xl border border-border bg-muted/20 p-3 shadow-none sm:p-4">
                                <div className="doc-preview shadow-lg">
                                    {doc.thumbnailUrl ? (
                                        <img src={doc.thumbnailUrl} alt={title || 'Document preview'} />
                                    ) : isLoadingFiles && hasDownloadAccess ? (
                                        <div className="flex flex-col items-center gap-3 text-muted-fg">
                                            <Icon name="loading" className="h-10 w-10 animate-spin text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Loading preview</span>
                                        </div>
                                    ) : primaryFile?.extension === 'pdf' ? (
                                        <iframe title={title || 'Document preview'} src={`${primaryFile.url}#view=FitH`} />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-muted-fg">
                                            <Icon name="document-text" className="w-12 h-12" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">No preview</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-border bg-muted/20 px-3 py-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">Internal ID</p>
                                    <p className="mt-1 text-sm font-bold text-fg">{doc.internalId || '—'}</p>
                                </div>
                                <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 sm:col-span-2">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">Description</p>
                                    <p className="mt-1 text-sm leading-relaxed text-fg">{doc.description || '—'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {hasViewAccess && (
                     <footer className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-4 sm:px-8 sm:py-5">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h4 className="mb-1 text-xs font-black uppercase tracking-widest text-fg">{t('docView.downloadFiles')}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-tight text-muted-fg">
                                    {files.length > 0 ? `${files.length} файл(и)` : t('docView.filesEmpty')}
                                </p>
                            </div>
                            
                            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:gap-3">
                                {hasDownloadAccess && primaryFile ? (
                                    <a
                                        href={primaryFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary-fg shadow-soft transition-all hover:brightness-105 active:scale-95 sm:w-auto"
                                    >
                                        <Icon name="download" className="w-4 h-4" />
                                        <span>{t('common.download') || 'Download'}</span>
                                    </a>
                                ) : hasDownloadAccess ? (
                                    <div className="w-full rounded-2xl border-2 border-dashed border-border px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-fg sm:w-auto">
                                        {isLoadingFiles ? 'Loading...' : t('docView.filesEmpty')}
                                    </div>
                                ) : (
                                    <div className="w-full rounded-2xl border-2 border-dashed border-border px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-fg sm:w-auto">
                                        Немає прав на завантаження
                                    </div>
                                )}
                            </div>
                        </div>
                    </footer>
                )}
            </ModalPanel>
        </ModalOverlay>
    );
};
