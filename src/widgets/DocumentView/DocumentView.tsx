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
 * 🔥 CSS Styles for Quill Content
 * Defined outside component to prevent re-injection on every render.
 */
const QUILL_CONTENT_STYLES = `
    .quill-content h1 { font-size: 2.25rem; font-weight: 900; margin: 2rem 0 1.5rem; color: #111827; }
    .quill-content h2 { font-size: 1.5rem; font-weight: 800; margin: 2.5rem 0 1rem; text-transform: uppercase; color: #111827; }
    .quill-content h3 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #111827; }
    .quill-content p { font-size: 1.125rem; line-height: 1.75; margin-bottom: 1.25rem; color: #374151; }
    .quill-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
    .quill-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
    .quill-content img { border-radius: 1rem; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 100%; height: auto; }
    .dark .quill-content h1, .dark .quill-content h2, .dark .quill-content h3 { color: #f9fafb; }
    .dark .quill-content p { color: #d1d5db; }
    .quill-content { overflow-x: hidden; overflow-wrap: anywhere; word-break: break-word; max-width: 100%; }
    .quill-uploading-image { padding: 10px 12px; border-radius: 12px; border: 1px dashed rgba(59,130,246,.35); background: rgba(59,130,246,.06); margin: 12px 0; }
`;

/**
 * ✅ Quill placeholder blot (embed)
 */
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
            node.setAttribute('data-upload-id', value?.id || '');
            node.contentEditable = 'false';
            node.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;opacity:.85;font-style:italic;">
                  <span>⏳</span>
                  <span>Uploading image…</span>
                </div>
            `;
            return node;
        }
        static value(node: any) {
            return { id: node.getAttribute('data-upload-id') || '' };
        }
    }
    Quill.register(UploadingImageBlot);
    (Quill as any).__uploadingImageRegistered = true;
};

/**
 * 🔥 Helper function: Парсинг HTML для створення Змісту (Table of Contents)
 */
const processContentForTOC = (htmlContent: string) => {
    if (!htmlContent) return { modifiedHtml: '', toc: [] };
    const sanitizedHtml = DOMPurify.sanitize(htmlContent);
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedHtml, 'text/html');
    const headers = doc.querySelectorAll('h1, h2, h3');
    const toc: { id: string; text: string; level: number }[] = [];
    headers.forEach((header, index) => {
        const text = header.textContent || '';
        const id = `heading-${index}-${text.slice(0, 30).replace(/[^a-zA-Z0-9а-яА-ЯіїєґІЇЄҐ]/g, '-')}`;
        header.id = id;
        toc.push({ id, text, level: parseInt(header.tagName.substring(1)) });
    });
    return { modifiedHtml: doc.body.innerHTML, toc };
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
    const [editableContent, setEditableContent] = useState<DocumentContent>(doc.content[lang] || emptyContentTemplate);
    const [files, setFiles] = useState<{ name: string; url: string; extension?: string }[]>([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [viewHtml, setViewHtml] = useState('');
    const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number }[]>([]);

    const quillRef = useRef<ReactQuill | null>(null);

    useEffect(() => {
        registerUploadingImageBlot();
    }, []);

    useEffect(() => {
        const rawContent = doc.content[lang] || emptyContentTemplate;
        setEditableContent(rawContent);
        if (!isEditingContent) {
            const { modifiedHtml, toc } = processContentForTOC(rawContent.html || '');
            setViewHtml(modifiedHtml);
            setTocItems(toc);
        }
    }, [doc, lang, isEditingContent]);

    const loadFiles = useCallback(async () => {
        setIsLoadingFiles(true);
        const docFiles = await StorageApi.listDocumentFiles(doc.id);
        setFiles(docFiles);
        setIsLoadingFiles(false);
    }, [doc.id]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleSaveContent = async () => {
        setIsSaving(true);
        try {
            const html = editableContent.html || '';
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
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const tagById = useMemo(() => {
        const m = new Map<string, Tag>();
        (allTags || []).forEach((tg) => m.set(tg.id, tg));
        return m;
    }, [allTags]);

    return (
        <div className="pt-24 pb-20 animate-fade-in">
             <style>{QUILL_CONTENT_STYLES}</style>

            <header className="mb-10">
                <nav className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4 flex flex-wrap items-center">
                    <button onClick={onClose} className="hover:text-blue-600 transition-colors">{t('dashboard.title')}</button>
                    <span className="mx-2">/</span>
                    <button onClick={() => onCategoryClick(doc.categoryKey)} className="hover:text-blue-600 font-medium">{getCategoryName(doc.categoryKey, t)}</button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 dark:text-gray-200 font-semibold">{doc.titleKey ? t(doc.titleKey) : doc.title}</span>
                    {saveStatus === 'saved' && <span className="ml-3 text-green-600 font-black uppercase">Saved ✓</span>}
                </nav>
                <button onClick={onClose} aria-label={t('docView.backToList')} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-bold mb-6">
                    <Icon name="chevron-left" className="w-4 h-4" /> {t('docView.backToList')}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                <aside className="lg:w-1/4 order-2 lg:order-1">
                    <div className="sticky top-24 space-y-10">
                        {tocItems.length > 0 && (
                            <div>
                                <h4 className="font-black text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-widest">{t('docView.content.toc.title')}</h4>
                                <nav className="flex flex-col gap-2 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                                    {tocItems.map((item) => (
                                        <button key={item.id} onClick={() => scrollToHeading(item.id)} className={`text-left text-sm hover:text-blue-600 ${item.level === 1 ? 'font-bold' : 'text-gray-500 ml-2'}`}>{item.text}</button>
                                    ))}
                                </nav>
                            </div>
                        )}
                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-widest">{t('docView.downloadFiles')}</h4>
                            <DocumentFileList docId={doc.id} files={files} isLoading={isLoadingFiles} currentUserRole={currentUserRole} onRefresh={loadFiles} />
                        </div>
                        {currentUserRole === 'admin' && (
                            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                {!isEditingContent ? (
                                    <button onClick={() => setIsEditingContent(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-500/20">{t('docView.editContent')}</button>
                                ) : (
                                    <>
                                        <button onClick={handleSaveContent} disabled={isSaving || isUploadingImage} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs">{isSaving ? '...' : t('common.save')}</button>
                                        <button onClick={() => setIsEditingContent(false)} className="w-full py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl font-black uppercase text-xs">{t('common.cancel')}</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                <main className="lg:w-3/4 order-1 lg:order-2">
                    <DocumentHeader title={doc.titleKey ? t(doc.titleKey) : doc.title || ''} updatedAt={doc.updatedAt} tagIds={doc.tagIds || []} tagById={tagById} />
                    {isEditingContent ? (
                        <DocumentEditor quillRef={quillRef} content={editableContent.html || ''} onChange={(h) => setEditableContent({html: h})} docId={doc.id} isUploadingImage={isUploadingImage} setIsUploadingImage={setIsUploadingImage} />
                    ) : (
                        <div className="quill-content max-w-none" dangerouslySetInnerHTML={{ __html: viewHtml }} />
                    )}
                </main>
            </div>
        </div>
    );
};
