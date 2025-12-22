import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';
import { Document, UserRole, DocumentContent, Tag } from '@shared/types';
import { useI18n, Language } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { StorageApi } from '@shared/api/storage/storage.api';
import { getCategoryName } from '@shared/lib/utils/format';

// Sub-components
import { DocumentHeader } from './ui/DocumentHeader';
import { DocumentFileList } from './ui/DocumentFileList';
import { DocumentEditor } from './ui/DocumentEditor';

/**
 * 🔥 CSS Styles for Quill Content & Table of Contents
 */
const QUILL_CONTENT_STYLES = `
    .quill-content h1 { font-size: 2.25rem; font-weight: 900; margin: 2rem 0 1.5rem; color: #111827; line-height: 1.2; }
    .quill-content h2 { font-size: 1.5rem; font-weight: 800; margin: 2.5rem 0 1rem; text-transform: uppercase; color: #111827; letter-spacing: -0.02em; }
    .quill-content h3 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #111827; }
    .quill-content p { font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.25rem; color: #374151; }
    .quill-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
    .quill-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
    .quill-content img { border-radius: 1.5rem; margin: 2.5rem 0; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); max-width: 100%; height: auto; }
    .dark .quill-content h1, .dark .quill-content h2, .dark .quill-content h3 { color: #f9fafb; }
    .dark .quill-content p { color: #d1d5db; }
    .quill-content { overflow-x: hidden; overflow-wrap: anywhere; word-break: break-word; max-width: 100%; }

    /* TOC Active State */
    .toc-item-active { color: #2563eb; font-weight: 800; border-left-color: #2563eb !important; }
`;

const registerUploadingImageBlot = () => {
    const Quill = (ReactQuill as any).Quill;
    if (!Quill) return;
    if ((Quill as any).__uploadingImageRegistered) return;
    const BlockEmbed = Quill.import('blots/block/embed');
    
    class UploadingImageBlot extends BlockEmbed {
        static blotName = 'uploadingImage';
        static tagName = 'div';
        static className = 'quill-uploading-image';
        
        static create(value: any) {
            const node = super.create() as HTMLDivElement;
            const id = value?.id || '';
            const preview = value?.preview || '';
            node.setAttribute('data-upload-id', id);
            node.contentEditable = 'false';
            node.innerHTML = `
                ${preview ? `<img src="${preview}" class="quill-uploading-preview" style="width:100%;height:100%;object-fit:cover;filter:blur(8px) brightness(0.7);transform:scale(1.05);" />` : ''}
                <div class="quill-uploading-overlay" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;gap:12px;z-index:10;">
                    <div class="quill-uploading-spinner" style="width:32px;height:32px;border:3px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:quill-spin 0.8s linear infinite;"></div>
                    <div class="quill-uploading-text" style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">Optimizing...</div>
                </div>
            `;
            return node;
        }
        static value(node: any) {
            return { id: node.getAttribute('data-upload-id') || '', preview: node.querySelector('img')?.getAttribute('src') || '' };
        }
    }
    Quill.register(UploadingImageBlot);
    (Quill as any).__uploadingImageRegistered = true;
};

const emptyContentTemplate: DocumentContent = { html: '' };

