import React, { useState, useEffect } from 'react';
import { Category, Document, UserRole, IconName } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { uploadDocumentFile, listDocumentFiles, deleteDocumentFile, isFileTypeAllowed } from '../utils/storage';
import { collection, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface AccessRequest {
    id: string;
    name: string;
    email: string;
    company: string;
    status: 'pending' | 'approved' | 'denied';
    date: string;
}

interface UserProfile {
    uid: string;
    email: string;
    role: UserRole;
}

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
    categories, documents, onUpdateCategory, onDeleteCategory, onAddCategory,
    onDeleteDocument, onEditDocument, onAddDocument, onClose 
}) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState<'roles' | 'categories' | 'documents' | 'requests' | 'users'>('roles');
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedDocForFiles, setSelectedDocForFiles] = useState<Document | null>(null);
    const [docFiles, setDocFiles] = useState<{name: string, url: string, extension?: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    
    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'admin'];

    // --- Real-time Users & Requests ---
    useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
            setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })) as UserProfile[]);
        });
        const unsubReqs = onSnapshot(collection(db, "requests"), (snap) => {
            setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as AccessRequest[]);
        });
        return () => { unsubUsers(); unsubReqs(); };
    }, []);

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
        } catch (error) {
            alert("Помилка оновлення прав.");
        }
    };

    const togglePermission = (category: Category, role: UserRole) => {
        const newPermissions = category.viewPermissions.includes(role)
            ? category.viewPermissions.filter(r => r !== role)
            : [...category.viewPermissions, role];
        onUpdateCategory({ ...category, viewPermissions: newPermissions });
    };

    const loadFiles = async (docItem: Document) => {
        const files = await listDocumentFiles(docItem.id);
        setDocFiles(files);
    };

    useEffect(() => { if (selectedDocForFiles) loadFiles(selectedDocForFiles); }, [selectedDocForFiles]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedDocForFiles || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        if (!isFileTypeAllowed(file.name)) { alert("Недопустимий тип файлу!"); return; }
        setIsUploading(true);
        try {
            await uploadDocumentFile(selectedDocForFiles.id, file);
            await loadFiles(selectedDocForFiles);
        } catch (error) { alert("Помилка завантаження."); } finally { setIsUploading(false); }
    };

    const handleFileDelete = async (fileName: string) => {
        if (!selectedDocForFiles || !window.confirm(`Видалити ${fileName}?`)) return;
        await deleteDocumentFile(selectedDocForFiles.id, fileName);
        await loadFiles(selectedDocForFiles);
    };

    const navItems = [
        { id: 'roles', label: 'Доступи', icon: 'users' as IconName },
        { id: 'users', label: 'Користувачі', icon: 'users' as IconName },
        { id: 'categories', label: 'Категорії', icon: 'view-grid' as IconName },
        { id: 'documents', label: 'Документи', icon: 'hr' as IconName },
        { id: 'requests', label: 'Заявки', icon: 'paper-airplane' as IconName },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8 pt-16 sm:pt-12 min-h-[80vh]">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Icon name="cog" className="w-5 h-5" />Адмін-центр</h2>
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

            <main className="flex-grow">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-full p-6">
                    {selectedDocForFiles ? (
                        <div className="animate-fade-in">
                             <button onClick={() => setSelectedDocForFiles(null)} className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-6 hover:underline"><Icon name="plus" className="w-4 h-4 rotate-45" /> Назад до списку</button>
                            <h3 className="text-xl font-black mb-1">{selectedDocForFiles.title || t(selectedDocForFiles.titleKey!)}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">Файли у сховищі</h4>
                                    {docFiles.map(file => (
                                        <div key={file.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3 min-w-0"><Icon name={file.extension === 'pdf' ? 'pdf' : 'hr'} className="w-6 h-6 text-gray-400" /><span className="text-sm font-bold truncate">{file.name}</span></div>
                                            <div className="flex gap-2 shrink-0"><a href={file.url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Icon name="download" className="w-4 h-4" /></a><button onClick={() => handleFileDelete(file.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icon name="plus" className="w-4 h-4 rotate-45" /></button></div>
                                        </div>
                                    ))}
                                    {docFiles.length === 0 && <p className="text-sm text-gray-400 italic text-center sm:text-left">Файли відсутні.</p>}
                                </div>
                                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-10 rounded-3xl border border-dashed border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center text-center">
                                    <Icon name="upload" className={`w-16 h-16 mb-4 ${isUploading ? 'animate-bounce text-blue-400' : 'text-blue-600'}`} />
                                    <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-lg">Завантажити файл</h4>
                                    <p className="text-xs text-blue-700/60 dark:text-blue-400/60 mb-8 font-semibold uppercase tracking-tighter">Дозволені: .pdf, .word, .excel</p>
                                    <input type="file" id="admin-file-upload" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                    <label htmlFor="admin-file-upload" className={`px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>{isUploading ? 'Завантаження...' : 'Обрати файл'}</label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                        {activeTab === 'users' && (
                            <div className="animate-fade-in text-center sm:text-left">
                                <header className="mb-8"><h3 className="text-2xl font-black text-gray-900 dark:text-white">База користувачів</h3><p className="text-sm text-gray-500 font-semibold mt-1">Керування ролями та рівнями доступу в системі.</p></header>
                                <div className="space-y-3">
                                    {users.map(user => (
                                        <div key={user.uid} className="p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">{user.email ? user.email[0].toUpperCase() : '?'}</div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900 dark:text-white">{user.email}</p>
                                                    <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase font-bold">{user.uid}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-1.5 p-1.5 bg-white/50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-gray-800">
                                                {roles.map(r => (
                                                    <button key={r} onClick={() => handleRoleChange(user.uid, r)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${user.role === r ? 'bg-blue-600 text-white shadow-md scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {users.length === 0 && <p className="text-center py-20 text-gray-400 italic">Користувачі не знайдені.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'roles' && (
                            <div className="animate-fade-in">
                                <header className="mb-6"><h3 className="text-xl font-bold text-gray-900 dark:text-white">Матриця прав доступу</h3><p className="text-sm text-gray-500">Налаштування видимості категорій для різних ролей.</p></header>
                                <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                                    <table className="w-full text-left border-collapse bg-white dark:bg-transparent">
                                        <thead><tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-black"><th className="py-4 px-6 text-xs text-gray-400 uppercase tracking-widest">Категорія</th>{roles.map(role => (<th key={role} className="py-4 px-4 text-[10px] text-gray-400 uppercase text-center tracking-tighter">{t(`roles.${role}`)}</th>))}</tr></thead>
                                        <tbody>{categories.map(cat => (<tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 transition-colors"><td className="py-5 px-6 font-black text-gray-800 dark:text-gray-200 text-sm">{t(cat.nameKey)}</td>{roles.map(role => (<td key={role} className="py-5 px-4 text-center"><input type="checkbox" checked={cat.viewPermissions.includes(role)} onChange={() => togglePermission(cat, role)} className="h-5 w-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform hover:scale-110" disabled={role === 'admin'} /></td>))}</tr>))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div className="animate-fade-in text-center sm:text-left">
                                <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4"><div><h3 className="text-2xl font-black text-gray-900 dark:text-white">Категорії ресурсів</h3><p className="text-sm text-gray-500">Керування розділами знань.</p></div><button onClick={() => onAddCategory({})} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest"><Icon name="plus" className="w-5 h-5" /> Додати</button></header>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{categories.map(cat => (<div key={cat.id} className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-200 dark:border-gray-700 flex items-center justify-between group shadow-sm transition-all hover:border-blue-300"><div className="flex items-center gap-4"><div className="p-4 bg-white dark:bg-gray-800 rounded-2xl text-blue-600 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"><Icon name={cat.iconName} className="w-8 h-8" /></div><div><p className="font-black text-gray-900 dark:text-white text-lg leading-tight">{t(cat.nameKey)}</p></div></div><div className="flex gap-2"><button onClick={() => onUpdateCategory(cat)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Icon name="cog" className="w-5 h-5" /></button><button onClick={() => onDeleteCategory(cat.id)} className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"><Icon name="plus" className="w-5 h-5 rotate-45" /></button></div></div>))}</div>
                            </div>
                        )}

                        {activeTab === 'documents' && (
                            <div className="animate-fade-in">
                                <header className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4"><div><h3 className="text-2xl font-black text-gray-900 dark:text-white">Документація</h3><p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Керування файлами та описами.</p></div><button onClick={onAddDocument} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest"><Icon name="plus" className="w-5 h-5" /> Додати документ</button></header>
                                <div className="space-y-3">{documents.map(docItem => (<div key={docItem.id} className="p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all hover:bg-white dark:hover:bg-gray-900"><div className="flex-grow min-w-0 pr-4 text-center sm:text-left"><p className="font-black text-gray-900 dark:text-white text-base truncate">{docItem.titleKey ? t(docItem.titleKey) : docItem.title}</p><p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest mt-1">{t(docItem.categoryKey)}</p></div><div className="flex items-center gap-2"><button onClick={() => setSelectedDocForFiles(docItem)} className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-all shadow-sm"><Icon name="upload" className="w-4 h-4" /> Файли</button><button onClick={() => onEditDocument(docItem)} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all"><Icon name="cog" className="w-5 h-5" /></button><button onClick={() => onDeleteDocument(docItem.id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"><Icon name="plus" className="w-5 h-5 rotate-45" /></button></div></div>))}</div>
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="animate-fade-in text-center sm:text-left">
                                <header className="mb-6"><h3 className="text-2xl font-black text-gray-900 dark:text-white">Запити на доступ</h3><p className="text-sm text-gray-500">Обробка вхідних заявок від нових користувачів.</p></header>
                                <div className="space-y-4">{requests.map(req => (<div key={req.id} className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"><div className="flex items-center gap-5"><div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg">{req.name ? req.name[0].toUpperCase() : '?'}</div><div className="text-left"><p className="font-black text-gray-900 dark:text-white text-lg">{req.name}</p><p className="text-sm text-gray-500 font-bold">{req.email} • <span className="text-blue-600 dark:text-blue-400">{req.company}</span></p><p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{new Date(req.date).toLocaleDateString()}</p></div></div>{req.status === 'pending' ? (<div className="flex gap-2 w-full sm:w-auto"><button onClick={() => updateDoc(doc(db, "requests", req.id), { status: 'denied' })} className="flex-1 px-6 py-3 text-xs font-black uppercase text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/50 tracking-widest">Deny</button><button onClick={() => updateDoc(doc(db, "requests", req.id), { status: 'approved' })} className="flex-1 px-8 py-3 text-xs font-black uppercase text-white bg-green-600 rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 tracking-widest">Approve</button></div>) : (<span className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>)}</div>))}</div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};
