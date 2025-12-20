import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Document, Category, UserRole, ViewMode, SortBy, DocumentContent, Tag } from '../types';
import { useI18n, Language } from '../i18n';
import { Icon } from './icons';
import { Sidebar } from './Sidebar';
import { DocumentGridItem, DocumentListItem } from './DocumentComponents';
import { formatRelativeTime } from '../utils/format';
import { listDocumentFiles } from '../utils/storage';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Compress / resize images before uploading to Storage
 */
const compressImage = async (
    file: File,
    opts: { maxW?: number; maxH?: number; quality?: number; mime?: string } = {}
): Promise<File> => {
    const maxW = opts.maxW ?? 1920;
    const maxH = opts.maxH ?? 1920;
    const quality = opts.quality ?? 0.82;
    const mime = opts.mime ?? 'image/webp';

    try {
        const bitmap = await createImageBitmap(file);

        let { width, height } = bitmap;

        // keep aspect ratio, only downscale
        const ratio = Math.min(maxW / width, maxH / height, 1);
        const targetW = Math.max(1, Math.round(width * ratio));
        const targetH = Math.max(1, Math.round(height * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx) return file;

        ctx.drawImage(bitmap, 0, 0, targetW, targetH);

        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => {
                    if (!b) return reject(new Error('Image compression failed: toBlob returned null'));
                    resolve(b);
                },
                mime,
                quality
            );
        });

        const safeBase = file.name.replace(/\.[^.]+$/, '').replace(/\s+/g, '_');
        const ext =
            mime === 'image/webp'
                ? 'webp'
                : mime === 'image/jpeg'
                ? 'jpg'
                : mime === 'image/png'
                ? 'png'
                : file.name.split('.').pop() || 'img';

        return new File([blob], `${safeBase}.${ext}`, { type: mime });
    } catch (err) {
        console.warn('compressImage failed, fallback to original file:', err);
        return file;
    }
};

const uploadImageToStorage = async (file: File, docId: string): Promise<string> => {
    const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const path = `documents/${docId}/images/${Date.now()}-${safeName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

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
            node.contentEditable = 'false'; // Важливо: забороняє редагування всередині блоку
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
 * Додає ID до заголовків та повертає структуру меню.
 */
const processContentForTOC = (htmlContent: string) => {
    if (!htmlContent) return { modifiedHtml: '', toc: [] };

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Шукаємо всі заголовки H1, H2, H3
    const headers = doc.querySelectorAll('h1, h2, h3');
    const toc: { id: string; text: string; level: number }[] = [];

    headers.forEach((header, index) => {
        const text = header.textContent || '';
        // Створюємо безпечний ID (транслітерація або очистка не обов'язкова, але бажана для гарних URL)
        // Тут просто беремо перші 20 символів і індекс для унікальності
        const safeText = text.slice(0, 30).replace(/[^a-zA-Z0-9а-яА-ЯіїєґІЇЄҐ]/g, '-');
        const id = `heading-${index}-${safeText}`;
        
        // Присвоюємо ID заголовку в DOM (щоб якір працював)
        header.id = id;
        
        toc.push({ 
            id, 
            text, 
            level: parseInt(header.tagName.substring(1)) // 1, 2 або 3
        });
    });

    return { 
        modifiedHtml: doc.body.innerHTML, 
        toc 
    };
};

export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useI18n();
    if (totalPages <= 1) return null;

    const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="flex items-center justify-center gap-2 sm:gap-4 mt-8" aria-label="Pagination">
            <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
                {t('pagination.prev')}
            </button>

            <div className="hidden sm:flex items-center gap-2">
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        aria-current={currentPage === number ? 'page' : undefined}
                        className={`px-4 py-2 text-sm font-medium border rounded-md ${
                            currentPage === number
                                ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        {number}
                    </button>
                ))}
            </div>

            <span className="sm:hidden text-sm text-gray-600 dark:text-gray-400">
                {currentPage} / {totalPages}
            </span>

            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
                {t('pagination.next')}
            </button>
        </nav>
    );
};

