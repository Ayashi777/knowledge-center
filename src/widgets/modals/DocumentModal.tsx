
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Document } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';
import { Button, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

const PREVIEW_STYLES = `
    .doc-preview {
        background: #f8fafc;
        border-radius: 18px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        width: 100%;
        min-height: 46vh;
        max-height: 70vh;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dark .doc-preview {
        background: rgba(15, 23, 42, 0.75);
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
        object-fit: contain;
        background: #f8fafc;
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
                className="relative flex h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border-border bg-surface sm:h-[92vh] sm:max-h-[920px] sm:rounded-[2rem]"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex flex-shrink-0 items-start justify-between border-b border-border px-4 py-4 sm:px-8 sm:py-6">
                    <div className="min-w-0 flex-grow pr-4 sm:pr-12">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">{t('docView.info')}</p>
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
                        <div className="mx-auto h-full w-full max-w-6xl px-4 py-4 sm:px-8 sm:py-6">
                            <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.95fr)]">
                                <section className="flex min-h-[50vh] flex-col rounded-2xl border border-border bg-muted/20 p-3 sm:p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">{t('docView.preview')}</p>
                                        {doc.internalId && (
                                            <span className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[10px] font-black text-fg">
                                                {doc.internalId}
                                            </span>
                                        )}
                                    </div>
                                    <div className="doc-preview flex-1 shadow-lg">
                                        {doc.thumbnailUrl ? (
                                            <img src={doc.thumbnailUrl} alt={title || 'Document preview'} />
                                        ) : isLoadingFiles && hasDownloadAccess ? (
                                            <div className="flex flex-col items-center gap-3 text-muted-fg">
                                                <Icon name="loading" className="h-10 w-10 animate-spin text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('common.loading')}</span>
                                            </div>
                                        ) : primaryFile?.extension === 'pdf' ? (
                                            <iframe title={title || 'Document preview'} src={`${primaryFile.url}#view=FitH`} />
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-muted-fg">
                                                <Icon name="document-text" className="w-12 h-12" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('common.notFound')}</span>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <aside className="flex min-h-[40vh] flex-col gap-4 rounded-2xl border border-border bg-muted/20 p-4">
                                    <div className="rounded-xl border border-border bg-surface px-3 py-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">{t('docView.info')}</p>
                                        <p className="mt-2 text-sm leading-relaxed text-fg">{doc.description || '—'}</p>
                                    </div>

                                    <div className="rounded-xl border border-border bg-surface px-3 py-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-fg">{t('docView.downloadFiles')}</p>
                                        <p className="mt-1 text-xs text-muted-fg">
                                            {files.length > 0 ? `${files.length} файл(и)` : t('docView.filesEmpty')}
                                        </p>
                                        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                                            {files.map((file) => (
                                                <a
                                                    key={file.url}
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs text-fg transition-colors hover:bg-muted"
                                                >
                                                    <span className="truncate">{file.name}</span>
                                                    <Icon name="external-link" className="h-4 w-4 shrink-0 text-muted-fg" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {hasDownloadAccess && primaryFile ? (
                                            <a
                                                href={primaryFile.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-5 py-3 text-[11px] font-black uppercase tracking-widest text-primary-fg shadow-soft transition-all hover:brightness-105 active:scale-95"
                                            >
                                                <Icon name="download" className="w-4 h-4" />
                                                <span>{t('common.download') || 'Download'}</span>
                                            </a>
                                        ) : hasDownloadAccess ? (
                                            <div className="w-full rounded-xl border-2 border-dashed border-border px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-fg">
                                                {isLoadingFiles ? t('common.loading') : t('docView.filesEmpty')}
                                            </div>
                                        ) : (
                                            <div className="w-full rounded-xl border-2 border-dashed border-border px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-fg">
                                                Немає прав на завантаження
                                            </div>
                                        )}
                                    </div>
                                </aside>
                            </div>
                        </div>
                    )}
                </div>

                {!hasViewAccess && (
                    <footer className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-8">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-fg">{t('docView.accessDenied')}</p>
                    </footer>
                )}
            </ModalPanel>
        </ModalOverlay>
    );
};