export const DocumentView: React.FC<{
    doc: Document;
    onClose: () => void;
    onRequireLogin: () => void;
    currentUserRole: UserRole;
    onUpdateContent: (docId: string, lang: Language, newContent: DocumentContent) => Promise<void>;
    onCategoryClick: (categoryKey: string) => void;
    allTags?: Tag[];
}> = ({ doc, onClose, onRequireLogin, currentUserRole, onUpdateContent, onCategoryClick, allTags = [] }) => {
    const { t, lang } = useI18n();
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [editableContent, setEditableContent] = useState<DocumentContent>(doc.content?.[lang] || emptyContentTemplate);
    const [files, setFiles] = useState<{ name: string; url: string; extension?: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const quillRef = useRef<ReactQuill | null>(null);

    useEffect(() => {
        registerUploadingImageBlot();
    }, []);

    useEffect(() => {
        setEditableContent(doc.content?.[lang] || emptyContentTemplate);
    }, [doc.id, lang]);

    const loadFiles = useCallback(async () => {
        setIsLoadingFiles(true);
        try {
            const docFiles = await StorageApi.listDocumentFiles(doc.id);
            setFiles(docFiles);
        } finally {
            setIsLoadingFiles(false);
        }
    }, [doc.id]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    // -- Table of Contents Logic --
    const { viewHtml, tocItems } = useMemo(() => {
        const html = editableContent.html || '';
        if (!html) return { viewHtml: '', tocItems: [] };

        const sanitizedHtml = DOMPurify.sanitize(html);
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(sanitizedHtml, 'text/html');
        
        // 🔥 Deeply analyze headers for TOC
        const headers = htmlDoc.querySelectorAll('h1, h2, h3');
        const toc: { id: string; text: string; level: number }[] = [];

        headers.forEach((header, index) => {
            const text = header.textContent?.trim() || '';
            if (!text) return;

            const id = `section-${index}`;
            header.id = id;
            toc.push({ id, text, level: parseInt(header.tagName.substring(1)) });
        });

        return { viewHtml: htmlDoc.body.innerHTML, tocItems: toc };
    }, [editableContent.html]);

    const handleSaveContent = async () => {
        const html = editableContent.html || '';
        if (html.includes('data:image/')) {
            alert(t('common.error') + ": Base64 images detected. Please wait for upload to finish.");
            return;
        }

        setIsSaving(true);
        try {
            const cleanedHtml = html.replace(/<div class="quill-uploading-image"[^>]*>[\s\S]*?<\/div>/gi, '');
            const finalHtml = DOMPurify.sanitize(cleanedHtml);
            await onUpdateContent(doc.id, lang, { html: finalHtml });
            setSaveStatus('saved');
            setIsEditingContent(false);
        } catch (e) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 100; // Header offset
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const tagById = useMemo(() => {
        const m = new Map<string, Tag>();
        (allTags || []).forEach((tg) => m.set(tg.id, tg));
        return m;
    }, [allTags]);

    return (
        <div className="pt-24 pb-20 animate-fade-in px-4">
             <style>{QUILL_CONTENT_STYLES}</style>

            <header className="mb-12 max-w-5xl mx-auto">
                <nav className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-6 flex flex-wrap items-center gap-2">
                    <button onClick={onClose} className="hover:text-blue-600 transition-colors">{t('dashboard.title')}</button>
                    <Icon name="chevron-right" className="w-2 h-2 opacity-30" />
                    <button onClick={() => onCategoryClick(doc.categoryKey)} className="hover:text-blue-600 font-medium">{getCategoryName(doc.categoryKey, t)}</button>
                    <Icon name="chevron-right" className="w-2 h-2 opacity-30" />
                    <span className="text-gray-800 dark:text-gray-200 font-bold">{doc.titleKey ? t(doc.titleKey) : doc.title}</span>
                    {saveStatus === 'saved' && <span className="ml-3 text-green-600 font-black text-[9px] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded uppercase">Saved ✓</span>}
                </nav>
                <button onClick={onClose} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest mb-2 transition-transform hover:-translate-x-1">
                    <Icon name="chevron-left" className="w-3 h-3" /> {t('docView.backToList')}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 max-w-7xl mx-auto">
                {/* 🔥 Sidebar with TOC and Files */}
                <aside className="lg:w-80 shrink-0 order-2 lg:order-1">
                    <div className="sticky top-28 space-y-12">
                        {/* TOC Section */}
                        <div className={`transition-all duration-500 ${tocItems.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                            <h4 className="font-black text-gray-900 dark:text-white mb-5 text-[10px] uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800 pb-2">{t('docView.content.toc.title')}</h4>
                            <nav className="flex flex-col gap-1">
                                {tocItems.map((item) => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => scrollToHeading(item.id)} 
                                        className={`text-left py-2 px-3 rounded-xl text-xs transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 group flex items-start gap-2 ${
                                            item.level === 1 ? 'font-black text-gray-900 dark:text-white uppercase tracking-tight' : 
                                            item.level === 2 ? 'font-bold text-gray-600 dark:text-gray-400 ml-2' : 
                                            'text-gray-500 dark:text-gray-500 ml-4 italic'
                                        }`}
                                    >
                                        <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="truncate">{item.text}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Files Section */}
                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white mb-5 text-[10px] uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800 pb-2">{t('docView.downloadFiles')}</h4>
                            <DocumentFileList docId={doc.id} files={files} isLoading={isLoadingFiles} currentUserRole={currentUserRole} onRefresh={loadFiles} />
                        </div>

                        {/* Admin Actions */}
                        {currentUserRole === 'admin' && (
                            <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-3">
                                {!isEditingContent ? (
                                    <button onClick={() => setIsEditingContent(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0">{t('docView.editContent')}</button>
                                ) : (
                                    <>
                                        <button onClick={handleSaveContent} disabled={isSaving || isUploadingImage} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-500/20 disabled:opacity-50">{isSaving ? '...' : t('common.save')}</button>
                                        <button onClick={() => setIsEditingContent(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">{t('common.cancel')}</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* 🔥 Main Content Area */}
                <main className="flex-grow order-1 lg:order-2 min-w-0">
                    <DocumentHeader title={doc.titleKey ? t(doc.titleKey) : doc.title || ''} updatedAt={doc.updatedAt} tagIds={doc.tagIds || []} tagById={tagById} />
                    
                    <div className="mt-10">
                        {isEditingContent ? (
                            <DocumentEditor quillRef={quillRef} content={editableContent.html || ''} onChange={(h) => setEditableContent({html: h})} docId={doc.id} isUploadingImage={isUploadingImage} setIsUploadingImage={setIsUploadingImage} />
                        ) : (
                            <div className="quill-content max-w-none animate-fade-in" dangerouslySetInnerHTML={{ __html: viewHtml }} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
