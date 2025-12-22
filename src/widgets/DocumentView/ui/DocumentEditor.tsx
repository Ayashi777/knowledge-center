import React, { useMemo, useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { compressImage } from '@shared/lib/image/compression';
import { StorageApi } from '@shared/api/storage/storage.api';

interface DocumentEditorProps {
    quillRef: React.RefObject<ReactQuill>;
    content: string; 
    onChange: (content: string) => void;
    docId: string;
    isUploadingImage: boolean;
    setIsUploadingImage: (loading: boolean) => void;
}

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
    quillRef,
    content,
    onChange,
    docId,
    isUploadingImage,
    setIsUploadingImage,
}) => {
    const [localContent, setLocalContent] = useState(content);

    useEffect(() => {
        setLocalContent(content);
    }, [content]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localContent !== content) {
                onChange(localContent);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localContent, onChange, content]);

    const uploadAndInsertImage = async (file: File) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const uploadId = makeId();
        const range = editor.getSelection(true);
        const insertAt = range?.index ?? editor.getLength();

        // 🔥 Step 1: Create a temporary local preview for the placeholder
        const localPreviewUrl = URL.createObjectURL(file);

        // 🔥 Step 2: Insert professional placeholder with preview
        editor.insertEmbed(insertAt, 'uploadingImage', { 
            id: uploadId, 
            preview: localPreviewUrl 
        }, 'user');
        editor.insertText(insertAt + 1, '\n', 'user');

        setIsUploadingImage(true);

        try {
            // Step 3: Compress
            const compressed = await compressImage(file, { maxW: 1600, maxH: 1600, quality: 0.8, mime: 'image/webp' });
            // Step 4: Upload
            const url = await StorageApi.uploadImage(compressed, docId);
            
            const root = editor.root;
            const el = root.querySelector(`.quill-uploading-image[data-upload-id="${uploadId}"]`);

            if (el) {
                const Quill = (ReactQuill as any).Quill;
                const blot = Quill?.find(el);
                const idx = blot ? editor.getIndex(blot) : null;

                if (idx !== null) {
                    editor.deleteText(idx, 1, 'user');
                    editor.insertEmbed(idx, 'image', url, 'user');
                }
            }
        } catch (e) {
            console.error('Image upload failed', e);
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
            URL.revokeObjectURL(localPreviewUrl); // Cleanup memory
        }
    };

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
                        if (original) await uploadAndInsertImage(original);
                    };
                },
            },
        },
        clipboard: {
            matchVisual: false,
        }
    }), [docId, quillRef, setIsUploadingImage]);

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    e.preventDefault();
                    uploadAndInsertImage(file);
                }
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        const files = e.dataTransfer?.files;
        if (files && files.length > 0 && files[0].type.startsWith('image/')) {
            e.preventDefault();
            uploadAndInsertImage(files[0]);
        }
    };

    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-blue-500/30 shadow-2xl overflow-hidden min-h-[500px] relative animate-fade-in"
            onPaste={handlePaste}
            onDrop={handleDrop}
        >
            {isUploadingImage && (
                <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Optimizing images…
                </div>
            )}
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={localContent}
                onChange={setLocalContent}
                className="h-[400px] dark:text-white"
                modules={modules}
            />
        </div>
    );
};
