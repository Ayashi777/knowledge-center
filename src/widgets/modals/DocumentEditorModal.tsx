import React, { useState, useRef, useEffect } from 'react';
import { Document, Category, Tag, UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { StorageApi } from '@shared/api/storage/storage.api';
import { Icon } from '@shared/ui/icons';
import { getCategoryName } from '@shared/lib/utils/format';
import { ALL_ROLES } from '@shared/config/constants';

export const DocumentEditorModal: React.FC<{
    doc: Partial<Document> | null,
    onSave: (doc: Partial<Document>) => void,
    onClose: () => void,
    availableCategories: Category[],
    availableTags: Tag[]
}> = ({ doc, onSave, onClose, availableCategories, availableTags }) => {
    const { t } = useI18n();
    
    const initialTitle = doc?.title || (doc?.titleKey ? t(doc.titleKey) : '');
    const [title, setTitle] = useState(initialTitle);
    const [category, setCategory] = useState(doc?.categoryKey || availableCategories[0]?.nameKey || '');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(doc?.tagIds || []);
    const [viewPermissions, setViewPermissions] = useState<UserRole[]>(doc?.viewPermissions || []);
    const [thumbnailUrl, setThumbnailUrl] = useState(doc?.thumbnailUrl || '');
    const [isUploadingThumb, setIsUploadingThumb] = useState(false);
    
    const thumbInputRef = useRef<HTMLInputElement>(null);

    // 🔥 Validation: Title must be present and at least one role must be selected
    const isFormValid = title.trim().length > 0 && viewPermissions.length > 0;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        onSave({
            ...doc,
            title: title.trim(),
            categoryKey: category,
            tagIds: selectedTagIds,
            viewPermissions: viewPermissions,
            thumbnailUrl: thumbnailUrl
        });
    };

    const togglePermission = (role: UserRole) => {
        setViewPermissions(prev => 
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
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
        } finally {
            setIsUploadingThumb(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl p-8 border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Icon name="x-mark" className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('editorModal.labelTitle')}*</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('editorModal.labelCategory')}</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
                            >
                                {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.nameKey}>{getCategoryName(cat.nameKey, t)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={`p-6 rounded-3xl border transition-all ${viewPermissions.length === 0 ? 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30'}`}>
                        <label className={`block text-[10px] font-black uppercase tracking-widest mb-4 ${viewPermissions.length === 0 ? 'text-red-600' : 'text-blue-600 dark:text-blue-400'}`}>
                            {t('editorModal.labelPermissions')}* {viewPermissions.length === 0 && "(Виберіть хоча б одну роль)"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_ROLES.filter(r => r !== 'admin').map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => togglePermission(role)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                                        viewPermissions.includes(role)
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'bg-white dark:bg-gray-800 border-blue-100 dark:border-gray-700 text-blue-400'
                                    }`}
                                >
                                    {t(`roles.${role}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('editorModal.labelTags')}</label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => setSelectedTagIds(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all ${
                                        selectedTagIds.includes(tag.id) ? 'bg-gray-800 dark:bg-white border-gray-800 dark:border-white text-white dark:text-gray-800' : 'bg-transparent border-gray-200 text-gray-400'
                                    }`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('adminDocs.cover')} (URL)</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={thumbnailUrl}
                                onChange={e => setThumbnailUrl(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-xs font-bold"
                                placeholder="https://..."
                            />
                            {doc?.id && (
                                <button 
                                    type="button" 
                                    onClick={() => thumbInputRef.current?.click()} 
                                    disabled={isUploadingThumb}
                                    className="px-6 bg-gray-100 dark:bg-gray-700 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center min-w-[64px]"
                                >
                                    <Icon 
                                        name={isUploadingThumb ? 'loading' : 'plus'} 
                                        className={`w-6 h-6 ${isUploadingThumb ? 'text-blue-600' : 'text-gray-500'}`} 
                                    />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 font-black uppercase text-[10px] tracking-widest text-gray-400">{t('common.cancel')}</button>
                        <button 
                            type="submit" 
                            disabled={!isFormValid}
                            className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all ${
                                isFormValid 
                                ? 'bg-blue-600 text-white shadow-blue-500/20' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {t('common.save')}
                        </button>
                    </div>
                </form>
                <input type="file" ref={thumbInputRef} onChange={handleThumbUpload} className="hidden" accept="image/*" />
            </div>
        </div>
    );
};
