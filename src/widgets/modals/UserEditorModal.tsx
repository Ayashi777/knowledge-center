import React, { useState } from 'react';
import { UserRole, UserProfile } from '../../../types';
import { useI18n } from '../../../i18n';

export const UserEditorModal: React.FC<{ user: UserProfile, onSave: (user: Partial<UserProfile>) => void, onClose: () => void }> = ({ user, onSave, onClose }) => {
    const { t } = useI18n();
    const [name, setName] = useState(user.name || '');
    const [company, setCompany] = useState(user.company || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [email, setEmail] = useState(user.email || '');
    const [role, setRole] = useState(user.role);

    const roles: UserRole[] = ['guest', 'foreman', 'designer', 'architect', 'admin'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ uid: user.uid, name, company, phone, role, email });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-lg p-8 border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{t('userEditorModal.title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('userEditorModal.labelName')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" required />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('userEditorModal.labelCompany')}</label>
                        <input type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('userEditorModal.labelPhone')}</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold" />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                            {t('loginModal.emailLabel')}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                            required
                        />
                        <p className="text-[10px] text-amber-600 mt-1 font-bold uppercase">
                            * Зміна пошти також оновить логін користувача в системі.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('userEditorModal.labelRole')}</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold">
                            {roles.map(r => <option key={r} value={r}>{t(`roles.${r}`)}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <button type="button" onClick={onClose} className="px-8 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 transition-colors">{t('common.cancel')}</button>
                        <button type="submit" className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all uppercase tracking-widest text-xs">{t('common.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
