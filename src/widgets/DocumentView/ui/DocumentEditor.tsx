import React, { useMemo, useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { compressImage } from '@shared/lib/image/compression';
import { StorageApi } from '@shared/api/storage/storage.api';

interface DocumentEditorProps {
    quillRef: React.RefObject<ReactQuill>;
    content: string; // Initial content
    onChange: (content: string) => void; // Parent sync
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
    // 🔥 Local state for high-frequency updates to keep editor snappy
    const [localContent, setLocalContent] = useState(content);

    // Sync from parent if content prop changes (e.g. language switch)
    useEffect(() => {
        setLocalContent(content);
    }, [content]);

    // 🔥 Debounced sync back to parent
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localContent !== content) {
                onChange(localContent);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localContent, onChange, content]);

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
                                } else {
                                    editor.insertEmbed(editor.getLength(), 'image', url, 'user');
                                }
                            } else {
                                editor.insertEmbed(editor.getLength(), 'image', url, 'user');
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
                        }
                    };
                },
            },
        },
    }), [docId, quillRef, setIsUploadingImage]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-blue-500/30 shadow-2xl overflow-hidden min-h-[500px] relative animate-fade-in">
            {isUploadingImage && (
                <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Uploading image…
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
