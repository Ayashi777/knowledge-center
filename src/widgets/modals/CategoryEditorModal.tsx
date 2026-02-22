import React, { useState, useEffect } from 'react';
import { Category, UserRole, IconName } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { ALL_ROLES } from '@shared/config/constants';
import { Button, Input, ModalOverlay, ModalPanel } from '@shared/ui/primitives';

export const CategoryEditorModal: React.FC<{
    category: Partial<Category> | null,
    onSave: (category: Partial<Category>) => void,
    onClose: () => void
}> = ({ category, onSave, onClose }) => {
    const { t } = useI18n();
    
    const [nameKey, setNameKey] = useState(category?.nameKey || '');
    const [iconName, setIconName] = useState<IconName>(category?.iconName || 'folder');
    const [viewPermissions, setViewPermissions] = useState<UserRole[]>(category?.viewPermissions || []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameKey.trim()) return;

        onSave({
            ...category,
            nameKey: nameKey.trim(),
            iconName,
            viewPermissions
        });
    };

    const togglePermission = (role: UserRole) => {
        setViewPermissions(prev => 
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const icons: IconName[] = ['folder', 'document-text', 'video-camera', 'construction', 'electrical', 'safety', 'logistics', 'it', 'hr', 'finance', 'legal'];

    // For categories, we still show all roles because an admin might want to create a private category for staff
    const rolesForPermissions = ALL_ROLES.filter(r => r !== 'admin');

    return (
        <ModalOverlay className="z-[60] bg-black/60" onClick={onClose}>
            <ModalPanel className="max-w-lg rounded-3xl border-border bg-surface p-8" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight text-fg">
                        {category?.id?.toString().startsWith('cat') ? t('categoryEditorModal.createTitle') : t('categoryEditorModal.editTitle')}
                    </h2>
                    <Button onClick={onClose} variant="ghost" size="icon" className="text-muted-fg">
                        <Icon name="x-mark" className="w-6 h-6" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">
                            {t('categoryEditorModal.labelName')}
                        </label>
                        <Input
                            type="text"
                            value={nameKey}
                            onChange={e => setNameKey(e.target.value)}
                            className="h-12 rounded-2xl px-4 font-bold"
                            placeholder={t('categoryEditorModal.placeholderName')}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-fg">
                            {t('categoryEditorModal.labelIcon')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {icons.map(icon => (
                                <Button
                                    key={icon}
                                    type="button"
                                    onClick={() => setIconName(icon)}
                                    variant={iconName === icon ? 'primary' : 'outline'}
                                    className="h-11 w-11 rounded-xl border-2 p-0 text-muted-fg"
                                >
                                    <Icon name={icon} className="w-5 h-5" />
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-primary/20 bg-primary/10 p-6">
                        <label className="mb-4 block text-[10px] font-black uppercase tracking-widest text-primary">
                            {t('categoryEditorModal.labelPermissions')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {rolesForPermissions.map(role => (
                                <Button
                                    key={role}
                                    type="button"
                                    onClick={() => togglePermission(role)}
                                    variant={viewPermissions.includes(role) ? 'primary' : 'outline'}
                                    className="h-auto rounded-xl border-2 px-3 py-2 text-[10px] font-black uppercase tracking-wider"
                                >
                                    {t(`roles.${role}`)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="h-12 flex-1 text-[10px] font-black uppercase tracking-widest text-muted-fg">
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" className="h-12 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                            {t('common.save')}
                        </Button>
                    </div>
                </form>
            </ModalPanel>
        </ModalOverlay>
    );
};
