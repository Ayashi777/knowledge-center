import React, { useState } from 'react';
import { Category, Document, UserRole, IconName } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';

interface AccessRequest {
    id: string;
    name: string;
    email: string;
    company: string;
    status: 'pending' | 'approved' | 'denied';
    date: string;
}

const mockRequests: AccessRequest[] = [
    { id: '1', name: 'Ivan Petrov', email: 'ivan@stroy.ua', company: 'StroyInvest', status: 'pending', date: '2025-12-18' },
    { id: '2', name: 'Olena Sydorenko', email: 'o.syd@arch.com', company: 'Design Bureau', status: 'pending', date: '2025-12-17' },
];

export const AdminPanel: React.FC<{ 
    categories: Category[], 
    documents: Document[],
    onUpdateCategory: (cat: Category) => void,
    onDeleteCategory: (id: string) => void,
    onAddCategory: (cat: Partial<Category>) => void,
    onDeleteDocument: (id: string) => void,
    onEditDocument: (doc: Document) => void,
    onAddDocument: () => void,
    onClose: () => void 
}> = ({ 
    categories, 
    documents,
    onUpdateCategory, 
    onDeleteCategory,
    onAddCategory,
    onDeleteDocument,
    onEditDocument,
    onAddDocument,
    onClose 
}) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'roles' | 'categories' | 'documents' | 'requests'>('roles');
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

    const navItems = [
        { id: 'roles', label: t('adminPanel.tabs.roles'), icon: 'users' as IconName },
        { id: 'categories', label: t('adminPanel.tabs.categories'), icon: 'view-grid' as IconName },
        { id: 'documents', label: t('adminPanel.tabs.documents'), icon: 'hr' as IconName }, // using hr as doc icon placeholder
        { id: 'requests', label: 'Requests', icon: 'paper-airplane' as IconName },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 pt-16 sm:pt-12 min-h-[80vh]">
            {/* Admin Internal Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Icon name="cog" className="w-5 h-5" />
                            {t('adminPanel.title')}
                        </h2>
                    </div>
                    <nav className="p-2">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === item.id 
                                    ? 'bg-blue-600 text-white shadow-md' 
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Icon name={item.icon} className="w-5 h-5" />
                                {item.label}
                                {item.id === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {requests.filter(r => r.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                         <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Icon name="plus" className="w-4 h-4 rotate-45" />
                            {t('docView.backToList')}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Admin Content Area */}
            <main className="flex-grow">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-full">
                    <div className="p-6">
                        {activeTab === 'roles' && (
                            <div className="animate-fade-in">
                                <header className="mb-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminPanel.tabs.roles')}</h3>
                                        <p className="text-sm text-gray-500">Manage which user roles can access specific categories.</p>
                                    </div>
                                </header>
                                <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-lg">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                <th className="py-4 px-6 font-bold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('adminPanel.matrix.category')}</th>
                                                {roles.map(role => (
                                                    <th key={role} className="py-4 px-4 font-bold text-[10px] text-gray-500 dark:text-gray-400 uppercase text-center tracking-tighter">{t(`roles.${role}`)}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map(cat => (
                                                <tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white text-sm">
                                                        {t(cat.nameKey)}
                                                    </td>
                                                    {roles.map(role => (
                                                        <td key={role} className="py-4 px-4 text-center">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={cat.viewPermissions.includes(role)}
                                                                onChange={() => togglePermission(cat, role)}
                                                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform hover:scale-110"
                                                                disabled={role === 'admin'}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className="animate-fade-in">
                                <header className="mb-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminPanel.tabs.categories')}</h3>
                                        <p className="text-sm text-gray-500">Edit or create resource categories.</p>
                                    </div>
                                    <button onClick={() => onAddCategory({})} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                        <Icon name="plus" className="w-4 h-4" /> {t('common.add')}
                                    </button>
                                </header>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-blue-600 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
                                                    <Icon name={cat.iconName} className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-base">{t(cat.nameKey)}</p>
                                                    <div className="flex gap-1 mt-1">
                                                        {cat.viewPermissions.map(rp => (
                                                            <span key={rp} className="text-[9px] px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 font-bold uppercase">{rp[0]}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onUpdateCategory(cat)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                                                    <Icon name="cog" className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                    <Icon name="plus" className="w-4 h-4 rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="animate-fade-in">
                                <header className="mb-6 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminPanel.tabs.documents')}</h3>
                                        <p className="text-sm text-gray-500">Manage all documents in the knowledge center.</p>
                                    </div>
                                    <button onClick={onAddDocument} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                        <Icon name="plus" className="w-4 h-4" /> {t('common.add')}
                                    </button>
                                </header>
                                <div className="space-y-2">
                                    {documents.map(doc => (
                                        <div key={doc.id} className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-900 transition-all group">
                                            <div className="flex-grow min-w-0 pr-4">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{doc.titleKey ? t(doc.titleKey) : doc.title}</p>
                                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{t(doc.categoryKey)} • {doc.updatedAt.toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => onEditDocument(doc)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                    <Icon name="cog" className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => onDeleteDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                    <Icon name="plus" className="w-4 h-4 rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="animate-fade-in">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Access Requests</h3>
                                    <p className="text-sm text-gray-500">Approve or deny new user registration requests.</p>
                                </header>
                                <div className="space-y-3">
                                    {requests.map(req => (
                                        <div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black shadow-lg">
                                                    {req.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-base">{req.name}</p>
                                                    <p className="text-xs text-gray-500">{req.email} • <span className="font-semibold text-gray-700 dark:text-gray-300">{req.company}</span></p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{req.date}</p>
                                                </div>
                                            </div>
                                            {req.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleRequestAction(req.id, 'deny')} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg hover:bg-red-100 transition-colors">Deny</button>
                                                    <button onClick={() => handleRequestAction(req.id, 'approve')} className="px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md">Approve</button>
                                                </div>
                                            ) : (
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                                                    {req.status}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                    {requests.length === 0 && (
                                        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                            <p className="text-gray-500">No active requests.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};
