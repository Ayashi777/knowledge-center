import React, { useState, useEffect, useMemo } from 'react';
import { Category, Document, UserRole, IconName, UserProfile } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { UserEditorModal } from './Modals';
import { uploadDocumentFile, listDocumentFiles, deleteDocumentFile, isFileTypeAllowed } from '../utils/storage';
import { collection, doc, updateDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from "../firebase";

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
    type AdminTab = 'roles' | 'categories' | 'documents' | 'requests' | 'users';

const parseTab = (value: string | null | undefined): AdminTab => {
    const v = (value || '').replace('#', '').trim() as AdminTab;
    const allowed: AdminTab[] = ['roles', 'categories', 'documents', 'requests', 'users'];
    return (allowed as string[]).includes(v) ? (v as AdminTab) : 'roles';
};

const getTabFromHash = (): AdminTab => parseTab(window.location.hash?.substring(1));

const [activeTab, setActiveTab] = useState<AdminTab>(() => getTabFromHash());

    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedDocForFiles, setSelectedDocForFiles] = useState<Document | null>(null);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [docFiles, setDocFiles] = useState<{name: string, url: string, extension?: string}[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});

    // Documents tab UI state
    const [docViewMode, setDocViewMode] = useState<'list' | 'grid'>('grid');
    const [docSearchTerm, setDocSearchTerm] = useState('');
    const [docCategoryFilter, setDocCategoryFilter] = useState<string>('all');

    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'architect', 'admin'];

    
