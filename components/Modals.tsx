import React, { useState, useEffect, useMemo } from 'react';
import { UserRole, Document, Category, IconName } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";

export const LoginModal: React.FC<{ onClose: () => void, context: 'view' | 'download' | 'login' }> = ({ onClose, context }) => {
    const { t } = useI18n();
    const [view, setView] = useState<'login' | 'request' | 'success'>('login');
    
    // Login form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Request form state
    const [reqName, setReqName] = useState('');
    const [reqCompany, setReqCompany] = useState('');
    const [reqEmail, setReqEmail] = useState('');
    const [reqPassword, setReqPassword] = useState('');
    const [reqPasswordConfirm, setReqPasswordConfirm] = useState('');
    const [reqPhone, setReqPhone] = useState('');
    const [reqRoleType, setReqRoleType] = useState<UserRole | ''>(''); 
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Reliable Password Validation logic using state values directly to avoid memo lag
    const hasMinLen = reqPassword.length >= 8;
    const hasNumber = /[0-9]/.test(reqPassword);
    const hasUpper = /[A-Z]/.test(reqPassword);
    const hasLower = /[a-z]/.test(reqPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_]/.test(reqPassword);

    const isPasswordValid = hasMinLen && hasNumber && hasUpper && hasLower;

    // Email & Phone Validation
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reqEmail);
    const isPhoneValid = /^\+?3?8?(0\d{9})$/.test(reqPhone.replace(/\s/g, ''));
    
    const isPasswordMatch = reqPassword === reqPasswordConfirm && reqPasswordConfirm !== '';
    
    const isFormValid = reqName.trim() !== '' && 
                        reqCompany.trim() !== '' && 
                        isEmailValid && 
                        isPhoneValid && 
                        isPasswordValid && 
                        isPasswordMatch && 
                        reqRoleType !== '';

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError("Помилка авторизації. Перевірте email та пароль.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;
        
        setError('');
        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, reqEmail, reqPassword);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: reqEmail,
                role: 'guest', 
                name: reqName,
                company: reqCompany,
                phone: reqPhone,
                requestedRole: reqRoleType,
                createdAt: new Date().toISOString()
            });

            await addDoc(collection(db, "requests"), {
                uid: user.uid, 
                name: reqName,
                company: reqCompany,
                email: reqEmail,
                phone: reqPhone,
                requestedRole: reqRoleType,
                status: 'pending',
                date: new Date().toISOString()
            });

            setView('success');
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                setError("Цей email вже зареєстрований.");
            } else if (error.code === 'auth/weak-password') {
                setError("Пароль занадто слабкий.");
            } else {
                setError("Помилка реєстрації. Спробуйте пізніше.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const roleInfo = [
        { role: 'foreman', title: t('loginModal.roles.foreman'), desc: t('loginModal.roles.foremanDesc'), icon: 'construction' },
        { role: 'designer', title: t('loginModal.roles.designer'), desc: t('loginModal.roles.designerDesc'), icon: 'it' },
        { role: 'admin', title: t('loginModal.roles.admin'), desc: t('loginModal.roles.adminDesc'), icon: 'cog' },
    ];

    const selectableRoles: UserRole[] = ['foreman', 'designer'];

    const getStatusClass = (valid: boolean, value: string) => {
        if (!value) return "border-gray-200 dark:border-gray-700";
        return valid 
            ? "border-green-500 ring-1 ring-green-500/30" 
            : "border-red-500 ring-1 ring-red-500/30";
    };

    const inputBase = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-inset outline-none dark:text-white text-sm font-semibold transition-all";

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row border border-white/10" onClick={e => e.stopPropagation()}>
                
                <div className="flex-1 p-8 md:p-12 bg-white dark:bg-gray-800 flex flex-col justify-center min-h-[500px]">
                    {view === 'login' && (
                        <div className="animate-fade-in">
                            <div className="mb-10">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('loginModal.welcome')}</h2>
                                <p className="text-gray-500 text-sm">{t('loginModal.subtitle')}</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 tracking-widest">{t('loginModal.emailLabel')}</label>
                                    <input autoFocus type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                        className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-blue-500`}
                                        placeholder="name@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 tracking-widest">{t('loginModal.passwordLabel')}</label>
                                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                        className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-blue-500`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                
                                {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-xs text-red-600 font-bold">{error}</div>}

                                <button type="submit" disabled={isLoading} className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all ${isLoading ? 'opacity-50 cursor-wait' : ''}`}>
                                    {isLoading ? t('loginModal.processing') : t('loginModal.submitButton')}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <button onClick={() => setView('request')} className="text-sm font-bold text-blue-600 hover:underline">
                                    {t('loginModal.noAccount')}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'request' && (
                        <div className="animate-fade-in max-h-[80vh] overflow-y-auto px-1 py-1">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('registrationModal.title')}</h2>
                                <p className="text-gray-500 text-xs leading-relaxed">{t('registrationModal.description')}</p>
                            </div>

                            <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldRoleType')}</label>
                                    <div className="flex gap-4">
                                        {selectableRoles.map(role => (
                                            <label key={role} className={`flex-1 p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 ${reqRoleType === role ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="roleType" value={role} checked={reqRoleType === role} onChange={() => setReqRoleType(role)} className="hidden" />
                                                <span className={`text-xs font-black uppercase ${reqRoleType === role ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>{t(`loginModal.roles.${role}`)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldName')}</label>
                                    <input required type="text" value={reqName} onChange={e => setReqName(e.target.value)} 
                                        placeholder={t('registrationModal.placeholderName')}
                                        className={`${inputBase} ${reqName ? 'border-green-500/50' : 'border-gray-200 dark:border-gray-700'}`} />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldCompany')}</label>
                                    <input required type="text" value={reqCompany} onChange={e => setReqCompany(e.target.value)} 
                                        placeholder={t('registrationModal.placeholderCompany')}
                                        className={`${inputBase} ${reqCompany ? 'border-green-500/50' : 'border-gray-200 dark:border-gray-700'}`} />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldPhone')}</label>
                                    <input required type="tel" value={reqPhone} onChange={e => setReqPhone(e.target.value)} 
                                        placeholder="+380..."
                                        className={`${inputBase} ${getStatusClass(isPhoneValid, reqPhone)}`} />
                                    {!isPhoneValid && reqPhone && <p className="text-[9px] text-red-500 mt-1 font-bold tracking-tight">Формат: +380XXXXXXXXX</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldEmail')}</label>
                                    <input required type="email" value={reqEmail} onChange={e => setReqEmail(e.target.value)} 
                                        placeholder="email@example.com"
                                        className={`${inputBase} ${getStatusClass(isEmailValid, reqEmail)}`} />
                                </div>
                                
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldPassword')}</label>
                                    <input required type="password" value={reqPassword} onChange={e => setReqPassword(e.target.value)} 
                                        className={`${inputBase} ${getStatusClass(isPasswordValid, reqPassword)}`} />
                                    
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 bg-gray-50/50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasMinLen ? 'text-green-500 scale-105' : 'text-gray-400'}`}>
                                            <Icon name={hasMinLen ? 'check-circle' : 'hr'} className={`w-3 h-3 ${hasMinLen ? 'text-green-500' : 'text-gray-300'}`} />
                                            8+ символів
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasNumber ? 'text-green-500 scale-105' : 'text-gray-400'}`}>
                                            <Icon name={hasNumber ? 'check-circle' : 'hr'} className={`w-3 h-3 ${hasNumber ? 'text-green-500' : 'text-gray-300'}`} />
                                            Цифра
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasUpper ? 'text-green-500 scale-105' : 'text-gray-400'}`}>
                                            <Icon name={hasUpper ? 'check-circle' : 'hr'} className={`w-3 h-3 ${hasUpper ? 'text-green-500' : 'text-gray-300'}`} />
                                            Велика літера
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasLower ? 'text-green-500 scale-105' : 'text-gray-400'}`}>
                                            <Icon name={hasLower ? 'check-circle' : 'hr'} className={`w-3 h-3 ${hasLower ? 'text-green-500' : 'text-gray-300'}`} />
                                            Мала літера
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldPasswordConfirm')}</label>
                                    <input required type="password" value={reqPasswordConfirm} onChange={e => setReqPasswordConfirm(e.target.value)} 
                                        className={`${inputBase} ${getStatusClass(isPasswordMatch, reqPasswordConfirm)}`} />
                                </div>
                                
                                {error && <div className="sm:col-span-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-xl border border-red-100 dark:border-red-800">{error}</div>}

                                <div className="sm:col-span-2 flex gap-3 pt-2">
                                    <button type="button" onClick={() => setView('login')} className="flex-1 py-4 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors text-sm uppercase tracking-widest border border-gray-200 dark:border-gray-700">{t('common.cancel')}</button>
                                    <button type="submit" disabled={!isFormValid || isLoading} className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'}`}>
                                        {isLoading ? '...' : t('registrationModal.buttonSubmit')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'success' && (
                        <div className="animate-fade-in text-center py-10">
                            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-inner">
                                <Icon name="check-circle" className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white">{t('registrationModal.successTitle')}</h2>
                            <p className="text-gray-500 mb-10 leading-relaxed px-6">{t('registrationModal.successDescription')}</p>
                            <button onClick={onClose} className="w-full max-w-xs py-5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">{t('registrationModal.buttonClose')}</button>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-900/50 p-8 border-l border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">{t('loginModal.accessLevelsTitle')}</h3>
                    <div className="space-y-6">
                        {roleInfo.map(info => (
                            <div key={info.role} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-blue-500 border border-gray-100 dark:border-gray-700">
                                    <Icon name={info.icon as any} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{info.title}</p>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{info.desc}</p>
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
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t('loginModal.defaultLevelDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export const RegistrationRequestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return null; 
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
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('editorModal.labelTitle')}</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" required /></div>
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('editorModal.labelCategory')}</label><select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold">{availableCategories.map(cat => <option key={cat.id} value={cat.nameKey}>{t(cat.nameKey)}</option>)}</select></div>
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('editorModal.labelTags')}</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" placeholder={t('editorModal.placeholderTags')}/></div>
                    <div className="flex justify-end gap-3 pt-6"><button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">Скасувати</button><button type="submit" className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">Зберегти</button></div>
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
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('categoryEditorModal.labelName')}</label><input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" required /></div>
                    <div><label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('categoryEditorModal.labelPermissions')}</label><div className="grid grid-cols-2 gap-3 mt-2">{roles.map(role => (<label key={role} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl cursor-pointer border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"><input type="checkbox" checked={permissions.includes(role)} onChange={() => togglePermission(role)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{t(`roles.${role}`)}</span></label>))}</div></div>
                    <div className="flex justify-end gap-3 pt-6"><button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">Скасувати</button><button type="submit" className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">Зберегти</button></div>
                </form>
            </div>
        </div>
    );
};
