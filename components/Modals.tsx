import React, { useState, useEffect } from 'react';
import { UserRole, Document, Category, IconName } from '../types';
import { useI18n } from '../i18n';
import { Icon } from './icons';

export const LoginModal: React.FC<{ onLogin: (role: UserRole) => void; onClose: () => void; context: 'view' | 'download' | 'login' }> = ({ onLogin, onClose, context }) => {
    const { t } = useI18n();
    const [step, setStep] = useState<'selection' | 'password'>('selection');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const roles: { role: UserRole, label: string, description: string }[] = [
        { role: 'foreman', label: t('loginModal.roles.foreman'), description: t('loginModal.roles.foremanDesc') },
        { role: 'designer', label: t('loginModal.roles.designer'), description: t('loginModal.roles.designerDesc') },
        { role: 'admin', label: t('loginModal.roles.admin'), description: t('loginModal.roles.adminDesc') },
    ];

    const handleRoleSelect = (role: UserRole) => {
        if (role === 'admin') {
            setStep('password');
        } else {
            onLogin(role);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded password for simulation
        if (password === 'admin2025') {
            onLogin('admin');
        } else {
            setError(t('common.incorrectPassword'));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                {step === 'selection' ? (
                    <>
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-600/20 mb-4">
                                <Icon name="lock-closed" className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('loginModal.accessRequired')}</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">{t(`loginModal.context.${context}`)}</p>
                        </div>
                        <div className="space-y-3">
                            {roles.map(({ role, label, description }) => (
                                <button key={role} type="button" onClick={() => handleRoleSelect(role as UserRole)} className="w-full text-left p-4 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                                    <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <form onSubmit={handlePasswordSubmit} className="animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                                <Icon name="cog" className="h-6 w-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('loginModal.adminPasswordTitle')}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('loginModal.adminPasswordDesc')}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.password')}</label>
                                <input 
                                    autoFocus
                                    type="password" 
                                    value={password} 
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder="••••••••"
                                />
                                {error && <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>}
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setStep('selection')}
                                    className="flex-1 px-4 py-2 text-sm font-bold text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-lg"
                                >
                                    {t('common.login')}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                 <div className="mt-6 text-center">
                    <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors underline">{t('common.cancel')}</button>
                </div>
            </div>
        </div>
    );
};

export const RegistrationRequestModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const [status, setStatus] = useState<'form' | 'success'>('form');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [activity, setActivity] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const isFormValid = name.trim() && company.trim() && email.includes('@') && phone.trim() && activity.trim();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            console.log('Form submitted:', { name, company, email, phone, activity });
            setStatus('success');
        }
    };

    if (status === 'success') {
        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-md p-8 text-center" onClick={e => e.stopPropagation()}>
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                        <Icon name="paper-airplane" className="h-8 w-8 text-green-600 dark:text-green-400 -rotate-45" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('registrationModal.successTitle')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{t('registrationModal.successDescription')}</p>
                    <button onClick={onClose} className="w-full px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">{t('registrationModal.buttonClose')}</button>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('registrationModal.title')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('registrationModal.description')}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="reg-name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('registrationModal.fieldName')}</label>
                        <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2.5 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('registrationModal.placeholderName')} required />
                    </div>
                     <div>
                        <label htmlFor="reg-company" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('registrationModal.fieldCompany')}</label>
                        <input id="reg-company" type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2.5 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('registrationModal.placeholderCompany')} required />
                    </div>
                    <div>
                        <label htmlFor="reg-activity" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('registrationModal.fieldActivity')}</label>
                        <input id="reg-activity" type="text" value={activity} onChange={e => setActivity(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2.5 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('registrationModal.placeholderActivity')} required />
                    </div>
                    <div>
                        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('registrationModal.fieldEmail')}</label>
                        <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2.5 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('registrationModal.placeholderEmail')} required />
                    </div>
                    <div>
                        <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('registrationModal.fieldPhone')}</label>
                        <input id="reg-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2.5 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('registrationModal.placeholderPhone')} required />
                    </div>
                    <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
                        <button type="button" onClick={onClose} className="mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('common.cancel')}</button>
                        <button type="submit" disabled={!isFormValid} className="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">{t('registrationModal.buttonSubmit')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const DocumentEditorModal: React.FC<{ doc: Partial<Document> | null, onSave: (doc: Partial<Document>) => void, onClose: () => void, availableCategories: Category[] }> = ({ doc, onSave, onClose, availableCategories }) => {
    const { t } = useI18n();
    const [title, setTitle] = useState((doc?.titleKey ? t(doc.titleKey) : doc?.title) || '');
    const [category, setCategory] = useState(doc?.categoryKey || availableCategories[0]?.nameKey || '');
    const [tags, setTags] = useState(doc?.tags?.join(', ') || '');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const docToSave: Partial<Document> = {
            id: doc?.id,
            title: title,
            categoryKey: category,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        onSave(docToSave);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{doc?.id ? t('editorModal.editTitle') : t('editorModal.createTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="doc-title" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelTitle')}</label>
                        <input id="doc-title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                     <div className="mb-4">
                        <label htmlFor="doc-category" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelCategory')}</label>
                        <select id="doc-category" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
                            {availableCategories.map(cat => <option key={cat.id} value={cat.nameKey}>{t(cat.nameKey)}</option>)}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="doc-tags" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('editorModal.labelTags')}</label>
                        <input id="doc-tags" type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" placeholder={t('editorModal.placeholderTags')}/>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">{t('common.save')}</button>
                    </div>
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

    const togglePermission = (role: UserRole) => {
        setPermissions(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...category, nameKey, iconName, viewPermissions: permissions });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('categoryEditorModal.editTitle')}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('categoryEditorModal.labelName')}</label>
                        <input type="text" value={nameKey} onChange={e => setNameKey(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{t('categoryEditorModal.labelPermissions')}</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {roles.map(role => (
                                <label key={role} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md cursor-pointer border border-gray-200 dark:border-gray-600">
                                    <input type="checkbox" checked={permissions.includes(role)} onChange={() => togglePermission(role)} className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{t(`roles.${role}`)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
