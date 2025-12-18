import React, { useState, useEffect } from 'react';
import { Category, Document, UserRole, IconName } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { uploadDocumentFile, listDocumentFiles, deleteDocumentFile, isFileTypeAllowed } from '../utils/storage';

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
    const [selectedDocForFiles, setSelectedDocForFiles] = useState<Document | null>(null);
    const [docFiles, setDocFiles] = useState<{name: string, url: string, extension?: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'admin'];

    const togglePermission = (category: Category, role: UserRole) => {
        const newPermissions = category.viewPermissions.includes(role)
            ? category.viewPermissions.filter(r => r !== role)
            : [...category.viewPermissions, role];
        onUpdateCategory({ ...category, viewPermissions: newPermissions });
    };

    const handleRequestAction = (id: string, action: 'approve' | 'deny') => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'denied' } : req));
    };

    const loadFiles = async (doc: Document) => {
        const files = await listDocumentFiles(doc.id);
        setDocFiles(files);
    };

    useEffect(() => {
        if (selectedDocForFiles) loadFiles(selectedDocForFiles);
    }, [selectedDocForFiles]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedDocForFiles || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        
        if (!isFileTypeAllowed(file.name)) {
            alert("Invalid file type! Only PDF, Word, and Excel are allowed.");
            return;
        }

        setIsUploading(true);
        try {
            await uploadDocumentFile(selectedDocForFiles.id, file);
            await loadFiles(selectedDocForFiles);
        } catch (error) {
            console.error(error);
            alert("Upload failed. Make sure Firebase Storage is configured correctly.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileDelete = async (fileName: string) => {
        if (!selectedDocForFiles || !window.confirm(`Delete ${fileName}?`)) return;
        await deleteDocumentFile(selectedDocForFiles.id, fileName);
        await loadFiles(selectedDocForFiles);
    };

    const navItems = [
        { id: 'roles', label: t('adminPanel.tabs.roles'), icon: 'users' as IconName },
        { id: 'categories', label: t('adminPanel.tabs.categories'), icon: 'view-grid' as IconName },
        { id: 'documents', label: t('adminPanel.tabs.documents'), icon: 'hr' as IconName },
        { id: 'requests', label: 'Requests', icon: 'paper-airplane' as IconName },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 pt-16 sm:pt-12 min-h-[80vh]">
            {/* Admin Internal Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Icon name="cog" className="w-5 h-5" />{t('adminPanel.title')}</h2>
                    </div>
                    <nav className="p-2">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => { setActiveTab(item.id as any); setSelectedDocForFiles(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id && !selectedDocForFiles ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                <Icon name={item.icon} className="w-5 h-5" />{item.label}
                                {item.id === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Admin Content Area */}
            <main className="flex-grow">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-full p-6">
                    {selectedDocForFiles ? (
                        <div className="animate-fade-in">
                             <button onClick={() => setSelectedDocForFiles(null)} className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-6 hover:underline">
                                <Icon name="plus" className="w-4 h-4 rotate-45" /> Back to Documents
                            </button>
                            <h3 className="text-xl font-black mb-1">{selectedDocForFiles.title || t(selectedDocForFiles.titleKey!)}</h3>
                            <p className="text-sm text-gray-500 mb-8 uppercase tracking-widest font-bold">Manage Storage Files</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Files in Storage</h4>
                                    {docFiles.map(file => (
                                        <div key={file.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <Icon name={file.extension === 'pdf' ? 'pdf' : 'hr'} className="w-6 h-6 text-gray-400" />
                                                <span className="text-sm font-bold truncate max-w-[150px]">{file.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <a href={file.url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Icon name="download" className="w-4 h-4" /></a>
                                                <button onClick={() => handleFileDelete(file.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icon name="plus" className="w-4 h-4 rotate-45" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {docFiles.length === 0 && <p className="text-sm text-gray-400 italic">No files uploaded yet.</p>}
                                </div>
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-dashed border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center text-center">
                                    <Icon name="upload" className={`w-12 h-12 mb-4 ${isUploading ? 'animate-bounce text-blue-400' : 'text-blue-600'}`} />
                                    <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">Upload New File</h4>
                                    <p className="text-xs text-blue-700/60 dark:text-blue-400/60 mb-6">Allowed: .pdf, .doc, .docx, .xls, .xlsx</p>
                                    <input type="file" id="admin-file-upload" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    <label htmlFor="admin-file-upload" className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm cursor-pointer hover:bg-blue-700 transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                        {isUploading ? 'Uploading...' : 'Select File'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                        {activeTab === 'roles' && (
                            <div className="animate-fade-in">
                                <header className="mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminPanel.tabs.roles')}</h3>
                                    <p className="text-sm text-gray-500">Manage category visibility permissions.</p>
                                </header>
                                <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead><tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700"><th className="py-4 px-6 font-bold text-xs text-gray-500 dark:text-gray-400 uppercase">Category</th>{roles.map(role => (<th key={role} className="py-4 px-4 font-bold text-[10px] text-gray-500 dark:text-gray-400 uppercase text-center">{t(`roles.${role}`)}</th>))}</tr></thead>
                                        <tbody>{categories.map(cat => (<tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 transition-colors"><td className="py-4 px-6 font-bold text-gray-900 dark:text-white text-sm">{t(cat.nameKey)}</td>{roles.map(role => (<td key={role} className="py-4 px-4 text-center"><input type="checkbox" checked={cat.viewPermissions.includes(role)} onChange={() => togglePermission(cat, role)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" disabled={role === 'admin'} /></td>))}</tr>))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className="animate-fade-in">
                                <header className="mb-6 flex justify-between items-center">
                                    <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminPanel.tabs.categories')}</h3><p className="text-sm text-gray-500">Manage system categories.</p></div>
                                    <button onClick={() => onAddCategory({})} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"><Icon name="plus" className="w-4 h-4" /> {t('common.add')}</button>
                                </header>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{categories.map(cat => (<div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between group"><div className="flex items-center gap-4"><div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-blue-600 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"><Icon name={cat.iconName} className="w-6 h-6" /></div><div><p className="font-bold text-gray-900 dark:text-white text-base">{t(cat.nameKey)}</p></div></div><div className="flex gap-2"><button onClick={() => onUpdateCategory(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Icon name="cog" className="w-4 h-4" /></button><button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Icon name="plus" className="w-4 h-4 rotate-45" /></button></div></div>))}</div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="animate-fade-in">
                                <header className="mb-6 flex justify-between items-center">
                                    <div><h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('adminPanel.tabs.documents')}</h3><p className="text-sm text-gray-500">Manage documents and attach files.</p></div>
                                    <button onClick={onAddDocument} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"><Icon name="plus" className="w-4 h-4" /> {t('common.add')}</button>
                                </header>
                                <div className="space-y-2">{documents.map(doc => (<div key={doc.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-blue-300 transition-all group"><div className="flex-grow min-w-0 pr-4"><p className="font-bold text-gray-900 dark:text-white text-sm truncate">{doc.titleKey ? t(doc.titleKey) : doc.title}</p><p className="text-[10px] text-gray-500 font-mono mt-0.5">{t(doc.categoryKey)} • {doc.updatedAt.toLocaleDateString()}</p></div><div className="flex items-center gap-2"><button onClick={() => setSelectedDocForFiles(doc)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"><Icon name="upload" className="w-3.5 h-3.5" /> Files</button><button onClick={() => onEditDocument(doc)} className="p-2 text-gray-400 hover:text-blue-600"><Icon name="cog" className="w-4 h-4" /></button><button onClick={() => onDeleteDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-600"><Icon name="plus" className="w-4 h-4 rotate-45" /></button></div></div>))}</div>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="animate-fade-in">
                                <header className="mb-6"><h3 className="text-xl font-bold text-gray-900 dark:text-white">Access Requests</h3><p className="text-sm text-gray-500">Manage user access requests.</p></header>
                                <div className="space-y-3">{requests.map(req => (<div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between shadow-sm"><div className="flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">{req.name[0]}</div><div><p className="font-bold text-sm">{req.name}</p><p className="text-[10px] text-gray-500 uppercase">{req.company}</p></div></div>{req.status === 'pending' ? (<div className="flex gap-2"><button onClick={() => handleRequestAction(req.id, 'deny')} className="px-3 py-1 text-xs font-bold text-red-600">Deny</button><button onClick={() => handleRequestAction(req.id, 'approve')} className="px-3 py-1 text-xs font-bold bg-green-600 text-white rounded">Approve</button></div>) : (<span className="text-[10px] font-black uppercase text-gray-400">{req.status}</span>)}</div>))}</div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};
