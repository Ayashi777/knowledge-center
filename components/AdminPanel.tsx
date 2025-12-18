import React, { useState, useEffect } from 'react';
import { Category, Document, UserRole, IconName, UserProfile } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { UserEditorModal } from './Modals';
import { uploadDocumentFile, listDocumentFiles, deleteDocumentFile, isFileTypeAllowed } from '../utils/storage';
import { collection, doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";
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
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
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

    const handleUpdateUser = async (userData: Partial<UserProfile>) => {
        if (!userData.uid) return;
        try {
            await updateDoc(doc(db, "users", userData.uid), userData);
            alert(t('userEditorModal.successMessage'));
            setEditingUser(null);
        } catch (error) {
            alert("Помилка оновлення користувача.");
        }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!window.confirm("Ви впевнені, що хочете видалити цього користувача? Це незворотньо.")) return;
        try {
            await deleteDoc(doc(db, "users", uid));
            alert("Профіль користувача видалено з бази даних.");
        } catch (error) {
            alert("Помилка видалення.");
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
                alert("Користувач не знайдений в базі акаунтів. Можливо, він ще не зареєструвався.");
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
        <>
            {editingUser && <UserEditorModal user={editingUser} onSave={handleUpdateUser} onClose={() => setEditingUser(null)} />}
            <div className="flex flex-col lg:flex-row gap-8 pt-16 sm:pt-12 min-h-[80vh]">
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                         <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"><h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Icon name="cog" className="w-5 h-5" />Адмін-центр</h2></div>
                        <nav className="p-2">{navItems.map(item => (<button key={item.id} onClick={() => { setActiveTab(item.id as any); setSelectedDocForFiles(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id && !selectedDocForFiles ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Icon name={item.icon} className="w-5 h-5" />{item.label}{item.id === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (<span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>)}</button>))}</nav>
                    </div>
                </aside>

                <main className="flex-grow">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-full p-6">
                        {selectedDocForFiles ? (
                            <div className="animate-fade-in">
                                <button onClick={() => setSelectedDocForFiles(null)} className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-6 hover:underline"><Icon name="plus" className="w-4 h-4 rotate-45" /> Назад до списку</button>
                                <h3 className="text-xl font-black mb-1">{selectedDocForFiles.title || t(selectedDocForFiles.titleKey!)}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="space-y-4"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center sm:text-left">Файли у сховищі</h4>{docFiles.map(file => (<div key={file.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700"><div className="flex items-center gap-3 min-w-0"><Icon name={file.extension === 'pdf' ? 'pdf' : 'hr'} className="w-6 h-6 text-gray-400" /><span className="text-sm font-bold truncate">{file.name}</span></div><div className="flex gap-2 shrink-0"><a href={file.url} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Icon name="download" className="w-4 h-4" /></a><button onClick={() => handleFileDelete(file.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icon name="plus" className="w-4 h-4 rotate-45" /></button></div></div>))}{docFiles.length === 0 && <p className="text-sm text-gray-400 italic text-center sm:text-left">Файли відсутні.</p>}</div>
                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-10 rounded-3xl border border-dashed border-blue-200 dark:border-blue-800 flex flex-col items-center justify-center text-center"><Icon name="upload" className={`w-16 h-16 mb-4 ${isUploading ? 'animate-bounce text-blue-400' : 'text-blue-600'}`} /><h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2 text-lg">Завантажити файл</h4><p className="text-xs text-blue-700/60 dark:text-blue-400/60 mb-8 font-semibold uppercase tracking-tighter">Дозволені: .pdf, .word, .excel</p><input type="file" id="admin-file-upload" className="hidden" onChange={handleFileUpload} disabled={isUploading} /><label htmlFor="admin-file-upload" className={`px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>{isUploading ? 'Завантаження...' : 'Обрати файл'}</label></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'users' && (
                                    <div className="animate-fade-in">
                                        <header className="mb-8"><h3 className="text-2xl font-black text-gray-900 dark:text-white">База користувачів</h3><p className="text-sm text-gray-500">Повний реєстр зареєстрованих користувачів.</p></header>
                                        <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-gray-200 dark:border-gray-700 text-xs text-gray-400 uppercase tracking-widest"><th className="py-4 px-2">Користувач</th><th className="py-4 px-2">Компанія</th><th className="py-4 px-2">Контакти</th><th className="py-4 px-2">Роль</th><th className="py-4 px-2 text-right">Дії</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{users.map(user => (<tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"><td className="py-4 px-2"><p className="font-bold text-gray-900 dark:text-white text-sm">{user.name || 'Без імені'}</p><p className="text-xs text-gray-500">{user.email}</p></td><td className="py-4 px-2"><p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{user.company || '—'}</p></td><td className="py-4 px-2">{user.phone ? (<a href={`tel:${user.phone}`} className="text-xs font-bold text-blue-600 hover:underline">{user.phone}</a>) : <span className="text-xs text-gray-400">—</span>}</td><td className="py-4 px-2"><select value={user.role} onChange={(e) => handleUpdateUser({ uid: user.uid, role: e.target.value as UserRole })} className="bg-gray-100 dark:bg-gray-800 border-none rounded-lg text-xs font-black uppercase px-2 py-1 cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none">{roles.map(r => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}</select></td><td className="py-4 px-2 text-right"><button onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Редагувати"><Icon name="cog" className="w-4 h-4" /></button><button onClick={() => handleDeleteUser(user.uid)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Видалити"><Icon name="plus" className="w-4 h-4 rotate-45" /></button></td></tr>))}</tbody></table></div>
                                    </div>
                                )}
                                {activeTab === 'roles' && ( <div className="animate-fade-in">...</div> )}
                                {activeTab === 'categories' && ( <div className="animate-fade-in">...</div> )}
                                {activeTab === 'documents' && ( <div className="animate-fade-in">...</div> )}
                                {activeTab === 'requests' && ( <div className="animate-fade-in">...</div> )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};
