import React, { useState, useEffect } from 'react';
import { UserRole, Document, Category, IconName } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { setUserRole } from "../utils/auth";

export const LoginModal: React.FC<{ onClose: () => void, context: 'view' | 'download' | 'login' }> = ({ onClose, context }) => {
    const { t } = useI18n();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isRegister) {
                const credential = await createUserWithEmailAndPassword(auth, email, password);
                // Assign 'guest' role by default for new registrations
                await setUserRole(credential.user.uid, 'guest', email);
                alert("Account created! Wait for administrator to upgrade your access.");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            onClose();
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 mb-4 shadow-sm">
                            <Icon name={isRegister ? "users" : "lock-closed"} className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                            {isRegister ? "Create Account" : t('header.login')}
                        </h2>
                        <p className="text-sm text-gray-500">{t(`loginModal.context.${context}`)}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Email Address</label>
                            <input 
                                autoFocus
                                type="email" 
                                required
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">Password</label>
                            <input 
                                type="password" 
                                required
                                value={password} 
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg">
                                <p className="text-xs text-red-600 dark:text-red-400 font-bold">{error}</p>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 bg-blue-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isLoading ? t('common.loading') : (isRegister ? "Register" : t('common.login'))}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setIsRegister(!isRegister)}
                            className="text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            {isRegister ? "Already have an account? Log in" : "Need full access? Create an account"}
                        </button>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 text-center">
                    <button onClick={onClose} className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-tighter">
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RegistrationRequestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    // We can keep this for "Access Request" from non-logged users if needed, 
    // but now Registration in LoginModal does something similar.
    // For now, let's keep it as is or remove if unwanted.
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm text-center border border-gray-100 dark:border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <Icon name="information-circle" className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-black mb-2">{t('registrationModal.title')}</h2>
                <p className="text-sm text-gray-500 mb-6">{t('registrationModal.description')}</p>
                <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">{t('registrationModal.buttonClose')}</button>
            </div>
        </div>
    );
};

export const DocumentEditorModal: React.FC<{ doc: Partial<Document> | null, onSave: (doc: Partial<Document>) => void, onClose: () => void, availableCategories: Category[] }> = ({ doc, onSave, onClose, availableCategories }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState((doc?.titleKey ? t(doc.titleKey) : doc?.title) || '');
    const [category, setCategory] = useState(doc?.categoryKey || availableCategories[0]?.nameKey || '');
    const [tags, setTags] = useState(doc?.tags?.join(', ') || '');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: doc?.id, title: title, categoryKey: category, tags: tags.split(',').map(t => t.trim()).filter(Boolean) });
    };
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('editorModal.labelTitle')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('editorModal.labelCategory')}</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none">{availableCategories.map(cat => <option key={cat.id} value={cat.nameKey}>{t(cat.nameKey)}</option>)}</select></div>
                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('editorModal.labelTags')}</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t('editorModal.placeholderTags')}/></div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">{t('common.cancel')}</button><button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">{t('common.save')}</button></div>
                </form>
            </div>
        </div>
    );
};

export const CategoryEditorModal: React.FC<{ category: Category, onSave: (cat: Category) => void, onClose: () => void }> = ({ category, onSave, onClose }) => {
    const { t } = useI18n();
    const [nameKey, setNameKey] = useState(category.nameKey);
    const [iconName, setIconName] = useState<IconName>(category.iconName);
    const [permissions, setPermissions] = useState<UserRole[]>(category.viewPermissions);
    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'admin'];
    const togglePermission = (role: UserRole) => { setPermissions(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ ...category, nameKey, iconName, viewPermissions: permissions }); };
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('categoryEditorModal.editTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('categoryEditorModal.labelName')}</label><input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
                    <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('categoryEditorModal.labelPermissions')}</label><div className="grid grid-cols-2 gap-2 mt-2">{roles.map(role => (<label key={role} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl cursor-pointer border border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors"><input type="checkbox" checked={permissions.includes(role)} onChange={() => togglePermission(role)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">{t(`roles.${role}`)}</span></label>))}</div></div>
                    <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">{t('common.cancel')}</button><button type="submit" className="px-6 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">{t('common.save')}</button></div>
                </form>
            </div>
        </div>
    );
};
