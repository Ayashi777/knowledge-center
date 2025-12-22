import React, { useState, useEffect } from 'react';
import { Category, UserRole, IconName } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { ALL_ROLES } from '@shared/config/constants';

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

    const icons: IconName[] = ['folder', 'document-text', 'construction', 'electrical', 'safety', 'logistics', 'it', 'hr', 'finance', 'legal'];

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg p-8 border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {category?.id?.toString().startsWith('cat') ? t('categoryEditorModal.createTitle') : t('categoryEditorModal.editTitle')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Icon name="x-mark" className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            {t('categoryEditorModal.labelName')}
                        </label>
                        <input
                            type="text"
                            value={nameKey}
                            onChange={e => setNameKey(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            placeholder="e.g. documentation_key"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            {t('categoryEditorModal.labelIcon')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {icons.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setIconName(icon)}
                                    className={`p-3 rounded-xl border-2 transition-all ${iconName === icon ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                                >
                                    <Icon name={icon} className="w-5 h-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-3xl border border-purple-100 dark:border-purple-900/30">
                        <label className="block text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-4">
                            {t('categoryEditorModal.labelPermissions')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_ROLES.filter(r => r !== 'admin').map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => togglePermission(role)}
                                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                                        viewPermissions.includes(role)
                                            ? 'bg-purple-600 border-purple-600 text-white'
                                            : 'bg-white dark:bg-gray-800 border-purple-100 dark:border-gray-700 text-purple-400'
                                    }`}
                                >
                                    {t(`roles.${role}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 font-black uppercase text-[10px] tracking-widest text-gray-400">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
