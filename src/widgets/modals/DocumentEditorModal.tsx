import React, { useState, useRef, useEffect } from 'react';
import { Document, Category, Tag, UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { StorageApi } from '@shared/api/storage/storage.api';
import { Icon } from '@shared/ui/icons';
import { getCategoryName } from '@shared/lib/utils/format';
import { ALL_ROLES } from '@shared/config/constants';
import { Button, Input, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

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
    const [internalId, setInternalId] = useState(doc?.internalId || '');
    const [description, setDescription] = useState(doc?.description || '');
    const [extendedDescription, setExtendedDescription] = useState(doc?.extendedDescription || '');
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
            internalId: internalId.trim(),
            description: description.trim(),
            extendedDescription: extendedDescription.trim(),
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

    const inputClass = 'w-full rounded-md border border-border bg-surface px-4 py-3 text-sm font-semibold text-fg outline-none transition-all focus-visible:shadow-focus';

    return (
        <ModalOverlay className="z-[60] bg-black/60" onClick={onClose}>
            <ModalPanel className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border-border bg-surface p-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-fg">
                        {doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}
                    </h2>
                    <Button onClick={onClose} variant="ghost" size="icon" className="text-muted-fg">
                        <Icon name="x-mark" className="w-6 h-6" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">
                                 {t('editorModal.internalIdLabel') || 'Внутрішній ID (напр. SPEC-054)'}
                             </label>
                             <Input
                                 type="text"
                                 value={internalId}
                                 onChange={e => setInternalId(e.target.value)}
                                 placeholder="SPEC-001"
                                 className={inputClass}
                             />
                        </div>
                        <div>
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('editorModal.labelTitle')}*</label>
                            <Input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('editorModal.labelCategory')}</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className={`${inputClass} appearance-none`}
                            >
                                {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.nameKey}>{getCategoryName(cat.nameKey, t)}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                             <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">
                                 {t('editorModal.labelDescription') || 'Короткий опис (для карток)'}
                             </label>
                             <textarea
                                 value={description}
                                 onChange={e => setDescription(e.target.value)}
                                 rows={2}
                                className={`${inputClass} resize-none`}
                             />
                        </div>
                        <div>
                             <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">
                                 {t('editorModal.labelExtendedDescription') || 'Розширений опис (для сторінки)'}
                             </label>
                             <textarea
                                 value={extendedDescription}
                                 onChange={e => setExtendedDescription(e.target.value)}
                                 rows={2}
                                className={`${inputClass} resize-none`}
                             />
                        </div>
                    </div>

                    <div className={`rounded-3xl border p-6 transition-all ${viewPermissions.length === 0 ? 'border-danger/30 bg-danger/10' : 'border-primary/20 bg-primary/10'}`}>
                        <label className={`mb-4 block text-[10px] font-black uppercase tracking-widest ${viewPermissions.length === 0 ? 'text-danger' : 'text-primary'}`}>
                            {t('editorModal.labelPermissions')}* {viewPermissions.length === 0 && "(Виберіть хоча б одну роль)"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_ROLES.filter(r => r !== 'admin').map(role => (
                                <Button
                                    key={role}
                                    type="button"
                                    onClick={() => togglePermission(role)}
                                    variant={viewPermissions.includes(role) ? 'primary' : 'outline'}
                                    className={`h-auto rounded-xl border-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider ${
                                        viewPermissions.includes(role)
                                            ? ''
                                            : 'text-primary'
                                    }`}
                                >
                                    {t(`roles.${role}`)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('editorModal.labelTags')}</label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <Button
                                    key={tag.id}
                                    type="button"
                                    variant={selectedTagIds.includes(tag.id) ? 'primary' : 'outline'}
                                    onClick={() => setSelectedTagIds(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                                    className="h-auto rounded-lg border-2 px-3 py-1.5 text-[10px] font-bold"
                                >
                                    {tag.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('adminDocs.cover')} (URL)</label>
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                value={thumbnailUrl}
                                onChange={e => setThumbnailUrl(e.target.value)}
                                className="flex-1 text-xs font-bold"
                                placeholder="https://..."
                            />
                            {doc?.id && (
                                <Button
                                    type="button" 
                                    onClick={() => thumbInputRef.current?.click()} 
                                    disabled={isUploadingThumb}
                                    variant="outline"
                                    className="min-w-[64px] rounded-2xl px-6"
                                >
                                    <Icon 
                                        name={isUploadingThumb ? 'loading' : 'plus'} 
                                        className={`w-6 h-6 ${isUploadingThumb ? 'text-primary' : 'text-muted-fg'}`}
                                    />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-12 flex-1 text-[10px] font-black uppercase tracking-widest text-muted-fg">{t('common.cancel')}</Button>
                        <Button
                            type="submit" 
                            disabled={!isFormValid}
                            className="h-12 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                        >
                            {t('common.save')}
                        </Button>
                    </div>
                </form>
                <input type="file" ref={thumbInputRef} onChange={handleThumbUpload} className="hidden" accept="image/*" />
            </ModalPanel>
        </ModalOverlay>
    );
};
