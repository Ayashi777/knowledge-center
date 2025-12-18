import React, { useState } from 'react';
import { Category, UserRole } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';

interface AccessRequest {
    id: string;
    name: string;
    email: string;
    company: string;
    status: 'pending' | 'approved' | 'denied';
}

const mockRequests: AccessRequest[] = [
    { id: '1', name: 'Ivan Petrov', email: 'ivan@stroy.ua', company: 'StroyInvest', status: 'pending' },
    { id: '2', name: 'Olena Sydorenko', email: 'o.syd@arch.com', company: 'Design Bureau', status: 'pending' },
];

export const AdminPanel: React.FC<{ 
    categories: Category[], 
    onUpdateCategory: (cat: Category) => void,
    onClose: () => void 
}> = ({ categories, onUpdateCategory, onClose }) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'roles' | 'categories' | 'requests'>('roles');
    const [requests, setRequests] = useState<AccessRequest[]>(mockRequests);
    
    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'admin'];

    const togglePermission = (category: Category, role: UserRole) => {
        const newPermissions = category.viewPermissions.includes(role)
            ? category.viewPermissions.filter(r => r !== role)
            : [...category.viewPermissions, role];
        
        onUpdateCategory({ ...category, viewPermissions: newPermissions });
    };

    const handleRequestAction = (id: string, action: 'approve' | 'deny') => {
        setRequests(prev => prev.map(req => 
            req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'denied' } : req
        ));
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Icon name="cog" className="w-6 h-6" />
                        {t('adminPanel.title')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Icon name="plus" className="w-6 h-6 rotate-45" />
                    </button>
                </div>
                
                <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button 
                        onClick={() => setActiveTab('roles')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'roles' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {t('adminPanel.tabs.roles')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('categories')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'categories' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        {t('adminPanel.tabs.categories')}
                    </button>
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors relative ${activeTab === 'requests' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    >
                        Requests
                        {requests.filter(r => r.status === 'pending').length > 0 && (
                            <span className="absolute top-2 right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                </div>

                <div className="flex-grow overflow-auto p-6 bg-white dark:bg-gray-800">
                    {activeTab === 'roles' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="py-4 px-4 font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('adminPanel.matrix.category')}</th>
                                        {roles.map(role => (
                                            <th key={role} className="py-4 px-4 font-bold text-[10px] text-gray-500 dark:text-gray-400 uppercase text-center tracking-tighter">{t(`roles.${role}`)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(cat => (
                                        <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                            <td className="py-4 px-4 font-bold text-gray-900 dark:text-white text-sm">
                                                {t(cat.nameKey)}
                                            </td>
                                            {roles.map(role => (
                                                <td key={role} className="py-4 px-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={cat.viewPermissions.includes(role)}
                                                        onChange={() => togglePermission(cat, role)}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        disabled={role === 'admin'}
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
                                <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-md text-blue-600 shadow-sm">
                                            <Icon name={cat.iconName} className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{t(cat.nameKey)}</p>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                                {cat.viewPermissions.length} roles
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wide">{t('common.edit')}</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-3">
                            {requests.map(req => (
                                <div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold">
                                            {req.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">{req.name}</p>
                                            <p className="text-xs text-gray-500">{req.email} • {req.company}</p>
                                        </div>
                                    </div>
                                    {req.status === 'pending' ? (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleRequestAction(req.id, 'deny')}
                                                className="px-3 py-1 text-xs font-bold text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
                                            >
                                                Deny
                                            </button>
                                            <button 
                                                onClick={() => handleRequestAction(req.id, 'approve')}
                                                className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                Approve
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {req.status}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {requests.length === 0 && <p className="text-center py-10 text-gray-500">No requests found.</p>}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center px-6">
                    <p className="text-xs text-gray-500 italic">Changes are saved locally in this simulation.</p>
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg">
                        {t('common.completed')}
                    </button>
                </div>
            </div>
        </div>
    );
};
