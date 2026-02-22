
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Document } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';
import { Button, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

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
            <h3 className="mb-4 text-3xl font-black uppercase tracking-tight text-fg">{t('docView.accessDenied')}</h3>
            <p className="mx-auto mb-10 max-w-md font-bold leading-relaxed text-muted-fg">
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
        <ModalOverlay className="z-[50] bg-black/80 p-4 sm:p-6 lg:p-10 backdrop-blur-md" onClick={onClose}>
            <style>{PREVIEW_STYLES}</style>
            <ModalPanel
                className="relative flex h-full max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[3rem] border-border bg-surface"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Title and Category */}
                 <header className="flex flex-shrink-0 items-start justify-between border-b border-border px-10 py-8">
                    <div className="flex-grow min-w-0 pr-12">
                        <h2 className="text-3xl font-black tracking-tighter leading-tight text-fg">
                            {title}
                        </h2>
                    </div>
                    <Button onClick={onClose} variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-muted-fg hover:text-danger">
                        <Icon name="x-mark" className="w-6 h-6" />
                    </Button>
                </header>

                <div className="custom-scrollbar flex-grow overflow-y-auto bg-surface">
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
                                    <div className="flex flex-col items-center gap-3 text-muted-fg">
                                        <Icon name="document-text" className="w-12 h-12" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">No preview</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {hasAccess && (
                     <footer className="flex-shrink-0 border-t border-border bg-muted/30 px-10 py-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div>
                                <h4 className="mb-1 text-xs font-black uppercase tracking-widest text-fg">{t('docView.downloadFiles')}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-tight text-muted-fg">
                                    {files.length > 0 ? `${files.length} файл(и)` : t('docView.filesEmpty')}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                {primaryFile ? (
                                    <a
                                        href={primaryFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary-fg shadow-soft transition-all hover:brightness-105 active:scale-95"
                                    >
                                        <Icon name="download" className="w-4 h-4" />
                                        <span>{t('common.download') || 'Download'}</span>
                                    </a>
                                ) : (
                                    <div className="rounded-2xl border-2 border-dashed border-border px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-fg">
                                        {isLoadingFiles ? 'Loading...' : t('docView.filesEmpty')}
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
