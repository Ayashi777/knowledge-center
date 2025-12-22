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
 * 🔥 Professional CSS Styles
 */
const QUILL_CONTENT_STYLES = `
    .quill-content {
        background: white;
        min-height: 297mm;
        width: 100%;
        max-width: 850px;
        margin: 0 auto;
        padding: 60px 80px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.04);
        border-radius: 8px;
        color: #1a1a1a;
        line-height: 1.6;
    }
    .dark .quill-content {
        background: #1e293b;
        color: #f1f5f9;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .quill-content h1 { font-size: 2.5rem; font-weight: 900; margin: 3rem 0 1.5rem; color: #111827; line-height: 1.1; letter-spacing: -0.03em; }
    .quill-content h2 { font-size: 1.75rem; font-weight: 800; margin: 2.5rem 0 1.25rem; color: #111827; letter-spacing: -0.02em; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; display: inline-block; }
    .quill-content h3 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #1f2937; }
    .quill-content p { font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.5rem; color: #374151; }
    .quill-content ul, .quill-content ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
    .quill-content li { margin-bottom: 0.5rem; color: #374151; }
    .quill-content img { border-radius: 1rem; margin: 2rem 0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); max-width: 100%; height: auto; }
    .dark .quill-content h1, .dark .quill-content h2, .dark .quill-content h3 { color: #f9fafb; }
    .dark .quill-content p, .dark .quill-content li { color: #d1d5db; }
    .quill-content { overflow-x: hidden; overflow-wrap: anywhere; word-break: break-word; }

    @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
    .toc-animate { animation: slideIn 0.4s ease forwards; }
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
                ${preview ? `<img src="${preview}" style="width:100%;height:100%;object-fit:cover;filter:blur(12px) brightness(0.6);" />` : ''}
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;gap:8px;">
                    <div style="width:24px;height:24px;border:2px solid rgba(255,255,255,0.2);border-top-color:white;border-radius:50%;animation:quill-spin 0.6s linear infinite;"></div>
                    <span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">Optimizing</span>
                </div>
            `;
            return node;
        }
        static value(node: any) { return { id: node.getAttribute('data-upload-id') || '', preview: node.querySelector('img')?.getAttribute('src') || '' }; }
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
    const { t, lang: currentLang } = useI18n();
    const [isEditingContent, setIsEditingContent] = useState(false);
    
    const getInitialContent = useCallback(() => {
        if (!doc.content) return emptyContentTemplate;
        if (doc.content[currentLang]?.html) return doc.content[currentLang]!;
        const fallbackLang = Object.keys(doc.content).find(l => doc.content[l]?.html);
        if (fallbackLang) return doc.content[fallbackLang]!;
        return emptyContentTemplate;
    }, [doc.content, currentLang]);

    const [editableContent, setEditableContent] = useState<DocumentContent>(getInitialContent);
    const [files, setFiles] = useState<{ name: string; url: string; extension?: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const quillRef = useRef<ReactQuill | null>(null);

    useEffect(() => { registerUploadingImageBlot(); }, []);

    useEffect(() => {
        setEditableContent(getInitialContent());
    }, [doc.content, currentLang, getInitialContent]);

    const loadFiles = useCallback(async () => {
        setIsLoadingFiles(true);
        try {
            const docFiles = await StorageApi.listDocumentFiles(doc.id);
            setFiles(docFiles);
        } finally { setIsLoadingFiles(false); }
    }, [doc.id]);

    useEffect(() => { loadFiles(); }, [loadFiles]);

    // 🔥 Modified to allow IDs and correctly parse TOC
    const { viewHtml, tocItems } = useMemo(() => {
        const html = editableContent.html || '';
        if (!html) return { viewHtml: '', tocItems: [] };
        
        // 1. Sanitize allowing ID attribute
        const sanitizedHtml = DOMPurify.sanitize(html, { ADD_ATTR: ['id'] });
        
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(sanitizedHtml, 'text/html');
        const headers = htmlDoc.querySelectorAll('h1, h2, h3');
        const toc: { id: string; text: string; level: number }[] = [];
        
        headers.forEach((header, index) => {
            const text = header.textContent?.trim() || '';
            if (!text) return;
            const id = `section-${index}`;
            header.id = id; // Set ID for intersection observer
            toc.push({ id, text, level: parseInt(header.tagName.substring(1)) });
        });
        
        return { viewHtml: htmlDoc.body.innerHTML, tocItems: toc };
    }, [editableContent.html]);

    // 🔥 Robust ScrollSpy Implementation
    useEffect(() => {
        if (isEditingContent || tocItems.length === 0) return;

        // Small delay to ensure dangerouslySetInnerHTML has finished painting
        const timer = setTimeout(() => {
            const observer = new IntersectionObserver(
                (entries) => {
                    // Find the first intersecting element (the one at the top)
                    const visible = entries.find(e => e.isIntersecting);
                    if (visible) {
                        setActiveId(visible.target.id);
                    }
                },
                { 
                    // rootMargin detects when element enters the top 20% of viewport
                    rootMargin: '-100px 0px -80% 0px', 
                    threshold: 0 
                }
            );

            tocItems.forEach((item) => {
                const el = document.getElementById(item.id);
                if (el) observer.observe(el);
            });

            return () => observer.disconnect();
        }, 100);

        return () => clearTimeout(timer);
    }, [viewHtml, tocItems, isEditingContent]);

    const handleSaveContent = async () => {
        const html = editableContent.html || '';
        if (html.includes('data:image/')) {
            alert("Please wait for images to finish uploading.");
            return;
        }
        setIsSaving(true);
        try {
            const cleanedHtml = html.replace(/<div class="quill-uploading-image"[^>]*>[\s\S]*?<\/div>/gi, '');
            const finalHtml = DOMPurify.sanitize(cleanedHtml);
            await onUpdateContent(doc.id, currentLang, { html: finalHtml });
            setSaveStatus('saved');
            setIsEditingContent(false);
        } catch (e) { setSaveStatus('error'); } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
        }
    };

    const tagById = useMemo(() => {
        const m = new Map<string, Tag>();
        (allTags || []).forEach((tg) => m.set(tg.id, tg));
        return m;
    }, [allTags]);

    return (
        <div className="pt-24 pb-20 animate-fade-in max-w-7xl mx-auto px-6 lg:px-8">
             <style>{QUILL_CONTENT_STYLES}</style>

            <header className="mb-12">
                <nav className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <button onClick={onClose} className="hover:text-blue-600 transition-colors">{t('dashboard.title')}</button>
                    <span className="opacity-20">/</span>
                    <button onClick={() => onCategoryClick(doc.categoryKey)} className="hover:text-blue-600">{getCategoryName(doc.categoryKey, t)}</button>
                    <span className="opacity-20">/</span>
                    <span className="text-gray-900 dark:text-white">{doc.titleKey ? t(doc.titleKey) : doc.title}</span>
                </nav>
                <button onClick={onClose} className="group flex items-center gap-3 text-xs text-blue-600 font-black uppercase tracking-widest">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icon name="chevron-left" className="w-4 h-4" />
                    </div>
                    {t('docView.backToList')}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                <aside className="lg:w-80 shrink-0 sticky top-28 h-auto max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-10">
                        {tocItems.length > 0 && (
                            <div className="bg-white/50 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 backdrop-blur-sm toc-animate shadow-sm">
                                <h4 className="font-black text-gray-900 dark:text-white mb-6 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                    {t('docView.content.toc.title')}
                                </h4>
                                <nav className="space-y-1 relative">
                                    <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-gray-200 dark:bg-gray-700" />
                                    {tocItems.map((item) => {
                                        const isActive = activeId === item.id;
                                        return (
                                            <button key={item.id} onClick={() => scrollToHeading(item.id)} className={`w-full text-left py-2 pl-6 pr-3 rounded-xl text-[11px] transition-all duration-300 relative group hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm ${isActive ? 'bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' : ''} ${item.level === 1 ? (isActive ? 'font-black text-blue-600 dark:text-blue-400' : 'font-black uppercase text-gray-900 dark:text-white') : item.level === 2 ? (isActive ? 'font-black text-blue-500' : 'font-bold text-gray-500 dark:text-gray-400') : (isActive ? 'font-bold text-blue-400' : 'text-gray-400 dark:text-gray-500 italic')}`}>
                                                <div className={`absolute left-[5px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border-2 border-white dark:border-gray-900 transition-all duration-500 z-10 ${isActive ? 'bg-blue-600 scale-[1.75] shadow-[0_0_8px_rgba(37,99,235,0.5)]' : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-400'}`} />
                                                <span className={`line-clamp-2 transition-transform duration-300 ${isActive ? 'translate-x-1' : ''}`}>{item.text}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}
                        <div className="space-y-4 px-1">
                            <h4 className="font-black text-gray-900 dark:text-white mb-4 text-[10px] uppercase tracking-[0.2em] ml-2">Available Documents</h4>
                            <DocumentFileList docId={doc.id} files={files} isLoading={isLoadingFiles} currentUserRole={currentUserRole} onRefresh={loadFiles} docThumbnail={doc.thumbnailUrl} />
                        </div>
                        {currentUserRole === 'admin' && (
                            <div className="space-y-3">
                                {!isEditingContent ? (
                                    <button onClick={() => setIsEditingContent(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">{t('docView.editContent')}</button>
                                ) : (
                                    <>
                                        <button onClick={handleSaveContent} disabled={isSaving || isUploadingImage} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-green-500/20">{isSaving ? '...' : t('common.save')}</button>
                                        <button onClick={() => setIsEditingContent(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                <main className="flex-grow min-w-0 flex flex-col items-center">
                    <div className="w-full max-w-[850px] mb-8">
                         <DocumentHeader title={doc.titleKey ? t(doc.titleKey) : doc.title || ''} updatedAt={doc.updatedAt} tagIds={doc.tagIds || []} tagById={tagById} viewPermissions={doc.viewPermissions} />
                    </div>
                    <div className="w-full">
                        {isEditingContent ? (
                            <div className="quill-content p-0 shadow-none border-none bg-transparent">
                                <DocumentEditor quillRef={quillRef} content={editableContent.html || ''} onChange={(h) => setEditableContent({html: h})} docId={doc.id} isUploadingImage={isUploadingImage} setIsUploadingImage={setIsUploadingImage} />
                            </div>
                        ) : (
                            <div className="quill-content animate-fade-in" dangerouslySetInnerHTML={{ __html: viewHtml }} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
