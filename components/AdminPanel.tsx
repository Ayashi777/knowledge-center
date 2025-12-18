import React, { useState, useEffect } from 'react';
import { Category, Document, UserRole, IconName } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { uploadDocumentFile, listDocumentFiles, deleteDocumentFile, isFileTypeAllowed } from '../utils/storage';
import { collection, getDocs, doc, updateDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AccessRequest {
    id: string;
    uid?: string;
    name: string;
    email: string;
    phone?: string;
    company: string;
    requestedRole?: UserRole;
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
    const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});

    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'architect', 'admin'];

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

    const handleApproveRequest = async (req: AccessRequest) => {
        const roleToAssign = pendingRoles[req.id] || req.requestedRole || 'foreman';
        try {
            await updateDoc(doc(db, "requests", req.id), { status: 'approved', assignedRole: roleToAssign });
            let userUid = req.uid;
            if (!userUid) {
                const existingUser = users.find(u => u.email === req.email);
                if (existingUser) userUid = existingUser.uid;
            }
            if (userUid) {
                await updateDoc(doc(db, "users", userUid), { role: roleToAssign });
            } else {
                alert("Користувач не знайдений. Йому потрібно зареєструватися.");
            }
        } catch (error) {
            alert("Помилка під час схвалення.");
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
                                            <div className="flex gap-2 shrink-0"><a href={file.url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Icon name="download" className="w-4 h-4" /></a><button onClick={() => deleteDocumentFile(selectedDocForFiles.id, file.name).then(() => loadFiles(selectedDocForFiles))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icon name="plus" className="w-4 h-4 rotate-45" /></button></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                        {activeTab === 'users' && (
                            <div className="animate-fade-in">
                                <header className="mb-8"><h3 className="text-2xl font-black text-gray-900 dark:text-white">База користувачів</h3></header>
                                <div className="space-y-3">
                                    {users.map(user => (
                                        <div key={user.uid} className="p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">{user.email ? user.email[0].toUpperCase() : '?'}</div>
                                                <div className="text-left"><p className="font-bold text-gray-900 dark:text-white">{user.email}</p><p className="text-[10px] text-gray-400 font-mono font-bold">{user.uid}</p></div>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-1.5 p-1.5 bg-white/50 dark:bg-black/20 rounded-xl">
                                                {roles.map(r => (
                                                    <button key={r} onClick={() => handleRoleChange(user.uid, r)} className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${user.role === r ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                                                        {t(`roles.${r}`)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'roles' && (
                            <div className="animate-fade-in">
                                <header className="mb-6"><h3 className="text-xl font-bold text-gray-900 dark:text-white">Матриця прав доступу</h3></header>
                                <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                                    <table className="w-full text-left border-collapse bg-white dark:bg-transparent">
                                        <thead><tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 font-black"><th className="py-4 px-6 text-xs text-gray-400 uppercase tracking-widest">Категорія</th>{roles.map(role => (<th key={role} className="py-4 px-4 text-[10px] text-gray-400 uppercase text-center tracking-tighter">{t(`roles.${role}`)}</th>))}</tr></thead>
                                        <tbody>{categories.map(cat => (<tr key={cat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 transition-colors"><td className="py-5 px-6 font-black text-gray-800 dark:text-gray-200 text-sm">{t(cat.nameKey)}</td>{roles.map(role => (<td key={role} className="py-5 px-4 text-center"><input type="checkbox" checked={cat.viewPermissions.includes(role)} onChange={() => togglePermission(cat, role)} className="h-5 w-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-transform hover:scale-110" disabled={role === 'admin'} /></td>))}</tr>))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {activeTab === 'requests' && (
                            <div className="animate-fade-in text-center sm:text-left">
                                <header className="mb-6"><h3 className="text-2xl font-black text-gray-900 dark:text-white">Запити на доступ</h3></header>
                                <div className="space-y-4">{requests.map(req => (<div key={req.id} className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm"><div className="flex items-center gap-5"><div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg">{req.name ? req.name[0].toUpperCase() : '?'}</div><div className="text-left"><p className="font-black text-gray-900 dark:text-white text-lg">{req.name}</p><p className="text-sm text-gray-500 font-bold">{req.email} • <span className="text-blue-600 dark:text-blue-400">{req.company}</span></p>{req.requestedRole && (<p className="text-[10px] text-purple-500 font-black uppercase mt-1">Бажана роль: {t(`roles.${req.requestedRole}`)}</p>)}<p className="text-[10px] text-gray-400 mt-0.5 uppercase font-bold">{new Date(req.date).toLocaleDateString()}</p></div></div>{req.status === 'pending' ? (<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center"><select className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300" value={pendingRoles[req.id] || req.requestedRole || 'foreman'} onChange={(e) => setPendingRoles({ ...pendingRoles, [req.id]: e.target.value as UserRole })}>{roles.filter(r => r !== 'guest').map(role => (<option key={role} value={role}>{t(`roles.${role}`)}</option>))}</select><div className="flex gap-2 w-full sm:w-auto"><button onClick={() => updateDoc(doc(db, "requests", req.id), { status: 'denied' })} className="flex-1 px-6 py-3 text-xs font-black uppercase text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-all tracking-widest">Deny</button><button onClick={() => handleApproveRequest(req)} className="flex-1 px-8 py-3 text-xs font-black uppercase text-white bg-green-600 rounded-2xl hover:bg-green-700 shadow-xl shadow-green-500/20 tracking-widest">Approve</button></div></div>) : (<span className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>)}</div>))}</div>
                            </div>
                        )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};
