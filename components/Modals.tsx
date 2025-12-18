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
                await setUserRole(credential.user.uid, 'guest', email);
                alert("Account created! Please ask administrator to assign your role.");
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

    const roleInfo = [
        { role: 'foreman', title: t('loginModal.roles.foreman'), desc: t('loginModal.roles.foremanDesc'), icon: 'construction' },
        { role: 'designer', title: t('loginModal.roles.designer'), desc: t('loginModal.roles.designerDesc'), icon: 'it' },
        { role: 'admin', title: t('loginModal.roles.admin'), desc: t('loginModal.roles.adminDesc'), icon: 'cog' },
    ];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row border border-white/10" onClick={e => e.stopPropagation()}>
                
                {/* Left Side: Auth Form */}
                <div className="flex-1 p-8 md:p-12 bg-white dark:bg-gray-800">
                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                            {isRegister ? "Join the Center" : "Welcome Back"}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {isRegister ? "Create an account to request access to restricted documents." : "Log in to access your authorized resources."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 tracking-widest">Email Address</label>
                            <input autoFocus type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all font-semibold"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 tracking-widest">Password</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all font-semibold"
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-xs text-red-600 font-bold">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading}
                            className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isLoading ? "Processing..." : (isRegister ? "Create Account" : "Log In")}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button onClick={() => setIsRegister(!isRegister)} className="text-sm font-bold text-blue-600 hover:underline">
                            {isRegister ? "Already have an account? Log in" : "Need more access? Register here"}
                        </button>
                    </div>
                </div>

                {/* Right Side: Role Info (Dark Section) */}
                <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-900/50 p-8 border-l border-gray-100 dark:border-gray-800">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Access Levels</h3>
                    <div className="space-y-6">
                        {roleInfo.map(info => (
                            <div key={info.role} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-blue-500">
                                    <Icon name={info.icon as any} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{info.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{info.desc}</p>
                                </div>
                            </div>
                        ))}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                             <div className="flex gap-4 opacity-50">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                    <Icon name="users" className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{t('roles.guest')}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Default level for new users. Basic visibility only.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 pt-6">
                         <button onClick={onClose} className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white uppercase tracking-widest transition-colors border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export const RegistrationRequestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 max-w-sm text-center border border-gray-100 dark:border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                    <Icon name="information-circle" className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black mb-3 text-gray-900 dark:text-white">{t('registrationModal.title')}</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">{t('registrationModal.description')}</p>
                <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">{t('registrationModal.buttonClose')}</button>
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
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('editorModal.labelTitle')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" required /></div>
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('editorModal.labelCategory')}</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold">{availableCategories.map(cat => <option key={cat.id} value={cat.nameKey}>{t(cat.nameKey)}</option>)}</select></div>
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('editorModal.labelTags')}</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" placeholder={t('editorModal.placeholderTags')}/></div>
                    <div className="flex justify-end gap-3 pt-6"><button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">Cancel</button><button type="submit" className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">Save Changes</button></div>
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
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t('categoryEditorModal.editTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('categoryEditorModal.labelName')}</label><input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" required /></div>
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('categoryEditorModal.labelPermissions')}</label><div className="grid grid-cols-2 gap-3 mt-2">{roles.map(role => (<label key={role} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl cursor-pointer border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"><input type="checkbox" checked={permissions.includes(role)} onChange={() => togglePermission(role)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{t(`roles.${role}`)}</span></label>))}</div></div>
                    <div className="flex justify-end gap-3 pt-6"><button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">Cancel</button><button type="submit" className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">Save Changes</button></div>
                </form>
            </div>
        </div>
    );
};
