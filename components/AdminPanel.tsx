import React, { useState } from 'react';
import { Category, UserRole } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';

export const AdminPanel: React.FC<{ 
    categories: Category[], 
    onUpdateCategory: (cat: Category) => void,
    onClose: () => void 
}> = ({ categories, onUpdateCategory, onClose }) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'roles' | 'categories'>('roles');
    
    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'admin'];

    const togglePermission = (category: Category, role: UserRole) => {
        const newPermissions = category.viewPermissions.includes(role)
            ? category.viewPermissions.filter(r => r !== role)
            : [...category.viewPermissions, role];
        
        onUpdateCategory({ ...category, viewPermissions: newPermissions });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icon name="cog" className="w-6 h-6" />
                        {t('adminPanel.title')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Icon name="plus" className="w-6 h-6 rotate-45" />
                    </button>
                </div>
                
                <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <button 
                        onClick={() => setActiveTab('roles')}
                        className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'roles' ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {t('adminPanel.tabs.roles')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('categories')}
                        className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'categories' ? 'border-blue-600 text-blue-600 bg-white dark:bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {t('adminPanel.tabs.categories')}
                    </button>
                </div>

                <div className="flex-grow overflow-auto p-6">
                    {activeTab === 'roles' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-4 px-4 font-bold text-sm text-gray-500 dark:text-gray-400 uppercase">{t('adminPanel.matrix.category')}</th>
                                        {roles.map(role => (
                                            <th key={role} className="py-4 px-4 font-bold text-sm text-gray-500 dark:text-gray-400 uppercase text-center">{t(`roles.${role}`)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                            <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                                                {t(cat.nameKey)}
                                            </td>
                                            {roles.map(role => (
                                                <td key={role} className="py-4 px-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={cat.viewPermissions.includes(role)}
                                                        onChange={() => togglePermission(cat, role)}
                                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        disabled={role === 'admin'} // Admin always has access
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map(cat => (
                                <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                                            <Icon name={cat.iconName} className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{t(cat.nameKey)}</p>
                                            <p className="text-xs text-gray-500">{cat.viewPermissions.length} roles have access</p>
                                        </div>
                                    </div>
                                    <button className="text-sm font-semibold text-blue-600 hover:underline">{t('common.edit')}</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition-colors">
                        {t('common.completed')}
                    </button>
                </div>
            </div>
        </div>
    );
};
