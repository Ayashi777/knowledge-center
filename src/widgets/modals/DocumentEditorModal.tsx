import React, { useState, useRef } from 'react';
import { Document, Category, Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { StorageApi } from '@shared/api/storage/storage.api';
import { Icon } from '@shared/ui/icons';

export const DocumentEditorModal: React.FC<{
    doc: Partial<Document> | null,
    onSave: (doc: Partial<Document>) => void,
    onClose: () => void,
    availableCategories: Category[],
    availableTags: Tag[]
}> = ({ doc, onSave, onClose, availableCategories, availableTags }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState((doc?.titleKey ? t(doc.titleKey) : doc?.title) || '');
    const [category, setCategory] = useState(doc?.categoryKey || availableCategories[0]?.nameKey || '');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(doc?.tagIds || []);
    const [thumbnailUrl, setThumbnailUrl] = useState((doc as any)?.thumbnailUrl || '');
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    
    const thumbInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: doc?.id,
            title: title,
            categoryKey: category,
            tagIds: selectedTagIds,
            thumbnailUrl: thumbnailUrl
        });
    };

    const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !doc?.id) return;
        
        setIsUploadingThumb(true);
        try {
            const url = await StorageApi.uploadThumbnail(file, doc.id);
            setThumbnailUrl(url);
        } catch (error) {
            console.error('Thumbnail upload failed', error);
            alert('Upload failed');
        } finally {
            setIsUploadingThumb(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                    {doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            {t('editorModal.labelTitle')}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            {t('adminDocs.cover')}
                        </label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={thumbnailUrl}
                                onChange={e => setThumbnailUrl(e.target.value)}
                                className="flex-1 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-[11px] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                                placeholder="https://..."
                            />
                            {doc?.id && (
                                <>
                                    <input type="file" ref={thumbInputRef} onChange={handleThumbUpload} className="hidden" accept="image/*" />
                                    <button 
                                        type="button" 
                                        onClick={() => thumbInputRef.current?.click()}
                                        disabled={isUploadingThumb}
                                        className="p-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-500 transition-colors"
                                    >
                                        <Icon name={isUploadingThumb ? 'loading' : 'plus'} className={`w-5 h-5 text-gray-500 ${isUploadingThumb ? 'animate-spin' : ''}`} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            {t('editorModal.labelCategory')}
                        </label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                        >
                            {availableCategories.map(cat => (
                                <option key={cat.id} value={cat.nameKey}>
                                    {t(`categories.${cat.nameKey}`) || cat.nameKey}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            {t('editorModal.labelTags')}
                        </label>
                        <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 min-h-[60px]">
                            {availableTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => setSelectedTagIds(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                                    style={selectedTagIds.includes(tag.id) ? { backgroundColor: tag.color || '#3b82f6', color: 'white' } : {}}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${!selectedTagIds.includes(tag.id) ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600' : 'border-transparent'}`}
                                >
                                    {tag.name || tag.id}
                                </button>
                            ))}
                            {availableTags.length === 0 && (
                                <p className="text-xs text-gray-400 font-bold italic">
                                    {t('editorModal.noTagsHint')}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs"
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