export const DashboardView: React.FC<{
    onSelectDoc: (doc: Document) => void;
    onRequireLogin: () => void;
    isGuest: boolean;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    docs: Document[];
    totalDocsCount: number;
    showAdminControls: boolean;
    onEditDoc: (doc: Document) => void;
    onDeleteDoc: (id: string) => void;
    onAddNewDoc: () => void;
    selectedCategory: string | null;
    onCategorySelect: (categoryName: string | null) => void;
    visibleCategories: Category[];
    allTags: Tag[];
    selectedTags: string[];
    onTagSelect: (tagName: string) => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    sortBy: SortBy;
    setSortBy: (sort: SortBy) => void;
    selectedRole: UserRole | null;
    onRoleSelect: (role: UserRole | null) => void;
    onClearFilters: () => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onEditCategory: (cat: Category) => void;
}> = ({
    onSelectDoc,
    onRequireLogin,
    isGuest,
    searchTerm,
    onSearchChange,
    docs,
    totalDocsCount,
    showAdminControls,
    onEditDoc,
    onDeleteDoc,
    onAddNewDoc,
    selectedCategory,
    onCategorySelect,
    visibleCategories,
    allTags,
    selectedTags,
    onTagSelect,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    selectedRole,
    onRoleSelect,
    onClearFilters,
    currentPage,
    totalPages,
    onPageChange,
    onEditCategory,
}) => {
    const { t } = useI18n();

    return (
        <>
            <header className="mb-8 text-center pt-16 sm:pt-12">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
                <p className="mt-3 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">{t('dashboard.description')}</p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                <Sidebar
                    visibleCategories={visibleCategories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={onCategorySelect}
                    allTags={allTags}
                    selectedTags={selectedTags}
                    onTagSelect={onTagSelect}
                    showAdminControls={showAdminControls}
                    onEditCategory={onEditCategory}
                    onClearFilters={onClearFilters}
                    selectedRole={selectedRole}
                    onRoleSelect={onRoleSelect}
                />

                <main className="flex-grow">
                    <div className="relative mb-6">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg
                                className="h-5 w-5 text-gray-400 dark:text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full rounded-md border-0 bg-gray-100 dark:bg-gray-800 py-3 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset ring-blue-500 sm:text-sm sm:leading-6 transition-all"
                            placeholder={t('dashboard.searchPlaceholder')}
                        />
                    </div>

                    <div className="flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">{t('dashboard.sortBy')}</span>
                            <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                        sortBy === 'recent' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    {t('dashboard.mostRecent')}
                                </button>
                                <button
                                    onClick={() => setSortBy('alpha')}
                                    className={`px-2 py-0.5 text-xs font-semibold rounded ${
                                        sortBy === 'alpha' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    {t('dashboard.alphabetical')}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{t('dashboard.viewAs')}</span>
                            <div className="flex items-center p-0.5 bg-gray-200 dark:bg-gray-700 rounded-md">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid view"
                                    className={`p-1 rounded ${
                                        viewMode === 'grid' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    <Icon name="view-grid" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    aria-label="List view"
                                    className={`p-1 rounded ${
                                        viewMode === 'list' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    <Icon name="view-list" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

					<div className="flex justify-between items-baseline mb-4">
						<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t('dashboard.results', { count: totalDocsCount })}</p>
					</div>

					{showAdminControls && (
						<div className="mb-4 text-right">
							<button
								onClick={onAddNewDoc}
								className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold whitespace-nowrap"
							>
								<Icon name="plus" className="h-5 w-5" />
								<span>{t('common.add')}</span>
							</button>
						</div>
					)}

					{docs.length > 0 ? (
						viewMode === 'grid' ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
								{docs.map((doc) => (
									<DocumentGridItem key={doc.id} doc={doc} onClick={() => onSelectDoc(doc)} onRequireLogin={onRequireLogin} isGuest={isGuest} />
								))}
							</div>
						) : (
							<div className="space-y-3">
								{docs.map((doc) => (
									<DocumentListItem
										key={doc.id}
										doc={doc}
										onClick={() => onSelectDoc(doc)}
										onEdit={() => onEditDoc(doc)}
										onDelete={() => onDeleteDoc(doc.id)}
										showAdminControls={showAdminControls}
									/>
								))}
							</div>
						)
					) : (
						<div className="text-center py-10 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg">
							<p className="text-gray-500 dark:text-gray-400">{t('dashboard.noResults')}</p>
							<p className="text-gray-600 dark:text-gray-500 text-sm mt-1">{t('dashboard.noResultsDescription')}</p>
						</div>
					)}

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
                </main>
            </div>
        </>
    );
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

    // status for image uploads
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // 🔥 NEW: State for TOC and View HTML
    const [viewHtml, setViewHtml] = useState('');
    const [tocItems, setTocItems] = useState<{ id: string; text: string; level: number }[]>([]);

    const quillRef = useRef<ReactQuill | null>(null);

    useEffect(() => {
        registerUploadingImageBlot();
    }, []);

    // 🔥 UPDATED: Effect to process content when entering view mode or changing language
    useEffect(() => {
        const rawContent = doc.content[lang] || emptyContentTemplate;
        setEditableContent(rawContent);
        setSaveStatus('idle');

        // Генеруємо TOC тільки для режиму перегляду (не редагування)
        if (!isEditingContent) {
            const { modifiedHtml, toc } = processContentForTOC(rawContent.html || '');
            setViewHtml(modifiedHtml);
            setTocItems(toc);
        }
    }, [doc, lang, isEditingContent]); // Перераховуємо, коли виходимо з редагування

    useEffect(() => {
        const loadFiles = async () => {
            setIsLoadingFiles(true);
            const docFiles = await listDocumentFiles(doc.id);
            setFiles(docFiles);
            setIsLoadingFiles(false);
        };
        loadFiles();
    }, [doc.id]);

    const handleSaveContent = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const html = editableContent.html || '';

            // Disallow base64 images (Firestore 2MB limit / huge payload)
            const hasBase64Images = /<img[^>]+src=["']data:image\//i.test(html);
            if (hasBase64Images) {
                alert('Base64-зображення не підтримуються. Використай кнопку Image — файл буде завантажено в Storage, а в текст вставиться URL.');
                return;
            }

            // ✅ Safety cleanup: remove any leftover placeholders before saving
            const cleanedHtml = html
                .replace(/<div class="quill-uploading-image"[^>]*>[\s\S]*?<\/div>/gi, '')
                .replace(/\[\[uploading-image:[^\]]+\]\]\s*⏳\s*Uploading image…/gi, '');

            await onUpdateContent(doc.id, lang, { html: cleanedHtml });
            setSaveStatus('saved');
            setIsEditingContent(false);
        } catch (e) {
            console.error(e);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
    };

    /**
     * ✅ modules обгорнуто в useMemo для стабільності
     */
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
            ],
            handlers: {
                image: () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.click();

                    input.onchange = async () => {
                        const original = input.files?.[0];
                        if (!original) return;

                        const editor = quillRef.current?.getEditor();
                        if (!editor) return;

                        const uploadId = makeId();
                        const range = editor.getSelection(true);
                        const insertAt = range?.index ?? editor.getLength();

                        editor.insertEmbed(insertAt, 'uploadingImage', { id: uploadId }, 'user');
                        editor.insertText(insertAt + 1, '\n', 'user');

                        setIsUploadingImage(true);

                        try {
                            const compressed = await compressImage(original, { maxW: 1920, maxH: 1920, quality: 0.82, mime: 'image/webp' });
                            
                            if (compressed.size > 10 * 1024 * 1024) {
                                alert('Зображення все ще дуже велике навіть після стиску (10MB+). Спробуй інше/менше.');
                                return;
                            }

                            const url = await uploadImageToStorage(compressed, doc.id);
                            const root = editor.root;
                            const el = root.querySelector(`.quill-uploading-image[data-upload-id="${uploadId}"]`);

                            if (el) {
                                const Quill = (ReactQuill as any).Quill;
                                const blot = Quill?.find(el);
                                const idx = blot ? editor.getIndex(blot) : null;

                                if (idx !== null) {
                                    editor.deleteText(idx, 1, 'user');
                                    editor.insertEmbed(idx, 'image', url, 'user');
                                    editor.insertText(idx + 1, '\n', 'user');
                                } else {
                                    const len = editor.getLength();
                                    editor.insertEmbed(len, 'image', url, 'user');
                                }
                            } else {
                                const len = editor.getLength();
                                editor.insertEmbed(len, 'image', url, 'user');
                            }

                        } catch (e) {
                            console.error('Image upload failed', e);
                            alert('Помилка завантаження зображення.');
                            const root = editor.root;
                             const el = root.querySelector(`.quill-uploading-image[data-upload-id="${uploadId}"]`);
                             if(el) {
                                 const Quill = (ReactQuill as any).Quill;
                                 const blot = Quill?.find(el);
                                 const idx = blot ? editor.getIndex(blot) : null;
                                 if (idx !== null) editor.deleteText(idx, 1, 'user');
                             }
                        } finally {
                            setIsUploadingImage(false);
                        }
                    };
                },
            },
        },
    }), [doc.id]);

    // 🔥 Функція для скролу до заголовка
    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const docTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';

    const tagById = useMemo(() => {
        const m = new Map<string, Tag>();
        (allTags || []).forEach((tg) => m.set(tg.id, tg));
        return m;
    }, [allTags]);

    return (
        <div className="pt-24 pb-20 animate-fade-in">
            <style>{`
                /* Typography */
                .quill-content h1 { font-size: 2.25rem; font-weight: 900; margin: 2rem 0 1.5rem; color: #111827; }
                .quill-content h2 { font-size: 1.5rem; font-weight: 800; margin: 2.5rem 0 1rem; text-transform: uppercase; color: #111827; }
                .quill-content h3 { font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #111827; }
                .quill-content p { font-size: 1.125rem; line-height: 1.75; margin-bottom: 1.25rem; color: #374151; }
                .quill-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .quill-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .quill-content li { margin-bottom: 0.5rem; }

                /* Media */
                .quill-content img { border-radius: 1rem; margin: 2rem 0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); max-width: 100%; height: auto; }

                /* Dark theme */
                .dark .quill-content h1, .dark .quill-content h2, .dark .quill-content h3 { color: #f9fafb; }
                .dark .quill-content p { color: #d1d5db; }

                /* Quill base */
                .ql-container { font-family: inherit !important; font-size: 1rem !important; max-width: 100%; }
                .ql-editor { min-height: 400px; max-width: 100%; }

                .dark .ql-toolbar { background: #1f2937; border-color: #374151 !important; }
                .dark .ql-container { background: #111827; border-color: #374151 !important; color: white; }
                .dark .ql-stroke { stroke: #d1d5db !important; }
                .dark .ql-fill { fill: #d1d5db !important; }
                .dark .ql-picker { color: #d1d5db !important; }

                /* prevent horizontal scroll / layout break from rich content */
                .quill-content {
                    overflow-x: hidden;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    max-width: 100%;
                }
                .quill-content img,
                .quill-content video,
                .quill-content iframe,
                .quill-content embed,
                .quill-content object {
                    max-width: 100% !important;
                    height: auto !important;
                }
                .quill-content table {
                    display: block;
                    max-width: 100%;
                    overflow-x: auto;
                    border-collapse: collapse;
                }
                .quill-content pre,
                .quill-content code {
                    max-width: 100%;
                    overflow-x: auto;
                }

                /* ✅ styling for our uploading blot */
                .quill-uploading-image {
                    padding: 10px 12px;
                    border-radius: 12px;
                    border: 1px dashed rgba(59,130,246,.35);
                    background: rgba(59,130,246,.06);
                    margin: 12px 0;
                }
                .dark .quill-uploading-image {
                    border-color: rgba(59,130,246,.35);
                    background: rgba(59,130,246,.10);
                }
            `}</style>

            <header className="mb-10">
                <nav className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4 flex flex-wrap items-center">
                    <button onClick={onClose} className="hover:text-blue-600 transition-colors">
                        {t('dashboard.title')}
                    </button>
                    <span className="mx-2 text-gray-400">/</span>
                    <button onClick={() => onCategoryClick(doc.categoryKey)} className="hover:text-blue-600 font-medium">
                        {t(doc.categoryKey)}
                    </button>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-800 dark:text-gray-200 font-semibold">{docTitle}</span>

                    {saveStatus === 'saved' && (
                        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-green-600">Saved ✓</span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="ml-3 text-[10px] font-black uppercase tracking-widest text-red-600">Save error</span>
                    )}
                </nav>

                <button onClick={onClose} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-bold mb-6 transition-colors">
                    <Icon name="chevron-left" className="w-4 h-4" />
                    {t('docView.backToList')}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                <aside className="lg:w-1/4 order-2 lg:order-1">
                    <div className="sticky top-24 space-y-10">
                        {/* 🔥 DYNAMIC TABLE OF CONTENTS */}
                        {tocItems.length > 0 && (
                            <div className="animate-fade-in">
                                <h4 className="font-black text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-[0.2em]">
                                    {t('docView.content.toc.title')}
                                </h4>
                                <nav className="flex flex-col gap-2 border-l-2 border-gray-100 dark:border-gray-800 pl-4">
                                    {tocItems.map((item) => (
                                        <button 
                                            key={item.id}
                                            onClick={() => scrollToHeading(item.id)}
                                            className={`
                                                text-left text-sm transition-colors duration-200
                                                ${item.level === 1 ? 'font-bold text-gray-800 dark:text-gray-200 mt-2' : ''}
                                                ${item.level === 2 ? 'font-medium text-gray-600 dark:text-gray-400 ml-2' : ''}
                                                ${item.level === 3 ? 'text-xs text-gray-500 dark:text-gray-500 ml-4' : ''}
                                                hover:text-blue-600 dark:hover:text-blue-400
                                            `}
                                        >
                                            {item.text}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}

                        <div>
                            <h4 className="font-black text-gray-900 dark:text-white mb-4 text-xs uppercase tracking-[0.2em]">
                                {t('docView.downloadFiles')}
                            </h4>
                            <div className="space-y-3">
                                {isLoadingFiles ? (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                                        <Icon name="loading" className="w-4 h-4" /> Loading files...
                                    </div>
                                ) : (
                                    files.map((file) => (
                                        <div
                                            key={file.name}
                                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                                                    <Icon
                                                        name={file.extension === 'pdf' ? 'pdf' : 'hr'}
                                                        className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-[11px] truncate dark:text-white uppercase tracking-tight" title={file.name}>
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[9px] text-gray-500 uppercase font-black opacity-60">1.2 MB</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
                                                >
                                                    <span>{t('common.download')}</span>
                                                </a>
                                                {currentUserRole === 'admin' && (
                                                    <span className="text-[10px] text-gray-400 font-bold cursor-pointer hover:text-blue-500">
                                                        {t('docView.uploadNew')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {!isLoadingFiles && files.length === 0 && <p className="text-xs text-gray-400 italic">No files available.</p>}
                            </div>
                        </div>

                        {currentUserRole === 'admin' && (
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                                {!isEditingContent ? (
                                    <button
                                        onClick={() => setIsEditingContent(true)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all text-xs font-black shadow-xl shadow-blue-500/20 uppercase tracking-widest"
                                    >
                                        {t('docView.editContent')}
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={handleSaveContent}
                                            disabled={isSaving || isUploadingImage}
                                            className="w-full px-6 py-4 rounded-2xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs font-black shadow-xl shadow-blue-500/20 uppercase tracking-widest"
                                        >
                                            {isSaving ? 'Saving...' : t('common.save')}
                                        </button>
                                        <button
                                            onClick={() => setIsEditingContent(false)}
                                            disabled={isSaving || isUploadingImage}
                                            className="w-full px-6 py-4 rounded-2xl text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-xs font-black uppercase tracking-widest"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                        {isUploadingImage && (
                                            <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-2 text-center">
                                                Uploading image…
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                <main className="lg:w-3/4 order-1 lg:order-2">
                    <div className="mb-10">
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-4 leading-[1.1]">{docTitle}</h1>
                        <div className="flex flex-wrap items-center gap-4">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                {t('docView.lastUpdated')}: {formatRelativeTime(doc.updatedAt, lang, t)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(doc.tagIds || []).map((id) => {
                                    const tg = tagById.get(id);
                                    if (!tg) return null;
                                    return (
                                        <div
                                            key={id}
                                            className="flex items-center gap-2 text-[9px] uppercase font-black text-gray-400 border border-gray-200 dark:border-gray-800 px-2.5 py-1 rounded-full"
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tg.color || '#cccccc' }} aria-hidden="true" />
                                            <Icon name="tag" className="w-2.5 h-2.5 opacity-50" />
                                            {tg.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {isEditingContent ? (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-blue-500/30 shadow-2xl overflow-hidden min-h-[500px] relative">
                            {isUploadingImage && (
                                <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                                    Uploading image…
                                </div>
                            )}

                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={editableContent.html || ''}
                                onChange={(content) => setEditableContent({ html: content })}
                                className="h-[400px] dark:text-white"
                                modules={modules}
                            />
                        </div>
                    ) : (
                        // 🔥 ВИКОРИСТОВУЄМО viewHtml (з ID для якорів) замість currentContent.html
                        <div className="quill-content max-w-none" dangerouslySetInnerHTML={{ __html: viewHtml }} />
                    )}
                </main>
            </div>
        </div>
    );
};