// ✅ Keep active tab stable even if AdminPanel re-mounts after Firestore updates
useEffect(() => {
    const handleHashChange = () => {
        setActiveTab(getTabFromHash());
    };

    // Set default hash on first mount
    if (!window.location.hash) {
        window.location.replace('#roles');
    } else {
        // Ensure state matches current hash
        setActiveTab(getTabFromHash());
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
}, []);
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

    const handleThumbnailUpload = async (docId: string, file: File) => {
        if (!file) return;
        try {
            // Create a unique path for the thumbnail (cover)
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = `documents/${docId}/thumbnail_${Date.now()}_${safeName}`;
            const storageRef = ref(storage, filePath);

            // Upload and get URL
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            // Update Firestore document
            await updateDoc(doc(db, "documents", docId), { thumbnailUrl: url });
        } catch (error) {
            console.error("Thumbnail upload error:", error);
            alert("Помилка завантаження обкладинки.");
        }
    };

    const filteredDocuments = useMemo(() => {
        const s = docSearchTerm.trim().toLowerCase();
        return documents
            .filter(docItem => {
                const title = (docItem.titleKey ? t(docItem.titleKey) : docItem.title) || '';
                return title.toLowerCase().includes(s);
            })
            .filter(docItem => {
                if (docCategoryFilter === 'all') return true;
                return docItem.categoryKey === docCategoryFilter;
            });
    }, [documents, docSearchTerm, docCategoryFilter, t]);

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
                        <nav className="p-2">{navItems.map(item => (<button key={item.id} onClick={() => { window.location.hash = item.id; setSelectedDocForFiles(null); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id && !selectedDocForFiles ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}><Icon name={item.icon} className="w-5 h-5" />{item.label}{item.id === 'requests' && requests.filter(r => r.status === 'pending').length > 0 && (<span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>)}</button>))}</nav>
                    </div>
                </aside>

                <main className="flex-grow">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-full p-6">
                        {selectedDocForFiles ? (
                            <div className="animate-fade-in">
                                <button onClick={() => { setSelectedDocForFiles(null); window.location.hash = 'documents'; }} className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-6 hover:underline"><Icon name="plus" className="w-4 h-4 rotate-45" /> Назад до списку</button>
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
                                        <header className="mb-8">
                                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">{t('adminDocs.title')}</h3>
                                                    <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">{t('adminDocs.description')}</p>
                                                </div>
                                                <button
                                                    onClick={onAddDocument}
                                                    className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all uppercase tracking-widest"
                                                >
                                                    <Icon name="plus" className="w-5 h-5" /> {t('adminDocs.addDocument')}
                                                </button>
                                            </div>

                                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <input
                                                    type="search"
                                                    placeholder={t('adminDocs.searchPlaceholder')}
                                                    value={docSearchTerm}
                                                    onChange={e => setDocSearchTerm(e.target.value)}
                                                    className="col-span-1 block w-full rounded-md border-0 bg-gray-100 dark:bg-gray-900/50 py-2.5 pl-4 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                                />

                                                <select
                                                    value={docCategoryFilter}
                                                    onChange={e => setDocCategoryFilter(e.target.value)}
                                                    className="col-span-1 block w-full rounded-md border-0 bg-gray-100 dark:bg-gray-900/50 py-2.5 pl-4 pr-8 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
                                                >
                                                    <option value="all">{t('adminDocs.allCategories')}</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.nameKey}>{t(cat.nameKey)}</option>
                                                    ))}
                                                </select>

                                                <div className="col-span-1 flex items-center justify-self-start sm:justify-self-end p-1 bg-gray-200 dark:bg-gray-700 rounded-md">
                                                    <button
                                                        onClick={() => setDocViewMode('grid')}
                                                        className={`p-2 rounded ${docViewMode === 'grid' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
                                                        title={t('adminDocs.viewAsGrid')}
                                                    >
                                                        <Icon name="view-grid" className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDocViewMode('list')}
                                                        className={`p-2 rounded ${docViewMode === 'list' ? 'bg-white dark:bg-gray-900 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
                                                        title={t('adminDocs.viewAsList')}
                                                    >
                                                        <Icon name="view-list" className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </header>

                                        {docViewMode === 'grid' ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                {filteredDocuments.map(docItem => (
                                                    <div
                                                        key={docItem.id}
                                                        className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col group transition-all"
                                                    >
                                                        <div className="relative aspect-video">
                                                            {docItem.thumbnailUrl ? (
                                                                <img
                                                                    src={docItem.thumbnailUrl}
                                                                    alt={t('adminDocs.cover')}
                                                                    className="w-full h-full object-cover rounded-t-2xl"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-t-2xl flex items-center justify-center text-center p-4">
                                                                    <p className="text-xs font-bold text-gray-400">{t('adminDocs.noCover')}</p>
                                                                </div>
                                                            )}

                                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xs uppercase cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {docItem.thumbnailUrl ? t('adminDocs.changeCover') : t('adminDocs.uploadCover')}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={e => e.target.files && handleThumbnailUpload(docItem.id, e.target.files[0])}
                                                                />
                                                            </label>
                                                        </div>

                                                        <div className="p-4 flex-grow flex flex-col">
                                                            <p className="font-black text-gray-900 dark:text-white text-base truncate flex-grow">
                                                                {docItem.titleKey ? t(docItem.titleKey) : docItem.title}
                                                            </p>
                                                            <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                                                                {t(docItem.categoryKey)}
                                                            </p>
                                                        </div>

                                                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                                                            <button
                                                                onClick={() => setSelectedDocForFiles(docItem)}
                                                                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-all shadow-sm"
                                                            >
                                                                <Icon name="upload" className="w-4 h-4" /> {t('adminDocs.files')}
                                                            </button>

                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => onEditDocument(docItem)}
                                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-all"
                                                                    title={t('adminDocs.edit')}
                                                                >
                                                                    <Icon name="cog" className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => onDeleteDocument(docItem.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                                    title={t('adminDocs.delete')}
                                                                >
                                                                    <Icon name="plus" className="w-5 h-5 rotate-45" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {filteredDocuments.map(docItem => (
                                                    <div
                                                        key={docItem.id}
                                                        className="p-5 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all hover:bg-white dark:hover:bg-gray-900"
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            {docItem.thumbnailUrl && (
                                                                <img
                                                                    src={docItem.thumbnailUrl}
                                                                    className="h-10 w-16 object-cover rounded-md hidden sm:block"
                                                                    alt={t('adminDocs.cover')}
                                                                />
                                                            )}

                                                            <div className="flex-grow min-w-0 text-center sm:text-left">
                                                                <p className="font-black text-gray-900 dark:text-white text-base truncate">
                                                                    {docItem.titleKey ? t(docItem.titleKey) : docItem.title}
                                                                </p>
                                                                <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                                                                    {t(docItem.categoryKey)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-all shadow-sm cursor-pointer">
                                                                <Icon name="upload" className="w-4 h-4" /> {docItem.thumbnailUrl ? t('adminDocs.changeCover') : t('adminDocs.uploadCover')}
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={e => e.target.files && handleThumbnailUpload(docItem.id, e.target.files[0])}
                                                                />
                                                            </label>

                                                            <button
                                                                onClick={() => setSelectedDocForFiles(docItem)}
                                                                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                                                            >
                                                                <Icon name="upload" className="w-4 h-4" /> {t('adminDocs.files')}
                                                            </button>

                                                            <button
                                                                onClick={() => onEditDocument(docItem)}
                                                                className="p-3 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all"
                                                                title={t('adminDocs.edit')}
                                                            >
                                                                <Icon name="cog" className="w-5 h-5" />
                                                            </button>

                                                            <button
                                                                onClick={() => onDeleteDocument(docItem.id)}
                                                                className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
                                                                title={t('adminDocs.delete')}
                                                            >
                                                                <Icon name="plus" className="w-5 h-5 rotate-45" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {filteredDocuments.length === 0 && (
                                            <p className="text-sm text-gray-400 italic text-center mt-10">
                                                {docSearchTerm || docCategoryFilter !== 'all' ? 'Нічого не знайдено.' : 'Документи відсутні.'}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'requests' && (
                                    <div className="animate-fade-in text-center sm:text-left">
                                        <header className="mb-6"><h3 className="text-2xl font-black text-gray-900 dark:text-white">Запити на доступ</h3><p className="text-sm text-gray-500">Обробка вхідних заявок від нових користувачів.</p></header>
                                        <div className="space-y-4">{requests.map(req => (
                                            <div key={req.id} className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col xl:flex-row items-center justify-between gap-6 shadow-sm">
                                                <div className="flex items-center gap-5 w-full xl:w-auto">
                                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0">
                                                        {req.name ? req.name[0].toUpperCase() : '?'}
                                                    </div>
                                                    <div className="text-left flex-grow min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-black text-gray-900 dark:text-white text-lg truncate">{req.name}</p>
                                                            {req.requestedRole && (<span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 font-bold px-2 py-0.5 rounded uppercase tracking-widest">{t(`roles.${req.requestedRole}`)}</span>)}
                                                        </div>
                                                        <p className="text-sm text-gray-500 font-bold flex flex-col sm:flex-row sm:gap-2">
                                                            <span>{req.company}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span className="text-blue-600 dark:text-blue-400">{req.email}</span>
                                                        </p>
                                                        {req.phone && (
                                                            <a href={`tel:${req.phone}`} className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors mt-0.5 block">{req.phone}</a>
                                                        )}
                                                        <p className="text-[10px] text-gray-300 mt-1 uppercase font-bold">{new Date(req.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                
                                                {req.status === 'pending' ? (
                                                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-center">
                                                        <select 
                                                            className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
                                                            value={pendingRoles[req.id] || req.requestedRole || 'foreman'}
                                                            onChange={(e) => setPendingRoles({ ...pendingRoles, [req.id]: e.target.value as UserRole })}
                                                        >
                                                            {roles.filter(r => r !== 'guest').map(role => (
                                                                <option key={role} value={role}>{t(`roles.${role}`)}</option>
                                                            ))}
                                                        </select>
                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            <button onClick={() => updateDoc(doc(db, "requests", req.id), { status: 'denied' })} className="flex-1 px-6 py-3 text-xs font-black uppercase text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/50 tracking-widest">Deny</button>
                                                            <button onClick={() => handleApproveRequest(req)} className="flex-1 px-8 py-3 text-xs font-black uppercase text-white bg-green-600 rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-500/20 tracking-widest">Approve</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>
                                                )}
                                            </div>
                                        ))}</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};
