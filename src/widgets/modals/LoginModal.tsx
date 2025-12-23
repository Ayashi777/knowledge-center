import React, { useState, useEffect } from 'react';
import { UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '@shared/ui/icons';
import { AuthApi } from "@shared/api/firebase/auth";

export const LoginModal: React.FC<{ 
    onClose: () => void, 
    context: 'view' | 'download' | 'login',
    initialView?: 'login' | 'request'
}> = ({ onClose, context, initialView = 'login' }) => {
    const { t } = useI18n();
    const [view, setView] = useState<'login' | 'request' | 'success'>(initialView);
    
    // Login form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Request form state
    const [reqName, setReqName] = useState('');
    const [reqCompany, setReqCompany] = useState('');
    const [reqEmail, setReqEmail] = useState('');
    const [reqPassword, setReqPassword] = useState('');
    const [reqPasswordConfirm, setReqPasswordConfirm] = useState('');
    const [reqPhone, setReqPhone] = useState('');
    const [reqRoleType, setReqRoleType] = useState<UserRole | ''>(''); 
    const [showReqPassword, setShowReqPassword] = useState(false);
    const [showReqPasswordConfirm, setShowReqPasswordConfirm] = useState(false);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Password Validation logic
    const hasMinLen = reqPassword.length >= 8;
    const hasNumber = /[0-9]/.test(reqPassword);
    const hasUpper = /[A-Z]/.test(reqPassword);
    const hasLower = /[a-z]/.test(reqPassword);
    const isPasswordValid = hasMinLen && hasNumber && hasUpper && hasLower;
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
            await AuthApi.login(email, password);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(t('loginModal.error') || "Помилка авторизації.");
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
            await AuthApi.register({
                email: reqEmail,
                password: reqPassword,
                name: reqName,
                company: reqCompany,
                phone: reqPhone,
                requestedRole: reqRoleType as UserRole,
            });
            setView('success');
        } catch (error: any) {
            console.error(error);
            setError(error.code === 'auth/email-already-in-use' ? t('userEditorModal.emailInUse') : t('common.error'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const selectableRoles: UserRole[] = ['foreman', 'engineer', 'architect'];
    const roleInfo = [
        { role: 'foreman', icon: 'construction' },
        { role: 'engineer', icon: 'it' },
        { role: 'architect', icon: 'view-boards' }
    ];

    const getStatusClass = (valid: boolean, value: string) => {
        if (!value) return "border-gray-200 dark:border-gray-700";
        return valid ? "border-green-500 ring-1 ring-green-500/30" : "border-red-500 ring-1 ring-red-500/30";
    };

    const inputBase = "w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border rounded-xl focus:ring-2 focus:ring-inset outline-none dark:text-white text-sm font-semibold transition-all";

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row border border-white/10 relative" onClick={e => e.stopPropagation()}>
                
                {/* 🔥 Navigation Bar (Back & Close Icons) */}
                <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 pointer-events-none z-10">
                    <div className="pointer-events-auto">
                        {(view === 'request' || view === 'success') && (
                            <button 
                                onClick={() => view === 'success' ? setView('login') : setView('login')}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                                title={t('common.back')}
                            >
                                <Icon name="chevron-left" className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                    <div className="pointer-events-auto">
                        <button 
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                            title={t('common.cancel')}
                        >
                            <Icon name="x-mark" className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-8 md:p-12 md:pt-20 bg-white dark:bg-gray-800 flex flex-col justify-center min-h-[500px]">
                    {view === 'login' && (
                        <div className="animate-fade-in">
                            <div className="mb-10 pt-4">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('loginModal.welcome')}</h2>
                                <p className="text-gray-500 text-sm">{t('loginModal.subtitle')}</p>
                            </div>
                            <form onSubmit={handleLoginSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 tracking-widest">{t('loginModal.emailLabel')}</label>
                                    <input autoFocus type="email" required value={email} onChange={e => setEmail(e.target.value)} className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-blue-500`} placeholder="name@company.com" />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1.5 tracking-widest">{t('loginModal.passwordLabel')}</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            required 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            className={`${inputBase} border-gray-200 dark:border-gray-700 focus:ring-blue-500 pr-12`} 
                                            placeholder="••••••••" 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-xs text-red-600 font-bold">{error}</div>}
                                <button type="submit" disabled={isLoading} className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all ${isLoading ? 'opacity-50 cursor-wait' : ''}`}>{isLoading ? t('loginModal.processing') : t('loginModal.submitButton')}</button>
                            </form>
                            <div className="mt-8 text-center">
                                <button onClick={() => setView('request')} className="text-sm font-bold text-blue-600 hover:underline">
                                    {t('loginModal.noAccount')}
                                </button>
                            </div>
                        </div>
                    )}

                    {view === 'request' && (
                        <div className="animate-fade-in max-h-[80vh] overflow-y-auto px-1 py-1 mt-4">
                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('registrationModal.title')}</h2>
                                <p className="text-gray-500 text-xs leading-relaxed">{t('registrationModal.description')}</p>
                            </div>
                            <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldRoleType')}</label>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        {selectableRoles.map(role => (
                                            <label key={role} className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-center text-center ${reqRoleType === role ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                                <input type="radio" name="roleType" value={role} checked={reqRoleType === role} onChange={() => setReqRoleType(role)} className="hidden" />
                                                <span className={`text-[10px] font-black uppercase leading-tight ${reqRoleType === role ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500'}`}>{t(`roles.${role}`)}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="sm:col-span-2"><label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldName')}</label><input required type="text" value={reqName} onChange={e => setReqName(e.target.value)} placeholder={t('registrationModal.placeholderName')} className={`${inputBase} ${reqName ? 'border-green-500/50' : 'border-gray-200 dark:border-gray-700'}`} /></div>
                                <div><label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldCompany')}</label><input required type="text" value={reqCompany} onChange={e => setReqCompany(e.target.value)} placeholder={t('registrationModal.placeholderCompany')} className={`${inputBase} ${reqCompany ? 'border-green-500/50' : 'border-gray-200 dark:border-gray-700'}`} /></div>
                                <div><label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldPhone')}</label><input required type="tel" value={reqPhone} onChange={e => setReqPhone(e.target.value)} placeholder="+380..." className={`${inputBase} ${getStatusClass(isPhoneValid, reqPhone)}`} />{!isPhoneValid && reqPhone && <p className="text-[9px] text-red-500 mt-1 font-bold tracking-tight">Формат: +380XXXXXXXXX</p>}</div>
                                <div className="sm:col-span-2"><label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldEmail')}</label><input required type="email" value={reqEmail} onChange={e => setReqEmail(e.target.value)} placeholder="email@example.com" className={`${inputBase} ${getStatusClass(isEmailValid, reqEmail)}`} /></div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldPassword')}</label>
                                    <div className="relative">
                                        <input 
                                            required 
                                            type={showReqPassword ? "text" : "password"} 
                                            value={reqPassword} 
                                            onChange={e => setReqPassword(e.target.value)} 
                                            className={`${inputBase} ${getStatusClass(isPasswordValid, reqPassword)} pr-12`} 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowReqPassword(!showReqPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Icon name={showReqPassword ? 'eye-off' : 'eye'} className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 bg-gray-50/50 dark:bg-black/20 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasMinLen ? 'text-green-500 scale-105' : 'text-gray-400'}`}><Icon name={hasMinLen ? 'check' : 'x-mark'} className="w-3 h-3" />8+ символів</div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasNumber ? 'text-green-500 scale-105' : 'text-gray-400'}`}><Icon name={hasNumber ? 'check' : 'x-mark'} className="w-3 h-3" />Цифра</div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasUpper ? 'text-green-500 scale-105' : 'text-gray-400'}`}><Icon name={hasUpper ? 'check' : 'x-mark'} className="w-3 h-3" />Велика літера</div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tighter transition-all ${hasLower ? 'text-green-500 scale-105' : 'text-gray-400'}`}><Icon name={hasLower ? 'check' : 'x-mark'} className="w-3 h-3" />Мала літера</div>
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 tracking-widest">{t('registrationModal.fieldPasswordPasswordConfirm') || t('registrationModal.fieldPasswordConfirm')}</label>
                                    <div className="relative">
                                        <input 
                                            required 
                                            type={showReqPasswordConfirm ? "text" : "password"} 
                                            value={reqPasswordConfirm} 
                                            onChange={e => setReqPasswordConfirm(e.target.value)} 
                                            className={`${inputBase} ${getStatusClass(isPasswordMatch, reqPasswordConfirm)} pr-12`} 
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowReqPasswordConfirm(!showReqPasswordConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Icon name={showReqPasswordConfirm ? 'eye-off' : 'eye'} className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                {error && <div className="sm:col-span-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-bold rounded-xl border border-red-100 dark:border-red-800">{error}</div>}
                                <div className="sm:col-span-2 flex gap-3 pt-2">
                                    <button type="submit" disabled={!isFormValid || isLoading} className={`flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'}`}>{isLoading ? '...' : t('registrationModal.buttonSubmit')}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'success' && (
                        <div className="animate-fade-in text-center py-10">
                            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600 shadow-inner"><Icon name="check" className="w-12 h-12" /></div>
                            <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-white">{t('registrationModal.successTitle')}</h2>
                            <p className="text-gray-500 mb-10 leading-relaxed px-6">{t('registrationModal.successDescription')}</p>
                            <button onClick={handleGoHome} className="w-full max-w-xs py-5 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all uppercase tracking-widest text-sm">{t('registrationModal.buttonClose')}</button>
                        </div>
                    )}
                </div>

                <div className="w-full md:w-80 bg-gray-50 dark:bg-gray-900/50 p-8 pt-20 border-l border-gray-100 dark:border-gray-800 flex flex-col justify-center">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">{t('loginModal.accessLevelsTitle')}</h3>
                    <div className="space-y-6">
                        {roleInfo.map(info => (
                            <div key={info.role} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-blue-500 border border-gray-100 dark:border-gray-700">
                                    <Icon name={info.icon as any} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{t(`roles.${info.role}`)}</p>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t(`roles.${info.role}Desc`)}</p>
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
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{t('roles.guestDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
