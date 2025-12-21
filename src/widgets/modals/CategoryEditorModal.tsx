import React, { useState } from 'react';
import { Category, IconName, UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '../../../components/icons';

export const CategoryEditorModal: React.FC<{ category: Category, onSave: (cat: Category) => void, onClose: () => void }> = ({ category, onSave, onClose }) => {
    const { t } = useI18n();
    const [nameKey, setNameKey] = useState(category.nameKey);
    const [iconName, setIconName] = useState<IconName>(category.iconName || 'construction');
    const [permissions, setPermissions] = useState<UserRole[]>(category.viewPermissions || ['admin']);

    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'architect', 'admin'];
    const availableIcons: IconName[] = ['construction', 'electrical', 'safety', 'logistics', 'it', 'hr', 'finance', 'legal', 'view-boards'];

    const togglePermission = (role: UserRole) => {
        if (role === 'admin') return;
        setPermissions(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...category, nameKey, iconName, viewPermissions: permissions });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
                        {t('categoryEditorModal.editTitle')}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                {t('categoryEditorModal.labelName')}
                            </label>
                            <input
                                type="text"
                                value={nameKey}
                                onChange={e => setNameKey(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Наприклад: Fixit"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                {t('categoryEditorModal.labelIcon')}
                            </label>
                            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                                {availableIcons.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setIconName(icon)}
                                        className={`p-3 rounded-xl border transition-all flex items-center justify-center ${iconName === icon
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 ring-2 ring-blue-500/20'
                                            : 'border-gray-100 dark:border-gray-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Icon name={icon} className="w-5 h-5" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                {t('categoryEditorModal.labelPermissions')}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {roles.map(role => (
                                    <label
                                        key={role}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${permissions.includes(role)
                                            ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                                            : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={permissions.includes(role)}
                                            onChange={() => togglePermission(role)}
                                            disabled={role === 'admin'}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {t(`roles.${role}`)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors text-sm uppercase tracking-widest"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-10 py-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest text-xs"
                            >
                                {t('common.save')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
